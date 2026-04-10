'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { deleteCustomerAction } from '@/actions/customers';

export default function DeleteCustomerButton({ customerId, customerName }: { customerId: string; customerName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCustomerAction(customerId);
      if (result.success) {
        toast.success('Kunde gelöscht');
        router.push('/partner/customers');
      } else {
        toast.error(result.error ?? 'Fehler beim Löschen');
      }
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-red-600 border-red-200 hover:bg-red-50">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kunden löschen</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Diese Aktion kann nicht rückgängig gemacht werden.</p>
                <p>Der Kunde <strong>{customerName}</strong> und alle zugehörigen Daten werden dauerhaft gelöscht.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
              <Button type="button" onClick={handleDelete} loading={isPending} className="bg-red-600 hover:bg-red-700 text-white">
                Endgültig löschen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
