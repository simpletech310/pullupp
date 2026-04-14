import { NextRequest } from 'next/server';
import Mux from '@mux/mux-node';
import { createClient } from '@/lib/supabase/server';
import { createUploadSchema } from '@/lib/validation/schemas';

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

    // Parse optional cors_origin from body
    let corsOrigin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '*';
    try {
      const body = await request.json();
      const parseResult = createUploadSchema.safeParse(body);
      if (parseResult.success && parseResult.data.corsOrigin) {
        corsOrigin = parseResult.data.corsOrigin;
      }
    } catch {
      // No body or invalid JSON - use default origin
    }

    // Create a Mux direct upload URL
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        encoding_tier: 'baseline',
      },
      cors_origin: corsOrigin,
    });

    return Response.json({
      uploadUrl: upload.url,
      assetId: upload.asset_id || null,
      uploadId: upload.id,
    });
  } catch (err) {
    console.error('Error creating Mux upload:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
