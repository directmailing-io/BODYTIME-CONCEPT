import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner werden – EMS-Business starten',
  description: 'Starte dein eigenes EMS-Business ohne Studio und ohne Gerätekosten. Persönliche Begleitung, Smart Office inklusive, 1 € pro aktivem Kunden. Jetzt unverbindlich informieren.',
  openGraph: {
    title: 'BODYTIME concept – Partner werden & EMS-Business starten',
    description: 'Starte dein eigenes EMS-Business ohne Studio und ohne Gerätekosten. Persönliche Begleitung, Smart Office inklusive, 1 € pro aktivem Kunden. Jetzt unverbindlich informieren.',
    siteName: 'BODYTIME concept',
    locale: 'de_DE',
    type: 'website',
  },
};

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
