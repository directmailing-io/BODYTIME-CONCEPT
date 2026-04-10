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
