import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import CookieConsent from '@/components/CookieConsent';

export const metadata: Metadata = {
  metadataBase: new URL('https://bodytime-concept.de'),
  title: {
    default: 'BODYTIME concept – EMS Training für zuhause',
    template: '%s | BODYTIME concept',
  },
  description: 'Trainiere flexibel zuhause, unterwegs oder im Studio. Mit persönlichem Ansprechpartner, EMS-Anzug zur Miete und sofort startklar – ganz ohne Geräte.',
  openGraph: {
    title: 'BODYTIME concept – EMS Training für zuhause',
    description: 'Trainiere flexibel zuhause, unterwegs oder im Studio. Mit persönlichem Ansprechpartner, EMS-Anzug zur Miete und sofort startklar – ganz ohne Geräte.',
    siteName: 'BODYTIME concept',
    locale: 'de_DE',
    type: 'website',
    url: 'https://bodytime-concept.de',
    images: [
      {
        url: '/hero-bg.png',
        width: 2752,
        height: 1536,
        alt: 'BODYTIME concept – EMS Training für zuhause',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BODYTIME concept – EMS Training für zuhause',
    description: 'Trainiere flexibel zuhause, unterwegs oder im Studio. Mit persönlichem Ansprechpartner, EMS-Anzug zur Miete und sofort startklar.',
    images: ['/hero-bg.png'],
  },
};

// Runs synchronously before React hydration — redirects invite links instantly
const inviteRedirectScript = `(function(){var h=window.location.hash;if(!h)return;var p=new URLSearchParams(h.slice(1));if(p.get('type')==='invite'&&p.get('access_token')){window.location.replace('/invite'+h);}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
      <head>
        <script dangerouslySetInnerHTML={{ __html: inviteRedirectScript }} />
      </head>
      <body className="min-h-full antialiased" suppressHydrationWarning>
        {children}
        <CookieConsent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '14px',
              fontSize: '14px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            },
          }}
        />
      </body>
    </html>
  );
}
