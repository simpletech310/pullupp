import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { SERVICE_FEE_PERCENT } from '@/lib/utils/constants';

// TODO: Ensure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set in .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe webhook signature verification failed:', message);
    return Response.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const eventId = metadata.event_id;
        const userId = metadata.user_id;
        const tierId = metadata.tier_id;
        const quantity = parseInt(metadata.quantity || '1', 10);
        const addonIds: string[] = metadata.addon_ids ? JSON.parse(metadata.addon_ids) : [];

        if (!eventId || !userId || !tierId) {
          console.error('Missing metadata in checkout session:', metadata);
          break;
        }

        // Calculate totals from session
        const subtotal = (session.amount_subtotal || 0) / 100;
        const total = (session.amount_total || 0) / 100;
        const serviceFee = subtotal * SERVICE_FEE_PERCENT;

        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            event_id: eventId,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: typeof session.payment_intent === 'string'
              ? session.payment_intent
              : null,
            status: 'completed',
            subtotal,
            service_fee: serviceFee,
            total,
          })
          .select('id')
          .single();

        if (orderError) {
          console.error('Error creating order:', orderError);
          break;
        }

        // Create tickets
        const tickets = Array.from({ length: quantity }, () => ({
          order_id: order.id,
          event_id: eventId,
          user_id: userId,
          tier_id: tierId,
          qr_code: crypto.randomUUID(),
          status: 'active' as const,
        }));

        const { error: ticketsError } = await supabase
          .from('tickets')
          .insert(tickets);

        if (ticketsError) {
          console.error('Error creating tickets:', ticketsError);
        }

        // Create order addons if any
        if (addonIds.length > 0) {
          const { data: addons } = await supabase
            .from('event_addons')
            .select('id, price')
            .in('id', addonIds);

          if (addons && addons.length > 0) {
            const orderAddons = addons.map((addon) => ({
              order_id: order.id,
              addon_id: addon.id,
              quantity: 1,
              price: addon.price,
            }));

            await supabase.from('order_addons').insert(orderAddons);
          }
        }

        // Update event attendee count
        await supabase.rpc('increment_attendee_count', {
          p_event_id: eventId,
          p_count: quantity,
        });

        // Decrement tier remaining
        await supabase.rpc('decrement_tier_remaining', {
          p_tier_id: tierId,
          p_count: quantity,
        });

        console.log(`Order ${order.id} created for event ${eventId}`);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata || {};

        // Handle tip payments
        if (metadata.type === 'tip') {
          const artistId = metadata.artist_id;
          const tipperId = metadata.tipper_id;
          const amount = (paymentIntent.amount || 0) / 100;
          const context = (metadata.context || 'profile') as 'profile' | 'live' | 'event';

          if (artistId && tipperId) {
            // Get artist's Stripe Connect account
            const { data: artist } = await supabase
              .from('artists')
              .select('user_id')
              .eq('id', artistId)
              .single();

            if (artist) {
              const { data: artistProfile } = await supabase
                .from('profiles')
                .select('stripe_connect_id')
                .eq('id', artist.user_id)
                .single();

              // Create transfer to artist's Connect account
              if (artistProfile?.stripe_connect_id) {
                try {
                  const transfer = await stripe.transfers.create({
                    amount: Math.round(amount * 0.95 * 100), // 95% goes to artist
                    currency: 'usd',
                    destination: artistProfile.stripe_connect_id,
                    transfer_group: `tip_${paymentIntent.id}`,
                  });

                  // Record the tip
                  await supabase.from('tips').insert({
                    tipper_id: tipperId,
                    artist_id: artistId,
                    amount,
                    context,
                    message: metadata.message || null,
                    stripe_payment_intent_id: paymentIntent.id,
                    stripe_transfer_id: transfer.id,
                  });

                  // Update artist tip totals
                  await supabase.rpc('increment_artist_tips', {
                    p_artist_id: artistId,
                    p_amount: amount,
                  });
                } catch (transferErr) {
                  console.error('Error creating tip transfer:', transferErr);
                }
              }
            }
          }
        }

        // Handle booking payments
        if (metadata.type === 'booking') {
          const bookingId = metadata.booking_id;
          if (bookingId) {
            await supabase
              .from('bookings')
              .update({
                stripe_payment_intent_id: paymentIntent.id,
                status: 'accepted',
              })
              .eq('id', bookingId);
          }
        }

        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;

        if (account.metadata?.user_id) {
          const isOnboarded =
            account.charges_enabled && account.payouts_enabled;

          await supabase
            .from('profiles')
            .update({
              stripe_connect_id: account.id,
              stripe_connect_onboarded: isOnboarded,
            })
            .eq('id', account.metadata.user_id);

          console.log(
            `Stripe Connect account ${account.id} updated. Onboarded: ${isOnboarded}`,
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return Response.json({ received: true });
}
