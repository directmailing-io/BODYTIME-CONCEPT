import Link from 'next/link';
import SiteFooter from '@/components/marketing/SiteFooter';

export const metadata = {
  title: 'Datenschutzerklärung – BODYTIME concept',
  description: 'Informationen zum Datenschutz gemäß DSGVO.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-gray-100 pb-8 last:border-0">
      <h2 className="text-base font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Simple top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" aria-label="BODYTIME concept">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="BODYTIME concept" className="h-10 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Zurück zur Startseite
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">

        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Datenschutzerklärung</h1>
        <p className="text-sm text-gray-400 mb-10">Stand: Januar 2025</p>

        <div className="space-y-8">

          <Section title="1. Verantwortlicher">
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p>
              BODYTIME concept GmbH <em>(Platzhalter)</em><br />
              Musterstraße 1, 12345 Musterstadt<br />
              E-Mail: <a href="mailto:datenschutz@bodytime-concept.de" className="text-blue-600 hover:underline">datenschutz@bodytime-concept.de</a><br />
              Telefon: +49 (0) 123 456789
            </p>
          </Section>

          <Section title="2. Allgemeines zur Datenverarbeitung">
            <p>
              Wir nehmen den Schutz deiner personenbezogenen Daten sehr ernst und verarbeiten
              diese nur im Rahmen der gesetzlichen Bestimmungen. Diese Datenschutzerklärung
              informiert dich darüber, welche Daten wir erheben, wie wir sie verwenden und
              welche Rechte du hast.
            </p>
            <p>
              Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte
              oder identifizierbare natürliche Person beziehen (Art. 4 Nr. 1 DSGVO).
            </p>
          </Section>

          <Section title="3. Hosting und technischer Betrieb">
            <p>
              Diese Website wird auf Servern von <strong>Vercel Inc.</strong> (Platzhalter) gehostet.
              Beim Aufruf der Website werden automatisch folgende Daten in Server-Logfiles gespeichert:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>IP-Adresse des anfragenden Geräts (anonymisiert)</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Aufgerufene URL</li>
              <li>Browsertyp und Betriebssystem</li>
              <li>HTTP-Statuscode</li>
            </ul>
            <p>
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
              an der sicheren und stabilen Bereitstellung der Website). Die Daten werden nach
              spätestens 30 Tagen automatisch gelöscht.
            </p>
          </Section>

          <Section title="4. Cookies">
            <p>
              Diese Website verwendet Cookies. Cookies sind kleine Textdateien, die dein
              Browser auf deinem Endgerät speichert. Wir unterscheiden zwischen notwendigen
              Cookies und optionalen Analyse-Cookies, über die du selbst entscheiden kannst.
            </p>

            <p className="font-semibold text-gray-800">Kategorie: Notwendig</p>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Zweck</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Dauer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-mono text-gray-600">btc_consent</td>
                    <td className="px-4 py-3 text-gray-500">Speichert deine Cookie-Einwilligung (als JSON mit Kategorie-Flags)</td>
                    <td className="px-4 py-3 text-gray-500">1 Jahr</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-gray-600">sb-*</td>
                    <td className="px-4 py-3 text-gray-500">Authentifizierungssession (Partner-Login via Supabase)</td>
                    <td className="px-4 py-3 text-gray-500">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
              am sicheren Betrieb der Website). Für notwendige Cookies ist keine Einwilligung erforderlich.
            </p>

            <p className="font-semibold text-gray-800 pt-1">Kategorie: Analyse (optional)</p>
            <p>
              Analyse-Cookies helfen uns zu verstehen, wie Besucher die Website nutzen. Sie werden
              nur gesetzt, wenn du ausdrücklich zustimmst. <strong>Aktuell sind keine Analyse-Dienste
              aktiv eingebunden.</strong> Sobald solche Dienste eingesetzt werden, wird diese
              Datenschutzerklärung entsprechend aktualisiert.
            </p>
            <p>
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Du kannst
              deine Einwilligung jederzeit über den Link „Cookie-Einstellungen" im Footer widerrufen.
            </p>

            <p>
              Du kannst Cookies außerdem in deinen Browsereinstellungen jederzeit löschen oder blockieren.
              Dies kann die Funktionalität der Website einschränken.
            </p>
          </Section>

          <Section title="5. Kontaktanfragen">
            <p>
              Wenn du uns per E-Mail oder über ein Kontaktformular kontaktierst, werden die von
              dir angegebenen Daten (Name, E-Mail-Adresse, Nachricht) zur Bearbeitung deiner
              Anfrage verarbeitet.
            </p>
            <p>
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)
              bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von
              Anfragen). Die Daten werden gelöscht, sobald sie für den Zweck der Anfrage nicht
              mehr benötigt werden.
            </p>
          </Section>

          <Section title="6. Drittanbieter und externe Dienste">
            <p>
              Auf dieser Website sind derzeit keine Dienste von Drittanbietern (z. B. Google
              Analytics, Facebook Pixel, Google Maps) eingebunden, die eine eigenständige
              Datenverarbeitung auslösen würden.
            </p>
            <p>
              Sollten solche Dienste zukünftig eingebunden werden, werden wir diese
              Datenschutzerklärung entsprechend aktualisieren und ggf. eine gesonderte
              Einwilligung einholen.
            </p>
          </Section>

          <Section title="7. Schriftarten">
            <p>
              Diese Website verwendet ausschließlich systemseitig installierte Schriftarten
              (System-Fonts). Es werden keine Schriften von Google Fonts oder anderen externen
              Anbietern geladen. Es findet daher keine Übermittlung von IP-Adressen an
              Drittanbieter statt.
            </p>
          </Section>

          <Section title="8. Deine Rechte als betroffene Person">
            <p>Du hast gemäß DSGVO folgende Rechte:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO): Du hast das Recht zu erfahren, welche Daten wir über dich verarbeiten.</li>
              <li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO): Du kannst die Korrektur unrichtiger Daten verlangen.</li>
              <li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO): Du kannst die Löschung deiner Daten verlangen, sofern keine gesetzliche Aufbewahrungspflicht besteht.</li>
              <li><strong>Recht auf Einschränkung</strong> (Art. 18 DSGVO): Du kannst die Einschränkung der Verarbeitung verlangen.</li>
              <li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO): Du kannst deine Daten in einem maschinenlesbaren Format anfordern.</li>
              <li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO): Du kannst der Verarbeitung deiner Daten widersprechen, soweit diese auf einem berechtigten Interesse beruht.</li>
              <li><strong>Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO): Du kannst eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.</li>
            </ul>
            <p>
              Zur Ausübung deiner Rechte wende dich bitte an:{' '}
              <a href="mailto:datenschutz@bodytime-concept.de" className="text-blue-600 hover:underline">
                datenschutz@bodytime-concept.de
              </a>
            </p>
          </Section>

          <Section title="9. Beschwerderecht bei der Aufsichtsbehörde">
            <p>
              Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über die
              Verarbeitung deiner personenbezogenen Daten durch uns zu beschweren. Die
              zuständige Aufsichtsbehörde ist:
            </p>
            <p>
              <em>(Hier die zuständige Landesbehörde eintragen, z. B. Bayerisches Landesamt
              für Datenschutzaufsicht – BayLDA, Promenade 18, 91522 Ansbach)</em>
            </p>
          </Section>

          <Section title="10. Aktualität und Änderung dieser Datenschutzerklärung">
            <p>
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Januar 2025.
              Durch die Weiterentwicklung unserer Website oder aufgrund geänderter gesetzlicher
              oder behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung
              zu ändern. Die jeweils aktuelle Version ist jederzeit auf dieser Seite abrufbar.
            </p>
          </Section>

        </div>

        <p className="mt-12 text-xs text-gray-400">
          * Diese Seite enthält Platzhalterdaten zu Demonstrationszwecken.
        </p>

      </main>

      <SiteFooter />
    </div>
  );
}
