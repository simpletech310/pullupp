import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { tipPaymentSchema } from '@/lib/validation/schemas';

// TODO: Ensure STRIPE_SECRET_KEY is set in .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

interface TipPaymentBody {
  artistId: string;
  amount: number;
  context?: 'profile' | 'live' | 'event';
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = tipPaymentSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }
    const { artistId, amount, context = 'profile' } = parseResult.data;
    const message = body.message as string | undefined;

    // Fetch artist and their Connect account
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id, user_id, name')
      .eq('id', artistId)
      .single();

    if (artistError || !artist) {
      return Response.json({ error: 'Artist not found' }, { status: 404 });
    }

    const { data: artistProfile } = await supabase
      .from('profiles')
      .select('stripe_connect_id')
      .eq('id', artist.user_id)
      .single();

    if (!artistProfile?.stripe_connect_id) {
      return Response.json(
        { error: 'Artist has not set up their payment account' },
        { status: 400 },
      );
    }

    // Create PaymentIntent with transfer to artist's Connect account
    const amountInCents = Math.round(amount * 100);
    const platformFee = Math.round(amountInCents * 0.05); // 5% platform fee

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        type: 'tip',
        artist_id: artistId,
        tipper_id: user.id,
        context,
        message: message || '',
      },
      application_fee_amount: platformFee,
      transfer_data: {
        destination: artistProfile.stripe_connect_id,
      },
      description: `Tip for ${artist.name}`,
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating tip payment:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
