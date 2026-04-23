import { Suspense } from 'react';
import DankePage from './DankePage';

export const metadata = {
  title: 'Vielen Dank! – BODYTIME concept',
  description: 'Deine Anfrage ist eingegangen. Wir melden uns schnellstmöglich bei dir.',
  robots: { index: false, follow: false },
};

export default function DankeRoute() {
  return (
    <Suspense fallback={null}>
      <DankePage />
    </Suspense>
  );
}
