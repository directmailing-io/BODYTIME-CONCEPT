import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import CookieConsent from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: 'BODYTIME concept',
  description: 'Dein EMS Training für zuhause – persönliche Begleitung von Experten.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
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
