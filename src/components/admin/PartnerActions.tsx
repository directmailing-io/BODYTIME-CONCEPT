'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Trash2, ShieldOff, ShieldCheck } from 'lucide-react';
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
import { togglePartnerStatusAction, deletePartnerAction } from '@/actions/admin-partners';
import { fullName } from '@/lib/utils';

interface Partner {
  id: string;
  is_active: boolean;
  first_name: string | null;
  last_name: string | null;
}

interface PartnerActionsProps {
  partner: Partner;
}

export default function PartnerActions({ partner }: PartnerActionsProps) {
  const router = useRouter();
  const name = fullName(partner.first_name ?? '', partner.last_name ?? '') || 'Diesen Partner';

  // Toggle status state
  const [isToggling, setIsToggling] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState('');

  async function handleToggleStatus() {
    setIsToggling(true);
    try {
      const result = await togglePartnerStatusAction(partner.id, !partner.is_active);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        partner.is_active
          ? `${name} wurde deaktiviert.`
          : `${name} wurde aktiviert.`
      );
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
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${name} und alle zugehörigen Daten wurden gelöscht.`);
      setDeleteOpen(false);
      router.refresh();
    } catch {
      toast.error('Löschen fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsDeleting(false);
      setConfirmValue('');
    }
  }

  function handleDeleteOpenChange(value: boolean) {
    if (!value) setConfirmValue('');
    setDeleteOpen(value);
  }

  return (
    <div className="flex items-center gap-2">
      {/* Toggle status */}
      {partner.is_active ? (
        /* Deactivate — needs confirmation */
        <AlertDialog open={toggleOpen} onOpenChange={setToggleOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
            >
              <ShieldOff className="w-3.5 h-3.5" />
              Deaktivieren
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Partner deaktivieren?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{name}</strong> wird deaktiviert und kann sich nicht mehr einloggen. Der
                Account und alle Daten bleiben erhalten. Du kannst den Partner jederzeit wieder
                aktivieren.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isToggling}>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleToggleStatus}
                disabled={isToggling}
                className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-600 gap-2"
              >
                {isToggling && <Loader2 className="w-4 h-4 animate-spin" />}
                Deaktivieren
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        /* Activate — no confirmation needed */
        <Button
          variant="outline"
          size="sm"
          disabled={isToggling}
          onClick={handleToggleStatus}
          className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
        >
          {isToggling ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5" />
          )}
          Aktivieren
        </Button>
      )}

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Löschen
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700">Partner unwiderruflich löschen</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  <strong>Achtung:</strong> Durch das Löschen von{' '}
                  <strong>{name}</strong> werden{' '}
                  <strong>ALLE zugehörigen Kundendaten unwiderruflich gelöscht</strong>. Diese
                  Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                  <p className="text-xs text-red-700 font-medium">
                    Folgendes wird dauerhaft gelöscht:
                  </p>
                  <ul className="mt-1.5 text-xs text-red-600 space-y-0.5 list-disc list-inside">
                    <li>Partner-Account und Profildaten</li>
                    <li>Alle zugeordneten Kunden</li>
                    <li>Alle Kundendokumente und Verträge</li>
                  </ul>
                </div>
                <div className="space-y-1.5 pt-1">
                  <p className="text-sm text-gray-700">
                    Gib <strong className="font-mono">LÖSCHEN</strong> ein, um zu bestätigen:
                  </p>
                  <Input
                    value={confirmValue}
                    onChange={(e) => setConfirmValue(e.target.value)}
                    placeholder="LÖSCHEN"
                    className="font-mono"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || confirmValue !== 'LÖSCHEN'}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 gap-2 disabled:opacity-50"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
