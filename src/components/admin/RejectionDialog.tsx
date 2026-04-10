'use client';
import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { rejectSteckbriefAction } from '@/actions/admin-steckbrief';
import { toast } from 'sonner';

interface Props {
  steckbriefId: string;
  partnerName: string;
  open: boolean;
  onClose: () => void;
}

export default function RejectionDialog({ steckbriefId, partnerName, open, onClose }: Props) {
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleReject = () => {
    if (!reason.trim()) return;
    startTransition(async () => {
      const result = await rejectSteckbriefAction(steckbriefId, reason);
      if (result.success) {
        toast.success('Steckbrief abgelehnt');
        setReason('');
        onClose();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Steckbrief ablehnen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-gray-600">
            Teile <strong>{partnerName}</strong> mit, was geändert werden muss.
          </p>
          <Textarea
            label="Ablehnungsgrund"
            placeholder="Bitte beschreibe, was geändert oder ergänzt werden soll…"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={1000}
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button
              type="button"
              disabled={!reason.trim()}
              loading={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleReject}
            >
              Ablehnen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
