export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Email] Would send to ${to}: ${subject}`);
    return { success: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'PullUpp <noreply@pullupp.com>',
        to,
        subject,
        html,
      }),
    });
    const data = await res.json();
    return { success: res.ok, error: data.error };
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return { success: false, error };
  }
}
