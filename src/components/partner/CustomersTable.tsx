'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { daysUntilEnd, isExpiringSoon, isExpired, formatDate } from '@/lib/utils';

type FilterType = 'all' | 'expiring' | 'expired' | 'active';
type SortKey = 'name' | 'contract_end_date' | 'order_date';

export default function CustomersTable({ customers }: { customers: any[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortKey, setSortKey] = useState<SortKey>('contract_end_date');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    let list = customers;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filter === 'expiring') list = list.filter(c => isExpiringSoon(c.contract_end_date) && !isExpired(c.contract_end_date));
    if (filter === 'expired') list = list.filter(c => isExpired(c.contract_end_date));
    if (filter === 'active') list = list.filter(c => !isExpiringSoon(c.contract_end_date) && !isExpired(c.contract_end_date));

    // Sort
    list = [...list].sort((a, b) => {
      let av = '', bv = '';
      if (sortKey === 'name') { av = `${a.first_name} ${a.last_name}`; bv = `${b.first_name} ${b.last_name}`; }
      if (sortKey === 'contract_end_date') { av = a.contract_end_date; bv = b.contract_end_date; }
      if (sortKey === 'order_date') { av = a.order_date; bv = b.order_date; }
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return list;
  }, [customers, search, filter, sortKey, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
    setPage(1);
  };

  function StatusBadge({ customer }: { customer: any }) {
    if (customer.profile_complete === false) {
      return <Badge variant="warning">Profil vervollständigen</Badge>;
    }
    if (isExpired(customer.contract_end_date)) return <Badge variant="danger">Abgelaufen</Badge>;
    if (isExpiringSoon(customer.contract_end_date)) return <Badge variant="warning">Läuft bald ab</Badge>;
    return <Badge variant="success">Aktiv</Badge>;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Name oder E-Mail suchen…"
            className="w-full pl-9 pr-3 h-10 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all','active','expiring','expired'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'active' ? 'Aktiv' : f === 'expiring' ? 'Bald ablaufend' : 'Abgelaufen'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">Keine Kunden gefunden.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    <button className="flex items-center gap-1 hover:text-gray-900" onClick={() => toggleSort('name')}>
                      Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">E-Mail</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">
                    <button className="flex items-center gap-1 hover:text-gray-900" onClick={() => toggleSort('order_date')}>
                      Bestelldatum <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Laufzeit</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    <button className="flex items-center gap-1 hover:text-gray-900" onClick={() => toggleSort('contract_end_date')}>
                      Vertragsende <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(customer => {
                  const days = daysUntilEnd(customer.contract_end_date);
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => window.location.href = `/partner/customers/${customer.id}`}>
                      <td className="px-4 py-3">
                        <Link href={`/partner/customers/${customer.id}`} className="font-medium text-gray-900 hover:text-gray-600 transition-colors">
                          {customer.first_name} {customer.last_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{customer.email}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(customer.order_date)}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{customer.rental_duration_months} Mon.</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className={isExpired(customer.contract_end_date) ? 'text-red-600 font-medium' : isExpiringSoon(customer.contract_end_date) ? 'text-amber-600 font-medium' : 'text-gray-700'}>
                            {formatDate(customer.contract_end_date)}
                          </span>
                          {!isExpired(customer.contract_end_date) && days <= 60 && (
                            <span className="text-xs text-amber-500">in {days} Tagen</span>
                          )}
                          {isExpired(customer.contract_end_date) && (
                            <span className="text-xs text-red-400">vor {Math.abs(days)} Tagen</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge customer={customer} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{filtered.length} Kunden</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-700">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
