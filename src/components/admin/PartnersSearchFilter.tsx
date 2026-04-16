'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search } from 'lucide-react';
import { formatDate, fullName } from '@/lib/utils';
import PartnerActions from '@/components/admin/PartnerActions';

interface PartnerRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  company_name: string | null;
  customer_count: number;
}

interface PartnersSearchFilterProps {
  partners: PartnerRow[];
}

export default function PartnersSearchFilter({ partners }: PartnersSearchFilterProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = partners.filter((p) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const name = fullName(p.first_name ?? '', p.last_name ?? '').toLowerCase();
    return (
      name.includes(term) ||
      (p.email?.toLowerCase().includes(term) ?? false) ||
      (p.company_name?.toLowerCase().includes(term) ?? false)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          type="search"
          placeholder="Name, E-Mail oder Firma suchen …"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table card */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">
                {search ? 'Keine Partner gefunden' : 'Noch keine Partner angelegt'}
              </p>
              {search && (
                <p className="text-xs text-gray-400 mt-1">
                  Versuche einen anderen Suchbegriff.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Firma
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      E-Mail
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Kunden
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Erstellt
                    </th>
                    <th className="px-6 py-3.5" aria-label="Aktionen" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((partner) => (
                    <tr
                      key={partner.id}
                      onClick={() => router.push(`/admin/partners/${partner.id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {/* Name */}
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

                      {/* Firma */}
                      <td className="px-6 py-4 text-gray-600 hidden md:table-cell">
                        {partner.company_name ?? <span className="text-gray-300">—</span>}
                      </td>

                      {/* E-Mail */}
                      <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">
                        {partner.email ?? <span className="text-gray-300">—</span>}
                      </td>

                      {/* Kunden */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                          {partner.customer_count}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge variant={partner.is_active ? 'success' : 'neutral'}>
                          {partner.is_active ? 'Aktiv' : 'Deaktiviert'}
                        </Badge>
                      </td>

                      {/* Erstellt */}
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap hidden lg:table-cell">
                        {formatDate(partner.created_at)}
                      </td>

                      {/* Aktionen — stop propagation so row click doesn't fire */}
                      <td
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PartnerActions
                          partner={{
                            id: partner.id,
                            is_active: partner.is_active,
                            first_name: partner.first_name,
                            last_name: partner.last_name,
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

      {/* Results hint when filtering */}
      {search && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {filtered.length} von {partners.length} Partner{partners.length !== 1 ? 'n' : ''} angezeigt
        </p>
      )}
    </div>
  );
}
