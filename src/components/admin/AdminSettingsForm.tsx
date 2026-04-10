'use client';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateVoucherCodeAction } from '@/actions/admin-settings';

export default function AdminSettingsForm({ voucherCode }: { voucherCode: string }) {
  const [code, setCode] = useState(voucherCode);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData();
      fd.append('voucher_code', code);
      const result = await updateVoucherCodeAction(fd);
      if (result.success) {
        toast.success('Gutschein-Code gespeichert');
      } else {
        toast.error(result.error ?? 'Fehler beim Speichern');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="z. B. BODYCONCEPT1"
        className="flex-1"
      />
      <Button type="submit" loading={isPending}>Speichern</Button>
    </form>
  );
}
