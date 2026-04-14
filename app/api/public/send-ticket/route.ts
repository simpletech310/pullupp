import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  email: z.string().email(),
  eventTitle: z.string().min(1),
  eventDate: z.string(),
  venueName: z.string(),
  venueCity: z.string(),
  tierName: z.string(),
  quantity: z.number().int().min(1),
  total: z.number(),
  confirmationCode: z.string().optional(),
  sessionId: z.string(),
  ticketQrCodes: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parse = schema.safeParse(body);
    if (!parse.success) {
      return Response.json({ error: parse.error.issues[0].message }, { status: 400 });
    }

    const { email, eventTitle, eventDate, venueName, venueCity, tierName, quantity, total, confirmationCode, sessionId, ticketQrCodes } = parse.data;

    const code = confirmationCode || sessionId.slice(-8).toUpperCase();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0F0F13;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:900;color:#fff;">Pull<span style="color:#FF6B35;">Upp</span></span>
    </div>

    <!-- Success -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(16,185,129,0.15);border:2px solid #10B981;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:28px;">✓</span>
      </div>
      <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff;">You're in!</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#888;">Your tickets have been confirmed.</p>
    </div>

    <!-- Ticket Card -->
    <div style="background:#1A1A23;border:1px solid #2a2a35;border-radius:16px;overflow:hidden;margin-bottom:24px;">
      <!-- Gradient bar -->
      <div style="height:6px;background:linear-gradient(135deg,#FF6B35,#FF8C42);"></div>

      <div style="padding:24px;">
        <h2 style="margin:0 0 4px;font-size:20px;font-weight:800;color:#fff;">${eventTitle}</h2>
        <p style="margin:0 0 20px;font-size:13px;color:#888;">${eventDate} &bull; ${venueName}, ${venueCity}</p>

        <div style="display:flex;gap:12px;margin-bottom:20px;">
          <div style="flex:1;background:#0F0F13;border-radius:10px;padding:12px;">
            <p style="margin:0 0 2px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.05em;">Tier</p>
            <p style="margin:0;font-size:14px;font-weight:700;color:#fff;">${tierName}</p>
          </div>
          <div style="background:#0F0F13;border-radius:10px;padding:12px;min-width:60px;text-align:center;">
            <p style="margin:0 0 2px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.05em;">Qty</p>
            <p style="margin:0;font-size:20px;font-weight:800;color:#FF6B35;">${quantity}</p>
          </div>
        </div>

        <!-- Divider -->
        <div style="border-top:2px dashed #2a2a35;margin:20px -24px;position:relative;">
          <div style="position:absolute;left:-8px;top:-9px;width:16px;height:16px;border-radius:50%;background:#0F0F13;"></div>
          <div style="position:absolute;right:-8px;top:-9px;width:16px;height:16px;border-radius:50%;background:#0F0F13;"></div>
        </div>

        <!-- Confirmation Code -->
        <div style="text-align:center;padding:16px 0 0;">
          <p style="margin:0 0 6px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.1em;">Confirmation Code</p>
          <p style="margin:0;font-size:24px;font-weight:900;color:#fff;letter-spacing:.2em;font-family:monospace;">${code}</p>
        </div>

        ${ticketQrCodes && ticketQrCodes.length > 0 ? `
        <!-- QR Codes -->
        <div style="margin-top:20px;border-top:1px solid #2a2a35;padding-top:16px;">
          <p style="margin:0 0 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.1em;text-align:center;">Your Ticket${ticketQrCodes.length > 1 ? 's' : ''} — Show at Door</p>
          <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
            ${ticketQrCodes.map((uuid, i) => `
            <div style="text-align:center;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(uuid)}&bgcolor=ffffff&color=000000" width="150" height="150" alt="Ticket ${i + 1} QR Code" style="border-radius:8px;"/>
              ${ticketQrCodes.length > 1 ? `<p style="margin:4px 0 0;font-size:11px;color:#666;">Ticket ${i + 1}</p>` : ''}
            </div>`).join('')}
          </div>
        </div>` : ''}
      </div>
    </div>

    <!-- Total -->
    <div style="background:#1A1A23;border:1px solid #2a2a35;border-radius:12px;padding:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:14px;color:#888;">Total Paid</span>
      <span style="font-size:18px;font-weight:800;color:#FF6B35;">$${total.toFixed(2)}</span>
    </div>

    <!-- Check-in note -->
    <div style="background:rgba(20,184,166,0.08);border:1px solid rgba(20,184,166,0.2);border-radius:12px;padding:16px;margin-bottom:32px;">
      <p style="margin:0;font-size:13px;color:#14B8A6;text-align:center;">
        📲 Show this email or your confirmation code at the door for check-in.
      </p>
    </div>

    <p style="margin:0;font-size:12px;color:#444;text-align:center;">
      PullUpp &bull; Atlanta's Premier Event Platform
    </p>
  </div>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: 'PullUpp <tickets@pullupp.com>',
      to: email,
      subject: `Your tickets for ${eventTitle} 🎫`,
      html,
    });

    if (error) {
      console.error('Resend error:', JSON.stringify(error));
      return Response.json({ error: (error as any).message || 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
