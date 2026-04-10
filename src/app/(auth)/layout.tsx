import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="BODYTIME concept" width={160} height={160} className="mx-auto" />
          </Link>
          <p className="text-sm text-gray-400 mt-1">Partner-Plattform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
