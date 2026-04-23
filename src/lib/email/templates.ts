/**
 * HTML email templates for BODYTIME concept.
 * Minimal, clean, Apple-inspired design with inline CSS for email client compatibility.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ---- Base layout ----
function baseLayout(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f0f0f0;">
              <span style="font-size:15px;font-weight:700;letter-spacing:0.02em;color:#1d1d1f;">BODYTIME concept</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.<br />
                © ${new Date().getFullYear()} BODYTIME concept
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 28px;background:#1d1d1f;color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;letter-spacing:0.01em;">${label}</a>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1d1d1f;line-height:1.3;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;color:#3a3a3c;line-height:1.6;">${text}</p>`;
}

// ---- Templates ----

export function invitePartnerEmail(params: {
  firstName: string;
  lastName: string;
  inviteUrl: string;
}): { subject: string; html: string } {
  const content = `
    ${h1(`Willkommen, ${params.firstName}!`)}
    ${p('Du wurdest als B2B Partner bei BODYTIME concept registriert.')}
    ${p('Bitte klicke auf den Button unten, um dein Konto zu aktivieren und dein Passwort festzulegen.')}
    ${p('Dieser Link ist 48 Stunden gültig.')}
    ${button(params.inviteUrl, 'Konto aktivieren')}
    ${p(`<br />Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br /><span style="color:#0071e3;word-break:break-all;">${params.inviteUrl}</span>`)}
  `;
  return {
    subject: 'BODYTIME concept – Dein Partner-Zugang',
    html: baseLayout(content, 'Einladung'),
  };
}

export function resetPasswordEmail(params: {
  firstName: string;
  resetUrl: string;
}): { subject: string; html: string } {
  const content = `
    ${h1('Passwort zurücksetzen')}
    ${p(`Hallo ${params.firstName},`)}
    ${p('Du hast eine Anfrage zum Zurücksetzen deines Passworts gesendet.')}
    ${p('Klicke auf den Button, um ein neues Passwort festzulegen. Der Link ist 1 Stunde gültig.')}
    ${button(params.resetUrl, 'Passwort zurücksetzen')}
    ${p('<br />Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.')}
  `;
  return {
    subject: 'BODYTIME concept – Passwort zurücksetzen',
    html: baseLayout(content, 'Passwort zurücksetzen'),
  };
}

export function expiryReminderEmail(params: {
  partnerFirstName: string;
  customerName: string;
  contractEndDate: string;
  daysLeft: number;
  customerDetailUrl: string;
}): { subject: string; html: string } {
  const content = `
    ${h1('Vertrag läuft bald aus')}
    ${p(`Hallo ${params.partnerFirstName},`)}
    ${p(`Der Vertrag von <strong>${params.customerName}</strong> läuft in <strong>${params.daysLeft} Tagen</strong> aus (${params.contractEndDate}).`)}
    ${p('Bitte nimm Kontakt mit deinem Kunden auf, um eine Verlängerung zu besprechen.')}
    ${button(params.customerDetailUrl, 'Zum Kundenprofil')}
  `;
  return {
    subject: `BODYTIME concept – Vertrag von ${params.customerName} läuft in ${params.daysLeft} Tagen aus`,
    html: baseLayout(content, 'Erinnerung – Vertragsende'),
  };
}

export function accountDeactivatedEmail(params: {
  firstName: string;
}): { subject: string; html: string } {
  const content = `
    ${h1('Dein Konto wurde deaktiviert')}
    ${p(`Hallo ${params.firstName},`)}
    ${p('Dein Partner-Konto bei BODYTIME concept wurde vorübergehend deaktiviert.')}
    ${p('Bitte wende dich an BODYTIME concept, um mehr Informationen zu erhalten.')}
  `;
  return {
    subject: 'BODYTIME concept – Konto deaktiviert',
    html: baseLayout(content, 'Konto deaktiviert'),
  };
}

export function accountReactivatedEmail(params: {
  firstName: string;
  loginUrl: string;
}): { subject: string; html: string } {
  const content = `
    ${h1('Dein Konto wurde reaktiviert')}
    ${p(`Hallo ${params.firstName},`)}
    ${p('Dein Partner-Konto bei BODYTIME concept ist wieder aktiv.')}
    ${button(params.loginUrl, 'Jetzt anmelden')}
  `;
  return {
    subject: 'BODYTIME concept – Konto reaktiviert',
    html: baseLayout(content, 'Konto reaktiviert'),
  };
}

// ── Contact request helpers ──────────────────────────────────────────────────

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:#6b6b6b;width:140px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:14px;color:#1d1d1f;font-weight:500;vertical-align:top;">${value || '—'}</td>
    </tr>`;
}

function badge(text: string, color: string): string {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${color};color:#fff;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${text}</span>`;
}

export function b2cContactEmail(params: {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  phone_country: string;
}): { subject: string; html: string } {
  const content = `
    <div style="margin-bottom:24px;">${badge('B2C – Endkunde', '#25A8E0')}</div>
    ${h1('Neue Beratungsanfrage')}
    ${p('Eine neue Anfrage ist über das B2C-Kontaktformular eingegangen.')}
    <table style="width:100%;border-collapse:collapse;margin-top:16px;margin-bottom:8px;">
      ${row('Vorname', params.first_name)}
      ${row('Nachname', params.last_name)}
      ${row('Telefon', `${params.phone_country} ${params.phone}`)}
      ${row('E-Mail', params.email || '—')}
    </table>
    <div style="margin-top:8px;padding:12px 16px;background:#f5f5f7;border-radius:10px;">
      <p style="margin:0;font-size:12px;color:#6b6b6b;">Eingegangen am ${new Date().toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })} Uhr</p>
    </div>
  `;
  return {
    subject: `Neue B2C-Anfrage: ${params.first_name} ${params.last_name}`,
    html: baseLayout(content, 'Neue Beratungsanfrage'),
  };
}

export function b2bContactEmail(params: {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  phone_country: string;
  employment_status?: string;
  business_area?: string;
  business_area_custom?: string;
}): { subject: string; html: string } {
  const areaDisplay = params.business_area === 'Sonstiges' && params.business_area_custom
    ? `Sonstiges: ${params.business_area_custom}`
    : (params.business_area || '—');

  const statusLabel: Record<string, string> = {
    selbststaendig: 'Ja, bereits selbstständig',
    angestellt: 'Nein, noch angestellt',
    noch_nicht: 'Noch nicht, aber interessiert',
  };

  const content = `
    <div style="margin-bottom:24px;">${badge('B2B – Partner', '#2563EB')}</div>
    ${h1('Neue Partner-Anfrage')}
    ${p('Eine neue Anfrage ist über das B2B-Kontaktformular eingegangen.')}
    <table style="width:100%;border-collapse:collapse;margin-top:16px;margin-bottom:8px;">
      ${row('Vorname', params.first_name)}
      ${row('Nachname', params.last_name)}
      ${row('Telefon', `${params.phone_country} ${params.phone}`)}
      ${row('E-Mail', params.email || '—')}
      ${params.employment_status ? row('Selbstständig?', statusLabel[params.employment_status] || params.employment_status) : ''}
      ${params.employment_status === 'selbststaendig' ? row('Bereich', areaDisplay) : ''}
    </table>
    <div style="margin-top:8px;padding:12px 16px;background:#f5f5f7;border-radius:10px;">
      <p style="margin:0;font-size:12px;color:#6b6b6b;">Eingegangen am ${new Date().toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })} Uhr</p>
    </div>
  `;
  return {
    subject: `Neue B2B-Anfrage: ${params.first_name} ${params.last_name}`,
    html: baseLayout(content, 'Neue Partner-Anfrage'),
  };
}
