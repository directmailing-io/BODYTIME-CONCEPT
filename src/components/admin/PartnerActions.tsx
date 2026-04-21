'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Trash2, ShieldOff, ShieldCheck, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  togglePartnerStatusAction,
  deletePartnerAction,
  cancelPartnerAction,
  reinstatePartnerAction,
} from '@/actions/admin-partners';
import { fullName } from '@/lib/utils';
import { todayISO } from '@/lib/utils/license';

interface Partner {
  id: string;
  is_active: boolean;
  first_name: string | null;
  last_name: string | null;
  is_cancelled?: boolean;
}

interface PartnerActionsProps {
  partner: Partner;
  compact?: boolean;
}

export default function PartnerActions({ partner, compact = false }: PartnerActionsProps) {
  const router = useRouter();
  const name = fullName(partner.first_name ?? '', partner.last_name ?? '') || 'Diesen Partner';

  const [isToggling, setIsToggling] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState('');

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [isReinstating, setIsReinstating] = useState(false);
  const [reinstateOpen, setReinstateOpen] = useState(false);
  const [newLicenseStart, setNewLicenseStart] = useState(todayISO());
  const [newDuration, setNewDuration] = useState<12 | 1>(12);

  async function handleToggleStatus() {
    setIsToggling(true);
    try {
      const result = await togglePartnerStatusAction(partner.id, !partner.is_active);
      if (result?.error) { toast.error(result.error); return; }
      toast.success(partner.is_active ? `${name} wurde deaktiviert.` : `${name} wurde aktiviert.`);
      setToggleOpen(false);
      router.refresh();
    } catch {
      toast.error('Aktion fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsToggling(false);
    }
  }

  async function handleDelete() {
    if (confirmValue !== 'LÖSCHEN') return;
    setIsDeleting(true);
    try {
      const result = await deletePartnerAction(partner.id);
      if (result?.error) { toast.error(result.error); return; }
      toast.success(`${name} und alle zugehörigen Daten wurden gelöscht.`);
      setDeleteOpen(false);
      router.push('/admin/partners');
    } catch {
      toast.error('Löschen fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsDeleting(false);
      setConfirmValue('');
    }
  }

  async function handleCancel() {
    setIsCancelling(true);
    try {
      const result = await cancelPartnerAction(partner.id, cancelReason);
      if (result?.error) { toast.error(result.error); return; }
      toast.success(`Kündigung für ${name} wurde gespeichert.`);
      setCancelOpen(false);
      setCancelReason('');
      router.refresh();
    } catch {
      toast.error('Kündigung fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleReinstate() {
    if (!newLicenseStart) return;
    setIsReinstating(true);
    try {
      const result = await reinstatePartnerAction(partner.id, newLicenseStart, newDuration);
      if (result?.error) { toast.error(result.error); return; }
      toast.success(`Kündigung für ${name} wurde entfernt. Neue Lizenz startet am ${newLicenseStart}.`);
      setReinstateOpen(false);
      router.refresh();
    } catch {
      toast.error('Reaktivierung fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsReinstating(false);
    }
  }

  function handleDeleteOpenChange(value: boolean) {
    if (!value) setConfirmValue('');
    setDeleteOpen(value);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Toggle active status */}
      {partner.is_active ? (
        <AlertDialog open={toggleOpen} onOpenChange={setToggleOpen}>
          <AlertDialogTrigger asChild>
            {compact ? (
              <button type="button" title="Deaktivieren" className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors">
                <ShieldOff className="w-4 h-4" />
              </button>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50 hover:border-amber-300">
                <ShieldOff className="w-3.5 h-3.5" /> Deaktivieren
              </Button>
            )}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Partner deaktivieren?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{name}</strong> wird deaktiviert und kann sich nicht mehr einloggen. Der Account und alle Daten bleiben erhalten.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isToggling}>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleStatus} disabled={isToggling} className="bg-amber-600 hover:bg-amber-700 gap-2">
                {isToggling && <Loader2 className="w-4 h-4 animate-spin" />} Deaktivieren
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        compact ? (
          <button type="button" title="Aktivieren" disabled={isToggling} onClick={handleToggleStatus}
            className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50">
            {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          </button>
        ) : (
          <Button variant="outline" size="sm" disabled={isToggling} onClick={handleToggleStatus}
            className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300">
            {isToggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            Aktivieren
          </Button>
        )
      )}

      {/* Cancel / Reinstate */}
      {partner.is_cancelled ? (
        /* Reinstate — remove cancellation */
        <AlertDialog open={reinstateOpen} onOpenChange={setReinstateOpen}>
          <AlertDialogTrigger asChild>
            {compact ? (
              <button type="button" title="Kündigung entfernen" className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300">
                <RefreshCw className="w-3.5 h-3.5" /> Kündigung entfernen
              </Button>
            )}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kündigung entfernen & Lizenz neu starten</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">Kündigung für <strong>{name}</strong> entfernen und eine neue Lizenz starten.</p>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Neuer Lizenzstart</label>
                    <Input type="date" value={newLicenseStart} onChange={e => setNewLicenseStart(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Laufzeit</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setNewDuration(12)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${newDuration === 12 ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        12 Monate
                      </button>
                      <button type="button" onClick={() => setNewDuration(1)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${newDuration === 1 ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        Monatlich
                      </button>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isReinstating}>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleReinstate} disabled={isReinstating || !newLicenseStart} className="gap-2">
                {isReinstating && <Loader2 className="w-4 h-4 animate-spin" />} Kündigung entfernen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        /* Cancel */
        <AlertDialog open={cancelOpen} onOpenChange={v => { if (!v) setCancelReason(''); setCancelOpen(v); }}>
          <AlertDialogTrigger asChild>
            {compact ? (
              <button type="button" title="Kündigen" className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors">
                <XCircle className="w-4 h-4" />
              </button>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5 text-orange-700 border-orange-200 hover:bg-orange-50 hover:border-orange-300">
                <XCircle className="w-3.5 h-3.5" /> Kündigen
              </Button>
            )}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Partner kündigen?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Kündigung für <strong>{name}</strong> erfassen. Der Account bleibt erhalten, wird aber als &ldquo;Gekündigt&rdquo; markiert.
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Kündigungsgrund <span className="text-gray-400 font-normal">(optional)</span></label>
                    <Textarea
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      placeholder="z.B. Auf Wunsch des Partners, zu teuer, …"
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCancelling}>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} disabled={isCancelling} className="bg-orange-600 hover:bg-orange-700 gap-2">
                {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />} Kündigung speichern
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogTrigger asChild>
          {compact ? (
            <button type="button" title="Löschen" className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <Button variant="outline" size="sm" className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300">
              <Trash2 className="w-3.5 h-3.5" /> Löschen
            </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700">Partner unwiderruflich löschen</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  <strong>Achtung:</strong> Durch das Löschen von <strong>{name}</strong> werden <strong>ALLE zugehörigen Kundendaten unwiderruflich gelöscht</strong>.
                </p>
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                  <p className="text-xs text-red-700 font-medium">Folgendes wird dauerhaft gelöscht:</p>
                  <ul className="mt-1.5 text-xs text-red-600 space-y-0.5 list-disc list-inside">
                    <li>Partner-Account und Profildaten</li>
                    <li>Alle zugeordneten Kunden</li>
                    <li>Alle Kundendokumente und Verträge</li>
                  </ul>
                </div>
                <div className="space-y-1.5 pt-1">
                  <p className="text-sm text-gray-700">Gib <strong className="font-mono">LÖSCHEN</strong> ein, um zu bestätigen:</p>
                  <Input value={confirmValue} onChange={e => setConfirmValue(e.target.value)} placeholder="LÖSCHEN" className="font-mono" autoComplete="off" spellCheck={false} />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting || confirmValue !== 'LÖSCHEN'}
              className="bg-red-600 hover:bg-red-700 gap-2 disabled:opacity-50">
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />} Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
