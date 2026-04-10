import Link from 'next/link';
import SiteFooter from '@/components/marketing/SiteFooter';

export const metadata = {
  title: 'Impressum – BODYTIME concept',
  description: 'Impressum und Anbieterangaben gemäß § 5 TMG.',
};

export default function ImpressumPage() {
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

        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Impressum</h1>
        <p className="text-sm text-gray-400 mb-10">Angaben gemäß § 5 TMG</p>

        <div className="space-y-10 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Anbieter</h2>
            <p>
              BODYTIME concept GmbH <em>(Musterunternehmen – Platzhalter)</em><br />
              Musterstraße 1<br />
              12345 Musterstadt<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Vertreten durch</h2>
            <p>Max Mustermann (Geschäftsführer)</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Kontakt</h2>
            <p>
              Telefon: +49 (0) 123 456789<br />
              E-Mail: <a href="mailto:info@bodytime-concept.de" className="text-blue-600 hover:underline">info@bodytime-concept.de</a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Handelsregister</h2>
            <p>
              Registergericht: Amtsgericht Musterstadt<br />
              Registernummer: HRB 00000
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
              DE 000 000 000
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Verantwortlich für den Inhalt (§ 55 Abs. 2 RStV)</h2>
            <p>
              Max Mustermann<br />
              Musterstraße 1<br />
              12345 Musterstadt
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              .<br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
            <p className="mt-3">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
              Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine
              diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
              Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden
              wir diese Inhalte umgehend entfernen.
            </p>
          </section>

        </div>

        <p className="mt-12 text-xs text-gray-400">
          * Diese Seite enthält Platzhalterdaten zu Demonstrationszwecken.
        </p>

      </main>

      <SiteFooter />
    </div>
  );
}
