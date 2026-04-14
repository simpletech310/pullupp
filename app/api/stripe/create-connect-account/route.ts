import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

// TODO: Ensure STRIPE_SECRET_KEY is set in .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role - only organizers, venue owners, and artists can connect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, stripe_connect_id, name, email')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const allowedRoles = ['organizer', 'venue_owner', 'artist'];
    if (!allowedRoles.includes(profile.role)) {
      return Response.json(
        { error: 'Only organizers, venue owners, and artists can create Connect accounts' },
        { status: 403 },
      );
    }

    let accountId = profile.stripe_connect_id;

    // Create a new Connect account if one doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: profile.email,
        metadata: {
          user_id: user.id,
          role: profile.role,
        },
        business_profile: {
          name: profile.name,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      accountId = account.id;

      // Save account ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_connect_id: accountId })
        .eq('id', user.id);
    }

    // Create Account Link for onboarding
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/stripe-connect?refresh=true`,
      return_url: `${origin}/stripe-connect?success=true`,
      type: 'account_onboarding',
    });

    return Response.json({ url: accountLink.url });
  } catch (err) {
    console.error('Error creating Connect account:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
