'use client';
import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Gift, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { updateReferralBonusAction } from '@/actions/referrals';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  eingegangen:    { label: 'Eingegangen',    variant: 'neutral'  as const },
  in_bearbeitung: { label: 'In Bearbeitung', variant: 'info'     as const },
  gewonnen:       { label: 'Gewonnen',       variant: 'success'  as const },
  kein_interesse: { label: 'Kein Interesse', variant: 'danger'   as const },
};

type FilterStatus = 'all' | 'eingegangen' | 'in_bearbeitung' | 'gewonnen' | 'kein_interesse';

interface Referral {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  note: string | null;
  status: string;
  created_at: string;
  partner: { id: string; first_name: string; last_name: string; email: string } | null;
}

export default function AdminReferralsClient({
  referrals,
  bonusText: initialBonus,
}: {
  referrals: Referral[];
  bonusText: string;
}) {
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<FilterStatus>('all');
  const [page, setPage]           = useState(1);
  const [bonus, setBonus]         = useState(initialBonus);
  const [isPending, startTransition] = useTransition();
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    let list = referrals;
    if (filter !== 'all') list = list.filter(r => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        `${r.partner?.first_name ?? ''} ${r.partner?.last_name ?? ''}`.toLowerCase().includes(q),
      );
    }
    return list;
  }, [referrals, filter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const newCount = referrals.filter(r => r.status === 'eingegangen').length;

  const saveBonus = () => {
    const fd = new FormData();
    fd.append('referral_bonus', bonus);
    startTransition(async () => {
      const result = await updateReferralBonusAction(fd);
      if (result.success) toast.success('Bonus-Beschreibung gespeichert');
      else toast.error(result.error ?? 'Fehler');
    });
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Empfehlungen</h1>
        <p className="text-sm text-gray-500 mt-1">
          Verwaltung eingehender Partnerempfehlungen · {newCount > 0 && (
            <span className="font-semibold text-amber-600">{newCount} neue{newCount !== 1 ? '' : ''} unbearbeitet</span>
          )}
        </p>
      </div>

      {/* Bonus setting */}
      <Card>
        <CardHeader><CardTitle>Bonus für erfolgreiche Empfehlung</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Dieser Text wird allen Partnern auf der Empfehlungsseite angezeigt.
          </p>
          <textarea
            value={bonus}
            onChange={e => setBonus(e.target.value)}
            rows={3}
            placeholder="z. B. Für jede erfolgreiche Empfehlung erhältst du einen Monat kostenlose Smart-Lizenz (Wert: 139 €)."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          />
          <div className="flex justify-end">
            <Button onClick={saveBonus} disabled={isPending} size="sm">
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Name, E-Mail oder Partner suchen…"
              className="w-full pl-9 pr-3 h-10 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'eingegangen', 'in_bearbeitung', 'gewonnen', 'kein_interesse'] as FilterStatus[]).map(f => {
              const cfg = f === 'all' ? null : STATUS_CONFIG[f];
              return (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f === 'all' ? 'Alle' : cfg!.label}
                  {f === 'eingegangen' && newCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      {newCount > 9 ? '9+' : newCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Card className="overflow-hidden">
          {paginated.length === 0 ? (
            <div className="p-12 text-center">
              <Gift className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Keine Empfehlungen gefunden.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Empfohlene Person</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Empfohlen von</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Eingegangen</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map(r => {
                    const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.eingegangen;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{r.first_name} {r.last_name}</p>
                          <p className="text-xs text-gray-400">{r.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {r.partner ? (
                            <Link
                              href={`/admin/partners/${r.partner.id}`}
                              className="text-gray-700 hover:text-gray-900 hover:underline"
                              onClick={e => e.stopPropagation()}
                            >
                              {r.partner.first_name} {r.partner.last_name}
                            </Link>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                          {formatDate(r.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/empfehlungszentrale/${r.id}`}
                            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            Details →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{filtered.length} Empfehlungen</span>
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
    </div>
  );
}
