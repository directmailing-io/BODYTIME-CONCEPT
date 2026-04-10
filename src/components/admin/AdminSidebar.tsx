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
  Menu,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { logoutAction } from '@/actions/auth';

interface AdminProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/admin/dashboard',            label: 'Dashboard',             icon: LayoutDashboard },
  { href: '/admin/partners',             label: 'Partner',               icon: Users },
  { href: '/admin/customers',            label: 'Kunden',                icon: UserCheck },
  { href: '/admin/documents',            label: 'Dokumente',             icon: FileText },
  { href: '/admin/freigabezentrale',     label: 'Freigabezentrale',      icon: ClipboardCheck },
  { href: '/admin/empfehlungszentrale',  label: 'Empfehlungen',          icon: Gift },
  { href: '/admin/settings',             label: 'Einstellungen',         icon: Settings },
  { href: '/admin/profile',              label: 'Profil',                icon: User },
];

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? '';
  const last = lastName?.charAt(0)?.toUpperCase() ?? '';
  return first + last || '??';
}

interface SidebarContentProps {
  profile: AdminProfile;
  onClose?: () => void;
  newReferralCount?: number;
}

function SidebarContent({ profile, onClose, newReferralCount = 0 }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div className="flex-1 flex justify-center">
          <Image src="/logo.svg" alt="BODYTIME concept" width={128} height={51} priority />
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Sidebar schließen"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              ].join(' ')}
            >
              <Icon
                className={[
                  'w-4 h-4 flex-shrink-0',
                  isActive ? 'text-gray-900' : 'text-gray-400',
                ].join(' ')}
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

      {/* User profile + logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          {/* Avatar initials */}
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

export default function AdminSidebar({ profile, newReferralCount = 0 }: { profile: AdminProfile; newReferralCount?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger trigger — fixed top-left, visible only on mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white border border-gray-100 shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        aria-label="Navigation öffnen"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={[
          'lg:hidden fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Mobile Navigation"
      >
        <SidebarContent profile={profile} newReferralCount={newReferralCount} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:block w-60 flex-shrink-0 h-full" aria-label="Navigation">
        <SidebarContent profile={profile} newReferralCount={newReferralCount} />
      </aside>
    </>
  );
}
