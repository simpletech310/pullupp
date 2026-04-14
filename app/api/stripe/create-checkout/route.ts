import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { SERVICE_FEE_PERCENT } from '@/lib/utils/constants';
import { checkoutSchema } from '@/lib/validation/schemas';

// TODO: Ensure STRIPE_SECRET_KEY is set in .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

interface CheckoutBody {
  eventId: string;
  tierId: string;
  quantity: number;
  addonIds?: string[];
  promoCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth is optional — guests can checkout without an account
    const { data: { user } } = await supabase.auth.getUser();

    // Use service role for all DB reads to bypass anon GRANT restrictions
    const db = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const body = await request.json();
    const parseResult = checkoutSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }
    const { eventId, tierId, quantity, addonIds = [], promoCode } = parseResult.data;

    // Fetch the event
    const { data: event, error: eventError } = await db
      .from('events')
      .select('id, title, organizer_id, status')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.status !== 'published') {
      return Response.json({ error: 'Event is not available for purchase' }, { status: 400 });
    }

    // Fetch the tier
    const { data: tier, error: tierError } = await db
      .from('ticket_tiers')
      .select('id, name, price, remaining')
      .eq('id', tierId)
      .eq('event_id', eventId)
      .single();

    if (tierError || !tier) {
      return Response.json({ error: 'Ticket tier not found' }, { status: 404 });
    }

    if (tier.remaining < quantity) {
      return Response.json(
        { error: `Only ${tier.remaining} tickets remaining for this tier` },
        { status: 400 },
      );
    }

    // Build line items
    const lineItems: Array<{price_data: {currency: string; product_data: {name: string; description?: string}; unit_amount: number}; quantity: number}> = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${event.title} - ${tier.name}`,
            description: `Ticket for ${event.title}`,
          },
          unit_amount: Math.round(tier.price * 100),
        },
        quantity,
      },
    ];

    // Fetch and add addons
    let addonTotal = 0;
    if (addonIds.length > 0) {
      const { data: addons } = await db
        .from('event_addons')
        .select('id, name, price')
        .in('id', addonIds)
        .eq('event_id', eventId);

      if (addons) {
        for (const addon of addons) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: addon.name,
                description: `Add-on for ${event.title}`,
              },
              unit_amount: Math.round(addon.price * 100),
            },
            quantity: 1,
          });
          addonTotal += addon.price;
        }
      }
    }

    // Apply promo code discount (if provided)
    let discounts: Array<{coupon?: string; promotion_code?: string}> = [];
    if (promoCode) {
      const { data: promo } = await db
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('event_id', eventId)
        .single();

      if (promo && promo.used_count < promo.max_uses) {
        const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
        if (!isExpired) {
          // TODO: Create a Stripe coupon for the promo code discount
          // For now, we include the promo info in metadata for post-processing
          console.log(`Promo code ${promoCode} applied: ${promo.discount_type} ${promo.discount_value}`);
        }
      }
    }

    // Calculate platform fee (5% of subtotal)
    const subtotal = tier.price * quantity + addonTotal;
    const applicationFeeAmount = Math.round(subtotal * SERVICE_FEE_PERCENT * 100);

    // Get organizer's Stripe Connect account
    const { data: organizer } = await db
      .from('profiles')
      .select('stripe_connect_id')
      .eq('id', event.organizer_id)
      .single();

    // Build checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: lineItems,
      success_url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`,
      metadata: {
        event_id: eventId,
        user_id: user?.id ?? '',
        tier_id: tierId,
        quantity: quantity.toString(),
        addon_ids: JSON.stringify(addonIds),
      },
      ...(user?.email ? { customer_email: user.email } : {}),
    };

    // Add Connect destination if organizer has a connected account
    if (organizer?.stripe_connect_id) {
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: organizer.stripe_connect_id,
        },
      };
    }

    if (discounts.length > 0) {
      sessionParams.discounts = discounts;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
