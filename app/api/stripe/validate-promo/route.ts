import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { code, eventId } = await request.json();

    if (!code || !eventId) {
      return Response.json({ valid: false, error: 'Missing code or event ID' });
    }

    const supabase = await createClient();

    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('event_id', eventId)
      .single();

    if (!promo) {
      return Response.json({ valid: false, error: 'Invalid promo code' });
    }

    if (promo.used_count >= promo.max_uses) {
      return Response.json({ valid: false, error: 'Promo code expired' });
    }

    return Response.json({
      valid: true,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
    });
  } catch {
    return Response.json({ valid: false, error: 'Failed to validate promo code' }, { status: 500 });
  }
}
