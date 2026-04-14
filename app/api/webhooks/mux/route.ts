import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

const webhookSecret = process.env.MUX_WEBHOOK_SECRET || '';

function verifyMuxSignature(body: string, signature: string | null): boolean {
  if (!webhookSecret || !signature) {
    console.warn('Mux webhook signature verification skipped - no secret configured');
    return !webhookSecret; // Only skip if secret is not configured
  }

  const parts = signature.split(',');
  const timestampPart = parts.find(p => p.startsWith('t='));
  const signaturePart = parts.find(p => p.startsWith('v1='));

  if (!timestampPart || !signaturePart) return false;

  const timestamp = timestampPart.split('=')[1];
  const expectedSig = signaturePart.split('=')[1];

  const payload = `${timestamp}.${body}`;
  const hmac = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

interface MuxWebhookEvent {
  type: string;
  data: {
    id: string;
    status?: string;
    playback_ids?: Array<{ id: string; policy: string }>;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('mux-signature');

  if (!verifyMuxSignature(body, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: MuxWebhookEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'video.live_stream.active': {
        const muxStreamId = event.data.id;

        // Update stream status to live
        const { error } = await supabase
          .from('streams')
          .update({
            status: 'active',
            started_at: new Date().toISOString(),
          })
          .eq('mux_stream_id', muxStreamId);

        if (error) {
          console.error('Error updating stream to active:', error);
        }

        // Also update the artist's is_live flag
        const { data: stream } = await supabase
          .from('streams')
          .select('artist_id')
          .eq('mux_stream_id', muxStreamId)
          .single();

        if (stream) {
          await supabase
            .from('artists')
            .update({ is_live: true, current_stream_id: stream.artist_id })
            .eq('id', stream.artist_id);
        }

        console.log(`Stream ${muxStreamId} is now live`);
        break;
      }

      case 'video.live_stream.idle': {
        const muxStreamId = event.data.id;

        // Update stream status to ended
        const { data: stream, error } = await supabase
          .from('streams')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString(),
          })
          .eq('mux_stream_id', muxStreamId)
          .select('artist_id')
          .single();

        if (error) {
          console.error('Error updating stream to ended:', error);
        }

        // Update the artist's is_live flag
        if (stream) {
          await supabase
            .from('artists')
            .update({ is_live: false, current_stream_id: null })
            .eq('id', stream.artist_id);
        }

        console.log(`Stream ${muxStreamId} is now idle/ended`);
        break;
      }

      default:
        console.log(`Unhandled Mux event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Error processing Mux webhook:', err);
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return Response.json({ received: true });
}
