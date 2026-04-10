'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

interface Props {
  customersByMonth: Record<string, number>;
  partnersByMonth: Record<string, number>;
}

export default function AdminMonthlyStats({ customersByMonth, partnersByMonth }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const nextY = month === 11 ? year + 1 : year;
    const nextM = month === 11 ? 0 : month + 1;
    if (nextY > now.getFullYear() || (nextY === now.getFullYear() && nextM > now.getMonth())) return;
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const key = getMonthKey(year, month);
  const customersThisMonth = customersByMonth[key] ?? 0;
  const partnersThisMonth = partnersByMonth[key] ?? 0;

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  // Build last 12 months bar data
  const barMonths = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, month - 11 + i, 1);
    const k = getMonthKey(d.getFullYear(), d.getMonth());
    return {
      key: k,
      label: MONTH_NAMES[d.getMonth()].slice(0, 3),
      customers: customersByMonth[k] ?? 0,
      partners: partnersByMonth[k] ?? 0,
      isCurrent: k === key,
    };
  });

  const maxCustomers = Math.max(...barMonths.map(b => b.customers), 1);
  const maxPartners = Math.max(...barMonths.map(b => b.partners), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Customers per month */}
      <Card>
        <CardContent className="p-0">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Neue Kunden</h2>
                  <p className="text-xs text-gray-400">pro Monat</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth} className="h-7 w-7 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-gray-700 min-w-[110px] text-center">
                  {MONTH_NAMES[month]} {year}
                </span>
                <Button variant="outline" size="sm" onClick={nextMonth} disabled={isCurrentMonth} className="h-7 w-7 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-4">{customersThisMonth}</p>
            <p className="text-sm text-gray-500">Kunden in {MONTH_NAMES[month]}</p>
          </div>

          {/* Mini bar chart */}
          <div className="px-6 py-4">
            <p className="text-xs text-gray-400 mb-3">Letzte 12 Monate</p>
            <div className="flex items-end gap-1 h-16">
              {barMonths.map(b => (
                <div key={b.key} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className={`w-full rounded-sm transition-all ${b.isCurrent ? 'bg-purple-500' : 'bg-purple-200'}`}
                    style={{ height: `${Math.max((b.customers / maxCustomers) * 52, b.customers > 0 ? 4 : 0)}px` }}
                    title={`${b.label}: ${b.customers}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              {barMonths.map(b => (
                <div key={b.key} className={`flex-1 text-center text-[9px] truncate ${b.isCurrent ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners per month */}
      <Card>
        <CardContent className="p-0">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Neue Partner</h2>
                  <p className="text-xs text-gray-400">pro Monat</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth} className="h-7 w-7 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-gray-700 min-w-[110px] text-center">
                  {MONTH_NAMES[month]} {year}
                </span>
                <Button variant="outline" size="sm" onClick={nextMonth} disabled={isCurrentMonth} className="h-7 w-7 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-4">{partnersThisMonth}</p>
            <p className="text-sm text-gray-500">Partner in {MONTH_NAMES[month]}</p>
          </div>

          {/* Mini bar chart */}
          <div className="px-6 py-4">
            <p className="text-xs text-gray-400 mb-3">Letzte 12 Monate</p>
            <div className="flex items-end gap-1 h-16">
              {barMonths.map(b => (
                <div key={b.key} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className={`w-full rounded-sm transition-all ${b.isCurrent ? 'bg-blue-500' : 'bg-blue-200'}`}
                    style={{ height: `${Math.max((b.partners / maxPartners) * 52, b.partners > 0 ? 4 : 0)}px` }}
                    title={`${b.label}: ${b.partners}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              {barMonths.map(b => (
                <div key={b.key} className={`flex-1 text-center text-[9px] truncate ${b.isCurrent ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
