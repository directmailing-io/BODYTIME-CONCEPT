'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText, Video, Link as LinkIcon, ExternalLink, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { createDocumentAction, updateDocumentAction, deleteDocumentAction, toggleDocumentPublishAction } from '@/actions/documents';

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-500" />,
  video: <Video className="h-5 w-5 text-blue-500" />,
  link: <LinkIcon className="h-5 w-5 text-green-500" />,
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
      <div className="grid grid-cols-2 gap-3">
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
      {/* Header action */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Hinzufügen
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <FolderOpen className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">Noch keine Dokumente</p>
          <p className="text-xs text-gray-400 mt-1">Füge dein erstes Dokument hinzu.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
              {/* Main row */}
              <div className="flex items-center gap-3 p-3 sm:p-4">
                {/* Type icon */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {typeIcons[doc.type]}
                </div>

                {/* Text + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm truncate max-w-[200px] sm:max-w-none">{doc.title}</p>
                    {doc.category && (
                      <Badge variant="neutral" className="text-[10px] shrink-0">{doc.category}</Badge>
                    )}
                    <Badge variant={doc.is_published ? 'success' : 'neutral'} className="text-[10px] shrink-0">
                      {doc.is_published ? 'Veröffentlicht' : 'Entwurf'}
                    </Badge>
                  </div>
                  {doc.description && (
                    <p className="text-xs text-gray-500 truncate">{doc.description}</p>
                  )}
                </div>

                {/* Actions — touch-friendly */}
                <div className="flex items-center gap-1 shrink-0">
                  {(doc.file_url || doc.video_url) && (
                    <a
                      href={doc.file_url || doc.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title="Öffnen"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleTogglePublish(doc.id, !doc.is_published)}
                    className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title={doc.is_published ? 'Verbergen' : 'Veröffentlichen'}
                  >
                    {doc.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setEditDoc(doc)}
                    className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Bearbeiten"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Dokument löschen?</AlertDialogTitle>
                        <AlertDialogDescription>„{doc.title}" wird unwiderruflich gelöscht.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(doc.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
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
