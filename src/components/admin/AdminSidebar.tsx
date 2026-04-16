'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  ClipboardCheck,
  Gift,
  Settings,
  User,
  LogOut,
  MoreHorizontal,
  X,
  Plus,
} from 'lucide-react';
import Image from 'next/image';
import { logoutAction } from '@/actions/auth';
import CreatePartnerDialog from '@/components/admin/CreatePartnerDialog';

interface AdminProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
}

// Desktop sidebar — all items in order
const allNavItems = [
  { href: '/admin/dashboard',        label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/partners',         label: 'Partner',        icon: Users },
  { href: '/admin/customers',        label: 'Kunden',         icon: UserCheck },
  { href: '/admin/empfehlungszentrale', label: 'Empfehlungen', icon: Gift },
  { href: '/admin/freigabezentrale', label: 'Freigabe',       icon: ClipboardCheck },
  { href: '/admin/documents',        label: 'Dokumente',      icon: FileText },
  { href: '/admin/settings',         label: 'Einstellungen',  icon: Settings },
  { href: '/admin/profile',          label: 'Profil',         icon: User },
];

// Mobile bottom bar — 2 left + center action + 2 right + Mehr
const leftTabs = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/partners',  label: 'Partner',   icon: Users },
];
const rightTabs = [
  { href: '/admin/customers',           label: 'Kunden',      icon: UserCheck },
  { href: '/admin/empfehlungszentrale', label: 'Empfehlungen', icon: Gift },
];
const secondaryItems = [
  { href: '/admin/freigabezentrale', label: 'Freigabe',      icon: ClipboardCheck },
  { href: '/admin/documents',        label: 'Dokumente',     icon: FileText },
  { href: '/admin/settings',         label: 'Einstellungen', icon: Settings },
  { href: '/admin/profile',          label: 'Profil',        icon: User },
];

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? '';
  const last = lastName?.charAt(0)?.toUpperCase() ?? '';
  return first + last || '??';
}

/* ── Desktop sidebar content ──────────────────────────────── */
function SidebarContent({ profile, newReferralCount = 0 }: { profile: AdminProfile; newReferralCount?: number }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="flex items-center justify-center px-4 py-4 border-b border-gray-100">
        <Image src="/logo.svg" alt="BODYTIME concept" width={128} height={51} priority />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {allNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              ].join(' ')}
            >
              <Icon
                className={['w-4 h-4 flex-shrink-0', isActive ? 'text-gray-900' : 'text-gray-400'].join(' ')}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="flex-1">{label}</span>
              {href === '/admin/empfehlungszentrale' && newReferralCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none">
                  {newReferralCount > 9 ? '9+' : newReferralCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">
              {getInitials(profile.first_name, profile.last_name)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Admin'}
            </p>
            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 text-gray-400" strokeWidth={2} />
            Abmelden
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Mobile bottom navigation ─────────────────────────────── */
function MobileNav({ profile, newReferralCount = 0 }: { profile: AdminProfile; newReferralCount?: number }) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const isSecondaryActive = secondaryItems.some(
    (i) => pathname === i.href || pathname.startsWith(i.href + '/'),
  );

  function renderTab({ href, label, icon: Icon }: typeof leftTabs[0]) {
    const isActive = pathname === href || pathname.startsWith(href + '/');
    const isEmpfehlung = href === '/admin/empfehlungszentrale';
    return (
      <Link
        key={href}
        href={href}
        className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors min-w-0"
      >
        <div className="relative">
          <Icon
            className={['w-5 h-5 transition-colors', isActive ? 'text-gray-900' : 'text-gray-400'].join(' ')}
            strokeWidth={isActive ? 2.5 : 1.8}
          />
          {isEmpfehlung && newReferralCount > 0 && (
            <span className="absolute -top-1 -right-1.5 inline-flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold leading-none">
              {newReferralCount > 9 ? '9+' : newReferralCount}
            </span>
          )}
        </div>
        <span className={['text-[10px] font-medium leading-none transition-colors truncate', isActive ? 'text-gray-900' : 'text-gray-400'].join(' ')}>
          {label}
        </span>
      </Link>
    );
  }

  return (
    <>
      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -1px 0 rgba(0,0,0,0.06), 0 -4px 16px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-stretch h-16">
          {/* Left tabs */}
          {leftTabs.map(renderTab)}

          {/* Center action — "Partner anlegen" */}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex-1 flex items-center justify-center px-1 py-2 min-w-0"
            aria-label="Partner anlegen"
          >
            <div className="w-full max-w-[72px] h-11 rounded-2xl bg-gray-900 flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 transition-transform">
              <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="text-[9px] font-bold text-white leading-none">Anlegen</span>
            </div>
          </button>

          {/* Right tabs */}
          {rightTabs.map(renderTab)}

          {/* "Mehr" tab */}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 min-w-0"
          >
            <MoreHorizontal
              className={['w-5 h-5', isSecondaryActive ? 'text-gray-900' : 'text-gray-400'].join(' ')}
              strokeWidth={isSecondaryActive ? 2.5 : 1.8}
            />
            <span className={['text-[10px] font-medium leading-none', isSecondaryActive ? 'text-gray-900' : 'text-gray-400'].join(' ')}>
              Mehr
            </span>
          </button>
        </div>
      </nav>

      {/* CreatePartnerDialog — controlled by center button */}
      <CreatePartnerDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          sheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => setSheetOpen(false)}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        className={[
          'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl transition-transform duration-300 ease-out',
          sheetOpen ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle + header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 relative">
          <div className="w-10 h-1 rounded-full bg-gray-200 absolute left-1/2 -translate-x-1/2 top-3" />
          <div className="flex items-center gap-3 pt-3">
            <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-white">
                {getInitials(profile.first_name, profile.last_name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug">
                {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Admin'}
              </p>
              <p className="text-xs text-gray-400 truncate">{profile.email}</p>
            </div>
          </div>
          <button
            onClick={() => setSheetOpen(false)}
            className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Secondary nav items */}
        <div className="px-4 py-3 space-y-1">
          {secondaryItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSheetOpen(false)}
                className={[
                  'flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors',
                  isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 active:bg-gray-50',
                ].join(' ')}
              >
                <Icon
                  className={['w-5 h-5 flex-shrink-0', isActive ? 'text-gray-900' : 'text-gray-400'].join(' ')}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={['text-[15px] flex-1', isActive ? 'font-semibold' : 'font-medium'].join(' ')}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Divider + Logout */}
        <div className="mx-4 border-t border-gray-100 pt-2 pb-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 active:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
              <span className="text-[15px] font-medium">Abmelden</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

/* ── Export ───────────────────────────────────────────────── */
export default function AdminSidebar({ profile, newReferralCount = 0 }: { profile: AdminProfile; newReferralCount?: number }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0 h-full" aria-label="Navigation">
        <SidebarContent profile={profile} newReferralCount={newReferralCount} />
      </aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <MobileNav profile={profile} newReferralCount={newReferralCount} />
      </div>
    </>
  );
}
