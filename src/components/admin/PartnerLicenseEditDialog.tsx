'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updatePartnerLicenseAction } from '@/actions/admin-partners';

interface PartnerLicenseEditDialogProps {
  partnerId: string;
  current: {
    license_start: string | null;
    license_duration_months: number | null;
    cancellation_notice_months: number | null;
  };
}

function DurationToggle({
  value,
  onChange,
  options,
}: {
  value: number;
  onChange: (v: number) => void;
  options: { label: string; value: number }[];
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
            value === o.value
              ? 'border-gray-900 bg-gray-50 text-gray-900'
              : 'border-gray-200 hover:border-gray-300 text-gray-600'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function PartnerLicenseEditDialog({ partnerId, current }: PartnerLicenseEditDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [licenseStart, setLicenseStart] = useState(current.license_start ?? '');
  const [duration, setDuration] = useState<number>(current.license_duration_months ?? 12);
  const [notice, setNotice] = useState<number>(current.cancellation_notice_months ?? (current.license_duration_months === 1 ? 1 : 3));

  function handleOpen() {
    // Reset to current values every time dialog opens
    setLicenseStart(current.license_start ?? '');
    setDuration(current.license_duration_months ?? 12);
    setNotice(current.cancellation_notice_months ?? (current.license_duration_months === 1 ? 1 : 3));
    setOpen(true);
  }

  async function handleSave() {
    if (!licenseStart) return;
    setIsSaving(true);
    try {
      const result = await updatePartnerLicenseAction(partnerId, licenseStart, duration, notice);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Lizenzinformationen gespeichert.');
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('Speichern fehlgeschlagen.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="Lizenzinformationen bearbeiten"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Lizenzinformationen bearbeiten</DialogTitle>
            <DialogDescription>
              Lizenzstart, Laufzeit und Kündigungsfrist anpassen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-1">
            {/* License start */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Lizenzstart <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={licenseStart}
                onChange={(e) => setLicenseStart(e.target.value)}
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Laufzeit</label>
              <DurationToggle
                value={duration}
                onChange={setDuration}
                options={[
                  { label: '12 Monate', value: 12 },
                  { label: 'Monatlich', value: 1 },
                ]}
              />
            </div>

            {/* Cancellation notice */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Kündigungsfrist</label>
              <DurationToggle
                value={notice}
                onChange={setNotice}
                options={[
                  { label: '3 Monate', value: 3 },
                  { label: '1 Monat', value: 1 },
                ]}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSaving}>
                  Abbrechen
                </Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={isSaving || !licenseStart} className="gap-2 min-w-[100px]">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
