import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-500 mb-8">Diese Seite wurde nicht gefunden.</p>
        <Link
          href="/login"
          className="text-sm font-medium text-gray-900 underline underline-offset-4"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
