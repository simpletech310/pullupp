const BRAND_COLOR = '#FF6B35';
const BG_COLOR = '#0F0F13';
const SURFACE_COLOR = '#1A1A23';
const TEXT_COLOR = '#FFFFFF';
const TEXT_MUTED = '#9CA3AF';

function wrapper(content: string) {
  return `
    <div style="background:${BG_COLOR};padding:32px 16px;font-family:'Outfit',Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:24px;font-weight:800;color:${TEXT_COLOR};">Pull<span style="color:${BRAND_COLOR};">Upp</span></span>
        </div>
        <div style="background:${SURFACE_COLOR};border-radius:16px;padding:32px;border:1px solid #2D2D3A;">
          ${content}
        </div>
        <p style="text-align:center;color:${TEXT_MUTED};font-size:12px;margin-top:24px;">
          You received this email from PullUpp. If you didn't expect this, you can ignore it.
        </p>
      </div>
    </div>
  `;
}

export function welcomeEmail(userName: string) {
  return wrapper(`
    <h2 style="color:${TEXT_COLOR};margin:0 0 8px;">Welcome to PullUpp!</h2>
    <p style="color:${TEXT_MUTED};margin:0 0 24px;">Hey ${userName}, you're all set.</p>
    <p style="color:${TEXT_COLOR};margin:0 0 16px;">Discover events, connect with artists, and experience live entertainment in Atlanta and beyond.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pullupp.com'}/home" style="display:inline-block;background:${BRAND_COLOR};color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;">Explore Events</a>
  `);
}

export function ticketConfirmationEmail(eventTitle: string, date: string, venue: string, tierName: string, quantity: number, confirmationCode: string) {
  return wrapper(`
    <h2 style="color:${TEXT_COLOR};margin:0 0 8px;">You're In!</h2>
    <p style="color:${TEXT_MUTED};margin:0 0 24px;">Your tickets are confirmed.</p>
    <div style="background:${BG_COLOR};border-radius:12px;padding:20px;margin-bottom:20px;">
      <h3 style="color:${TEXT_COLOR};margin:0 0 8px;">${eventTitle}</h3>
      <p style="color:${TEXT_MUTED};margin:0 0 4px;">${date}</p>
      <p style="color:${TEXT_MUTED};margin:0 0 12px;">${venue}</p>
      <p style="color:${TEXT_COLOR};margin:0;">${tierName} x${quantity}</p>
      <p style="color:${BRAND_COLOR};font-family:monospace;font-size:18px;margin:12px 0 0;font-weight:700;">${confirmationCode}</p>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pullupp.com'}/tickets" style="display:inline-block;background:${BRAND_COLOR};color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;">View My Tickets</a>
  `);
}

export function bookingRequestEmail(eventName: string, requesterName: string, date: string, amount: string) {
  return wrapper(`
    <h2 style="color:${TEXT_COLOR};margin:0 0 8px;">New Booking Request</h2>
    <p style="color:${TEXT_MUTED};margin:0 0 24px;">${requesterName} wants to book you.</p>
    <div style="background:${BG_COLOR};border-radius:12px;padding:20px;margin-bottom:20px;">
      <p style="color:${TEXT_COLOR};margin:0 0 4px;"><strong>Event:</strong> ${eventName}</p>
      <p style="color:${TEXT_COLOR};margin:0 0 4px;"><strong>Date:</strong> ${date}</p>
      <p style="color:${TEXT_COLOR};margin:0;"><strong>Budget:</strong> ${amount}</p>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pullupp.com'}/bookings" style="display:inline-block;background:${BRAND_COLOR};color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;">View Request</a>
  `);
}

export function tipReceivedEmail(artistName: string, amount: string, tipperName: string) {
  return wrapper(`
    <h2 style="color:${TEXT_COLOR};margin:0 0 8px;">You Received a Tip!</h2>
    <p style="color:${TEXT_MUTED};margin:0 0 24px;">Nice one, ${artistName}!</p>
    <div style="background:${BG_COLOR};border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;">
      <p style="color:${BRAND_COLOR};font-size:32px;font-weight:800;margin:0;">${amount}</p>
      <p style="color:${TEXT_MUTED};margin:8px 0 0;">from ${tipperName}</p>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pullupp.com'}/artists/dashboard" style="display:inline-block;background:${BRAND_COLOR};color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;">View Dashboard</a>
  `);
}
