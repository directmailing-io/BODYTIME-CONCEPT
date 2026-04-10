'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText, Video, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { createDocumentAction, updateDocumentAction, deleteDocumentAction, toggleDocumentPublishAction } from '@/actions/documents';
import { formatDate } from '@/lib/utils';

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4 text-red-500" />,
  video: <Video className="h-4 w-4 text-blue-500" />,
  link: <LinkIcon className="h-4 w-4 text-green-500" />,
};

function DocumentForm({ initial, onSubmit, isPending }: {
  initial?: any;
  onSubmit: (fd: FormData) => void;
  isPending: boolean;
}) {
  const [docType, setDocType] = useState(initial?.type ?? 'pdf');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('type', docType);
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="title" label="Titel" required defaultValue={initial?.title} />
      <Textarea name="description" label="Beschreibung" rows={2} defaultValue={initial?.description ?? ''} />
      <div className="grid grid-cols-2 gap-4">
        <Input name="category" label="Kategorie" placeholder="z.B. EMS-Training" defaultValue={initial?.category ?? ''} />
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Typ</label>
          <Select defaultValue={docType} onValueChange={setDocType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {(docType === 'pdf' || docType === 'link') && (
        <Input name="file_url" label="URL" type="url" placeholder="https://..." defaultValue={initial?.file_url ?? ''} />
      )}
      {docType === 'video' && (
        <Input name="video_url" label="Video-URL" type="url" placeholder="https://..." defaultValue={initial?.video_url ?? ''} />
      )}
      <div className="flex items-center gap-3">
        <input type="checkbox" name="is_published" value="true" id="is_published" defaultChecked={initial?.is_published} className="rounded" />
        <label htmlFor="is_published" className="text-sm text-gray-700">Sofort veröffentlichen</label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isPending}>Speichern</Button>
      </div>
    </form>
  );
}

export default function AdminDocumentsClient({ documents }: { documents: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<any>(null);

  const handleCreate = (fd: FormData) => {
    startTransition(async () => {
      const result = await createDocumentAction(fd);
      if (result.success) { toast.success('Dokument gespeichert'); setCreateOpen(false); router.refresh(); }
      else toast.error(result.error ?? 'Fehler');
    });
  };

  const handleEdit = (fd: FormData) => {
    startTransition(async () => {
      const result = await updateDocumentAction(editDoc.id, fd);
      if (result.success) { toast.success('Dokument aktualisiert'); setEditDoc(null); router.refresh(); }
      else toast.error(result.error ?? 'Fehler');
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteDocumentAction(id);
      if (result.success) { toast.success('Gelöscht'); router.refresh(); }
      else toast.error(result.error ?? 'Fehler');
    });
  };

  const handleTogglePublish = (id: string, publish: boolean) => {
    startTransition(async () => {
      const result = await toggleDocumentPublishAction(id, publish);
      if (result.success) router.refresh();
      else toast.error(result.error ?? 'Fehler');
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Hinzufügen
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-gray-400 text-sm">Noch keine Dokumente vorhanden.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {documents.map(doc => (
            <Card key={doc.id}>
              <CardContent className="py-4 flex items-center gap-4">
                <div className="shrink-0">{typeIcons[doc.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                    {doc.category && <Badge variant="neutral" className="shrink-0">{doc.category}</Badge>}
                    <Badge variant={doc.is_published ? 'success' : 'neutral'}>
                      {doc.is_published ? 'Veröffentlicht' : 'Entwurf'}
                    </Badge>
                  </div>
                  {doc.description && <p className="text-sm text-gray-500 truncate">{doc.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(doc.file_url || doc.video_url) && (
                    <a href={doc.file_url || doc.video_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button onClick={() => handleTogglePublish(doc.id, !doc.is_published)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
                    {doc.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setEditDoc(doc)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Dokument löschen?</AlertDialogTitle>
                        <AlertDialogDescription>„{doc.title}" wird unwiderruflich gelöscht.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(doc.id)}>Löschen</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Neues Dokument</DialogTitle></DialogHeader>
          <DocumentForm onSubmit={handleCreate} isPending={isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editDoc} onOpenChange={open => !open && setEditDoc(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dokument bearbeiten</DialogTitle></DialogHeader>
          {editDoc && <DocumentForm initial={editDoc} onSubmit={handleEdit} isPending={isPending} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
