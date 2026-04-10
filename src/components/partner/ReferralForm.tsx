'use client';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Gift, Send, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { submitReferralAction } from '@/actions/referrals';
import { formatDate } from '@/lib/utils';

const STATUS_CONFIG = {
  eingegangen:    { label: 'Eingegangen',    variant: 'neutral'  as const },
  in_bearbeitung: { label: 'In Bearbeitung', variant: 'info'     as const },
  gewonnen:       { label: 'Gewonnen',       variant: 'success'  as const },
  kein_interesse: { label: 'Kein Interesse', variant: 'danger'   as const },
};

interface Referral {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  note: string | null;
  status: string;
  created_at: string;
}

export default function ReferralForm({
  bonusText,
  referrals,
}: {
  bonusText: string | null;
  referrals: Referral[];
}) {
  const [isPending, startTransition] = useTransition();
  const [firstName, setFirstName]   = useState('');
  const [lastName,  setLastName]    = useState('');
  const [phone,     setPhone]       = useState('');
  const [email,     setEmail]       = useState('');
  const [note,      setNote]        = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('first_name', firstName);
    fd.append('last_name',  lastName);
    fd.append('phone',      phone);
    fd.append('email',      email);
    fd.append('note',       note);

    startTransition(async () => {
      const result = await submitReferralAction(fd);
      if (result.success) {
        toast.success('Empfehlung erfolgreich eingereicht!');
        setFirstName(''); setLastName(''); setPhone(''); setEmail(''); setNote('');
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  return (
    <div className="space-y-5">

      {/* Bonus info banner */}
      {bonusText ? (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50">
          <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-0.5">Dein Bonus bei erfolgreicher Empfehlung</p>
            <p className="text-sm text-amber-700 whitespace-pre-wrap">{bonusText}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50">
          <Gift className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-500">
            Der Bonus für erfolgreiche Empfehlungen wird in Kürze bekannt gegeben.
          </p>
        </div>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Neue Empfehlung einreichen</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Bitte gib hier die Kontaktdaten der Person ein, die du empfehlen möchtest – nicht deine eigenen.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Vorname"
                placeholder="Max"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Nachname"
                placeholder="Mustermann"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
              <Input
                label="Telefonnummer"
                type="tel"
                placeholder="+49 123 456789"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
              <Input
                label="E-Mail-Adresse"
                type="email"
                placeholder="max@beispiel.de"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Bemerkung <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                placeholder="z. B. Bereits 5 Jahre als Personal Trainer tätig, sehr interessiert…"
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" loading={isPending}>
                <Send className="h-4 w-4" />
                Empfehlung einreichen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Referrals table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meine Empfehlungen</CardTitle>
            <span className="text-xs text-gray-400">{referrals.length} gesamt</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {referrals.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <Gift className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Noch keine Empfehlungen eingereicht.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Person</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Kontakt</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Eingereicht</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {referrals.map(r => {
                    const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]
                      ?? STATUS_CONFIG.eingegangen;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{r.first_name} {r.last_name}</p>
                          {r.note && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{r.note}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                          <p>{r.email}</p>
                          <p className="text-xs text-gray-400">{r.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                          {formatDate(r.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
