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
    url: 'https://bodytime-concept.de/b2b',
    images: [
      {
        url: '/bodytime-concept-b2b.png',
        width: 2752,
        height: 1536,
        alt: 'BODYTIME concept – Partner werden & EMS-Business starten',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BODYTIME concept – Partner werden & EMS-Business starten',
    description: 'Starte dein eigenes EMS-Business ohne Studio und ohne Gerätekosten. Jetzt unverbindlich informieren.',
    images: ['/bodytime-concept-b2b.png'],
  },
};

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
