import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { transferSchema } from '@/lib/validation/schemas';

// TODO: Ensure STRIPE_SECRET_KEY is set in .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

interface TransferBody {
  bookingId: string;
  amount: number;
  destinationAccountId: string;
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
    const parseResult = transferSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }
    const { bookingId, amount, destinationAccountId } = parseResult.data;

    // Verify the booking exists and belongs to the requesting user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, requester_id, provider_id, status, final_amount')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only the requester can initiate a transfer
    if (booking.requester_id !== user.id) {
      return Response.json(
        { error: 'Only the booking requester can initiate a transfer' },
        { status: 403 },
      );
    }

    if (booking.status !== 'accepted') {
      return Response.json(
        { error: 'Booking must be in accepted status to process a transfer' },
        { status: 400 },
      );
    }

    // Verify destination account exists
    try {
      await stripe.accounts.retrieve(destinationAccountId);
    } catch {
      return Response.json(
        { error: 'Invalid destination account' },
        { status: 400 },
      );
    }

    // Create the transfer
    const amountInCents = Math.round(amount * 100);

    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'usd',
      destination: destinationAccountId,
      transfer_group: `booking_${bookingId}`,
      metadata: {
        booking_id: bookingId,
        requester_id: user.id,
        provider_id: booking.provider_id,
      },
    });

    // Update booking status
    await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId);

    return Response.json({ transferId: transfer.id });
  } catch (err) {
    console.error('Error creating transfer:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
