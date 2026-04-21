'use client';

import { Card, CardContent } from '@/components/ui/card';

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

interface Props {
  customersByMonth: Record<string, number>;
  partnersByMonth:  Record<string, number>;
}

function BarChart({ data, color }: {
  data: { label: string; value: number; isCurrent: boolean }[];
  color: string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-20">
      {data.map((m, i) => {
        const barH = Math.max((m.value / max) * 64, m.value > 0 ? 4 : 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-xs font-semibold tabular-nums ${m.isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
              {m.value}
            </span>
            <div
              className={`w-full rounded-md ${m.isCurrent ? color : 'bg-gray-100'}`}
              style={{ height: `${barH}px` }}
            />
            <span className={`text-[10px] font-medium ${m.isCurrent ? 'text-gray-700' : 'text-gray-400'}`}>
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminMonthlyStats({ customersByMonth, partnersByMonth }: Props) {
  const now = new Date();

  const months = Array.from({ length: 6 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { key, label: MONTH_NAMES[d.getMonth()], isCurrent: i === 5 };
  });

  const customerData = months.map(m => ({ ...m, value: customersByMonth[m.key] ?? 0 }));
  const partnerData  = months.map(m => ({ ...m, value: partnersByMonth[m.key]  ?? 0 }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Neue Kunden</p>
          <BarChart data={customerData} color="bg-purple-500" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Neue Partner</p>
          <BarChart data={partnerData} color="bg-blue-500" />
        </CardContent>
      </Card>
    </div>
  );
}
