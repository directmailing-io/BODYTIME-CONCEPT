'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { formatDate, fullName } from '@/lib/utils';
import { getLicenseInfo } from '@/lib/utils/license';
import PartnerActions from '@/components/admin/PartnerActions';

interface PartnerRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  customer_count: number;
  license_start: string | null;
  license_duration_months: number;
  is_cancelled: boolean;
  cancellation_date: string | null;
}

type SortKey = 'name' | 'customer_count' | 'is_active' | 'license_start';
type SortDir = 'asc' | 'desc';

interface PartnersSearchFilterProps {
  partners: PartnerRow[];
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-gray-600 ml-1 inline" />
    : <ChevronDown className="w-3.5 h-3.5 text-gray-600 ml-1 inline" />;
}

function LicenseBadge({ partner }: { partner: PartnerRow }) {
  if (!partner.is_active) {
    return <Badge variant="neutral">Deaktiviert</Badge>;
  }
  if (!partner.license_start) {
    return <Badge variant="success">Aktiv</Badge>;
  }
  const info = getLicenseInfo(
    partner.license_start,
    partner.license_duration_months ?? 12,
    partner.is_cancelled,
    partner.cancellation_date ?? null,
  );
  if (info.status === 'cancelled_ended') {
    return <Badge variant="danger">Gekündigt</Badge>;
  }
  if (info.status === 'cancelled') {
    return <Badge variant="warning">Gekündigt, läuft bis {formatDate(info.possibleEnd.toISOString())}</Badge>;
  }
  if (info.status === 'auto_renewing') {
    return <Badge variant="warning">Läuft, verlängert sich</Badge>;
  }
  return <Badge variant="success">Vertrag läuft</Badge>;
}

export default function PartnersSearchFilter({ partners }: PartnersSearchFilterProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('license_start');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function handleSort(col: SortKey) {
    if (col === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(col);
      setSortDir('asc');
    }
  }

  const filtered = partners.filter(p => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const name = fullName(p.first_name ?? '', p.last_name ?? '').toLowerCase();
    return name.includes(term) || (p.email?.toLowerCase().includes(term) ?? false);
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name') {
      const na = fullName(a.first_name ?? '', a.last_name ?? '').toLowerCase();
      const nb = fullName(b.first_name ?? '', b.last_name ?? '').toLowerCase();
      cmp = na.localeCompare(nb, 'de');
    } else if (sortKey === 'customer_count') {
      cmp = a.customer_count - b.customer_count;
    } else if (sortKey === 'is_active') {
      cmp = (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0);
    } else if (sortKey === 'license_start') {
      const da = a.license_start ?? a.created_at;
      const db = b.license_start ?? b.created_at;
      cmp = new Date(da).getTime() - new Date(db).getTime();
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const thClass = 'px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none cursor-pointer hover:text-gray-700 whitespace-nowrap';

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          type="search"
          placeholder="Name oder E-Mail suchen …"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">
                {search ? 'Keine Partner gefunden' : 'Noch keine Partner angelegt'}
              </p>
              {search && <p className="text-xs text-gray-400 mt-1">Versuche einen anderen Suchbegriff.</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className={thClass} onClick={() => handleSort('name')}>
                      Name <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className={`${thClass} hidden lg:table-cell`}>E-Mail</th>
                    <th className={`${thClass} hidden sm:table-cell`} onClick={() => handleSort('customer_count')}>
                      Kunden <SortIcon col="customer_count" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className={thClass} onClick={() => handleSort('is_active')}>
                      Status <SortIcon col="is_active" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className={`${thClass} hidden lg:table-cell`} onClick={() => handleSort('license_start')}>
                      Lizenzstart <SortIcon col="license_start" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className="px-6 py-3.5" aria-label="Aktionen" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sorted.map(partner => (
                    <tr
                      key={partner.id}
                      onClick={() => router.push(`/admin/partners/${partner.id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-600">
                              {(partner.first_name?.charAt(0) ?? '?').toUpperCase()}
                              {(partner.last_name?.charAt(0) ?? '').toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 whitespace-nowrap">
                            {fullName(partner.first_name ?? '', partner.last_name ?? '') || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">
                        {partner.email ?? <span className="text-gray-300">—</span>}
                      </td>

                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                          {partner.customer_count}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <LicenseBadge partner={partner} />
                      </td>

                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap hidden lg:table-cell">
                        {partner.license_start ? formatDate(partner.license_start) : <span className="text-gray-300">—</span>}
                      </td>

                      <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                        <PartnerActions
                          partner={{
                            id: partner.id,
                            is_active: partner.is_active,
                            first_name: partner.first_name,
                            last_name: partner.last_name,
                            is_cancelled: partner.is_cancelled,
                          }}
                          compact
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {search && sorted.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {sorted.length} von {partners.length} Partner{partners.length !== 1 ? 'n' : ''} angezeigt
        </p>
      )}
    </div>
  );
}
