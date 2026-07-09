import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/email/mailer';

const CONTACT_EMAIL = process.env.EMAIL_FROM ?? 'info@bodytime-concept.de';

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;color:#6b7280;font-weight:500;white-space:nowrap;border-bottom:1px solid #f3f4f6;width:40%;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6;">${value}</td>
  </tr>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, phone, phone_country, email, studio, city, slots } = body;

    if (!first_name?.trim() || !last_name?.trim() || !phone?.trim()) {
      return NextResponse.json({ success: false, error: 'Pflichtfelder fehlen.' }, { status: 400 });
    }

    const slotsHtml = Array.isArray(slots) && slots.length > 0
      ? slots.filter((s: { date?: string; time?: string }) => s.date || s.time).map((s: { date?: string; time?: string }, i: number) =>
          row(`Terminwunsch ${i + 1}`, [s.date, s.time].filter(Boolean).join(' um '))
        ).join('')
      : row('Terminwünsche', '—');

    const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Neue LP-Anfrage</title></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,.06);">
        <tr><td style="padding:28px 36px 20px;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#25A8E0;">Direktmailing LP</span>
          <h1 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#1d1d1f;">Neue Gesprächsanfrage</h1>
        </td></tr>
        <tr><td style="padding:28px 36px;">
          <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #f3f4f6;">
            ${row('Vorname', first_name)}
            ${row('Nachname', last_name)}
            ${row('Telefon', `${phone_country ?? '+49'} ${phone}`)}
            ${row('E-Mail', email || '—')}
            ${row('Studio / Bereich', studio || '—')}
            ${row('Stadt', city || '—')}
            ${slotsHtml}
          </table>
        </td></tr>
        <tr><td style="padding:16px 36px 28px;border-top:1px solid #f0f0f0;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">Automatisch generiert · © 2026 BODYTIME concept</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await sendMail({
      to: CONTACT_EMAIL,
      subject: `Gesprächsanfrage von ${first_name} ${last_name} (Direktmailing LP)`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[lp/contact]', err);
    return NextResponse.json({ success: false, error: 'Serverfehler.' }, { status: 500 });
  }
}
