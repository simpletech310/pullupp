import { NextRequest } from 'next/server';
import Mux from '@mux/mux-node';
import { createClient } from '@/lib/supabase/server';
import { createStreamSchema } from '@/lib/validation/schemas';

// TODO: Ensure MUX_TOKEN_ID and MUX_TOKEN_SECRET are set in .env
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || '',
  tokenSecret: process.env.MUX_TOKEN_SECRET || '',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check that the user is an artist
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'artist') {
      return Response.json(
        { error: 'Only artists can create live streams' },
        { status: 403 },
      );
    }

    // Get artist record
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id, is_live')
      .eq('user_id', user.id)
      .single();

    if (artistError || !artist) {
      return Response.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    if (artist.is_live) {
      return Response.json(
        { error: 'You already have an active live stream' },
        { status: 400 },
      );
    }

    // Parse optional title from body
    let title = 'Live Stream';
    try {
      const body = await request.json();
      const parseResult = createStreamSchema.safeParse(body);
      if (parseResult.success && parseResult.data.title) {
        title = parseResult.data.title;
      }
    } catch {
      // No body or invalid JSON - use default title
    }

    // Create Mux live stream
    const liveStream = await mux.video.liveStreams.create({
      playback_policy: ['public'],
      new_asset_settings: {
        playback_policy: ['public'],
      },
      latency_mode: 'low',
    });

    const streamKey = liveStream.stream_key || '';
    const playbackId = liveStream.playback_ids?.[0]?.id || '';
    const muxStreamId = liveStream.id;

    // Save stream record to Supabase
    const { data: stream, error: streamError } = await supabase
      .from('streams')
      .insert({
        artist_id: artist.id,
        mux_stream_id: muxStreamId,
        mux_playback_id: playbackId,
        mux_stream_key: streamKey,
        title,
        status: 'idle',
        viewer_count: 0,
      })
      .select('id')
      .single();

    if (streamError) {
      console.error('Error saving stream record:', streamError);
      return Response.json({ error: 'Failed to save stream record' }, { status: 500 });
    }

    return Response.json({
      streamKey,
      playbackId,
      streamId: stream.id,
    });
  } catch (err) {
    console.error('Error creating Mux live stream:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
