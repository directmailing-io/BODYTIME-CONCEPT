'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  CheckCircle2, XCircle, Trash2, Eye, Camera, Globe, PlayCircle,
  Briefcase, Music2, Wifi, MapPin, Clock, FileEdit, AlertCircle, Phone,
  Mail, MapPinned,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { approveSteckbriefAction, adminDeleteSteckbriefAction } from '@/actions/admin-steckbrief';
import RejectionDialog from './RejectionDialog';
import { formatDate } from '@/lib/utils';
import type { SteckbriefWithPartner, SteckbriefStatus } from '@/types';

/* ── Status helpers ─────────────────────────────────────────── */

const STATUS_LABEL: Record<SteckbriefStatus, string> = {
  draft:    'Entwurf',
  pending:  'Ausstehend',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt',
};
const STATUS_VARIANT: Record<SteckbriefStatus, 'neutral' | 'warning' | 'success' | 'danger'> = {
  draft:    'neutral',
  pending:  'warning',
  approved: 'success',
  rejected: 'danger',
};

const FILTER_TABS = [
  { key: 'pending',  label: 'Ausstehend' },
  { key: 'approved', label: 'Freigegeben' },
  { key: 'rejected', label: 'Abgelehnt' },
  { key: 'all',      label: 'Alle' },
] as const;

type FilterKey = typeof FILTER_TABS[number]['key'];

/* ── Preview Dialog ─────────────────────────────────────────── */

function PreviewDialog({ bio, onClose }: { bio: SteckbriefWithPartner; onClose: () => void }) {
  const socialLinks = [
    { url: bio.social_instagram, icon: Camera,      label: 'Instagram' },
    { url: bio.social_facebook,  icon: Globe,       label: 'Facebook' },
    { url: bio.social_youtube,   icon: PlayCircle,  label: 'YouTube' },
    { url: bio.social_linkedin,  icon: Briefcase,   label: 'LinkedIn' },
    { url: bio.social_tiktok,    icon: Music2,      label: 'TikTok' },
  ].filter(s => s.url);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Steckbrief ansehen</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-1 overflow-y-auto max-h-[70vh] pr-1">
          {/* Header with image */}
          <div className="flex items-center gap-4">
            {bio.image_url
              ? <img src={bio.image_url} alt="" className="w-20 h-20 rounded-full object-cover shrink-0" />
              : <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-xl font-semibold text-gray-500">
                    {bio.partner_first_name?.[0] ?? ''}{bio.partner_last_name?.[0] ?? ''}
                  </span>
                </div>
            }
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {[bio.contact_first_name, bio.contact_last_name].filter(Boolean).join(' ')
                  || [bio.partner_first_name, bio.partner_last_name].filter(Boolean).join(' ')}
              </p>
              {bio.partner_company && (
                <p className="text-sm text-gray-500">{bio.partner_company}</p>
              )}
              <Badge variant={STATUS_VARIANT[bio.status]} className="mt-1">
                {STATUS_LABEL[bio.status]}
              </Badge>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Kontakt</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {bio.contact_email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  {bio.contact_email}
                </div>
              )}
              {bio.contact_phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  {bio.contact_phone}
                </div>
              )}
              {(bio.contact_zip || bio.contact_city) && (
                <div className="flex items-center gap-2 text-gray-700 sm:col-span-2">
                  <MapPinned className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  {[bio.contact_zip, bio.contact_city].filter(Boolean).join(' ')}
                </div>
              )}
            </div>
          </div>

          {/* Training modes */}
          {bio.training_modes?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Trainingsform</p>
              <div className="flex gap-2 flex-wrap">
                {bio.training_modes.map(m => (
                  <span key={m} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                    {m === 'online' ? <Wifi className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                    {m === 'online' ? 'Online' : 'Vor Ort'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {bio.services?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Leistungen</p>
              <div className="flex flex-wrap gap-2">
                {bio.services.map((s, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Philosophy */}
          {bio.philosophy && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Philosophie</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{bio.philosophy}</p>
            </div>
          )}

          {/* Social */}
          {socialLinks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Social Media</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ url, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rejection reason */}
          {bio.status === 'rejected' && bio.rejection_reason && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Ablehnungsgrund</p>
              <p className="text-sm text-red-700">{bio.rejection_reason}</p>
            </div>
          )}

          {/* Meta */}
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 flex gap-4 flex-wrap">
            <span>Erstellt: {formatDate(bio.created_at)}</span>
            {bio.submitted_at && <span>Eingereicht: {formatDate(bio.submitted_at)}</span>}
            {bio.reviewed_at && <span>Geprüft: {formatDate(bio.reviewed_at)}</span>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Delete Confirmation ─────────────────────────────────────── */

function DeleteConfirmDialog({
  bio, onClose,
}: { bio: SteckbriefWithPartner; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await adminDeleteSteckbriefAction(bio.id);
      if (result.success) {
        toast.success('Steckbrief gelöscht');
        onClose();
        router.refresh();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Steckbrief löschen</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              Der Steckbrief von <strong>
                {[bio.partner_first_name, bio.partner_last_name].filter(Boolean).join(' ')}
              </strong> wird dauerhaft gelöscht.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button
              type="button"
              loading={isPending}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Endgültig löschen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Card ───────────────────────────────────────────────────── */

function SteckbriefCard({ bio }: { bio: SteckbriefWithPartner }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveSteckbriefAction(bio.id);
      if (result.success) {
        toast.success('Freigegeben!');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  const partnerName = [bio.partner_first_name, bio.partner_last_name].filter(Boolean).join(' ') || bio.partner_email || 'Unbekannt';

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            {bio.image_url
              ? <img src={bio.image_url} alt="" className="w-14 h-14 rounded-full object-cover" />
              : <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-base font-semibold text-gray-500">
                    {bio.partner_first_name?.[0] ?? ''}{bio.partner_last_name?.[0] ?? ''}
                  </span>
                </div>
            }
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{partnerName}</p>
                {bio.partner_company && (
                  <p className="text-xs text-gray-500 truncate">{bio.partner_company}</p>
                )}
                <p className="text-xs text-gray-400 truncate">{bio.partner_email}</p>
              </div>
              <Badge variant={STATUS_VARIANT[bio.status]} className="shrink-0">
                {STATUS_LABEL[bio.status]}
              </Badge>
            </div>

            {/* Quick info row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {bio.training_modes?.map(m => (
                <span key={m} className="inline-flex items-center gap-1 text-xs text-gray-500">
                  {m === 'online' ? <Wifi className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                  {m === 'online' ? 'Online' : 'Vor Ort'}
                </span>
              ))}
              {bio.services?.slice(0, 3).map((s, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
              {(bio.services?.length ?? 0) > 3 && (
                <span className="text-xs text-gray-400">+{bio.services.length - 3} weitere</span>
              )}
            </div>

            {/* Date + actions */}
            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <p className="text-xs text-gray-400">
                {bio.submitted_at
                  ? `Eingereicht am ${formatDate(bio.submitted_at)}`
                  : `Erstellt am ${formatDate(bio.created_at)}`}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ansehen
                </Button>

                {bio.status === 'pending' && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      loading={isPending}
                      onClick={handleApprove}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Freigeben
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      onClick={() => setRejectOpen(true)}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Ablehnen
                    </Button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
                  title="Löschen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {rejectOpen && (
        <RejectionDialog
          steckbriefId={bio.id}
          partnerName={partnerName}
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
        />
      )}
      {previewOpen && (
        <PreviewDialog bio={bio} onClose={() => setPreviewOpen(false)} />
      )}
      {deleteOpen && (
        <DeleteConfirmDialog bio={bio} onClose={() => setDeleteOpen(false)} />
      )}
    </>
  );
}

/* ── Main Component ─────────────────────────────────────────── */

export default function FreigabezentraleClient({
  bios,
}: { bios: SteckbriefWithPartner[] }) {
  const [filter, setFilter] = useState<FilterKey>('pending');

  const counts = {
    pending:  bios.filter(b => b.status === 'pending').length,
    approved: bios.filter(b => b.status === 'approved').length,
    rejected: bios.filter(b => b.status === 'rejected').length,
    all:      bios.length,
  };

  const filtered = filter === 'all'
    ? bios
    : bios.filter(b => b.status === filter);

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={[
              'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200',
            ].join(' ')}
          >
            {label}
            {counts[key] > 0 && (
              <span className={[
                'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold',
                filter === key
                  ? 'bg-white/20 text-white'
                  : key === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600',
              ].join(' ')}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            {filter === 'pending'
              ? <Clock className="h-6 w-6 text-gray-400" />
              : filter === 'approved'
              ? <CheckCircle2 className="h-6 w-6 text-gray-400" />
              : <FileEdit className="h-6 w-6 text-gray-400" />}
          </div>
          <p className="text-sm text-gray-500">Keine Steckbriefe in dieser Kategorie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(bio => (
            <SteckbriefCard key={bio.id} bio={bio} />
          ))}
        </div>
      )}
    </div>
  );
}
