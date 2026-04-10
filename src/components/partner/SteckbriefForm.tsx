'use client';
import { useState, useTransition, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Camera, Plus, X, Wifi, MapPin, CheckCircle2, Clock, AlertCircle,
  FileEdit, Trash2, Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  InstagramIcon, FacebookIcon, YouTubeIcon, LinkedInIcon, TikTokIcon,
} from '@/components/ui/SocialIcons';
import { upsertSteckbriefAction, uploadSteckbriefImageAction, deleteSteckbriefAction } from '@/actions/steckbrief';
import { steckbriefSchema, type SteckbriefInput } from '@/lib/validations/steckbrief';
import type { Steckbrief } from '@/types';
import SteckbriefImageCropper from './SteckbriefImageCropper';

/* ── Status config ──────────────────────────────────────────── */

const STATUS_CONFIG = {
  draft: {
    icon: FileEdit,
    bg: 'bg-gray-50 border-gray-200',
    iconColor: 'text-gray-500',
    titleColor: 'text-gray-700',
    textColor: 'text-gray-600',
    label: 'Entwurf',
    message: 'Dein Steckbrief ist noch nicht eingereicht. Fülle die Felder aus und reiche ihn zur Freigabe ein.',
  },
  pending: {
    icon: Clock,
    bg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-800',
    textColor: 'text-amber-700',
    label: 'Wird geprüft',
    message: 'Dein Steckbrief wurde eingereicht und wird aktuell geprüft. Du erhältst nach der Prüfung eine Rückmeldung.',
  },
  approved: {
    icon: CheckCircle2,
    bg: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    textColor: 'text-green-700',
    label: 'Freigegeben',
    message: 'Dein Steckbrief ist freigegeben und auf der Website sichtbar. Wenn du Änderungen speicherst, wird er automatisch erneut zur Prüfung eingereicht.',
  },
  rejected: {
    icon: AlertCircle,
    bg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-700',
    textColor: 'text-red-600',
    label: 'Abgelehnt',
    message: null,
  },
} as const;

/* ── Social media fields config ─────────────────────────────── */

const SOCIAL_FIELDS = [
  { field: 'social_instagram', Icon: InstagramIcon, label: 'Instagram', placeholder: 'https://instagram.com/deinprofil' },
  { field: 'social_facebook',  Icon: FacebookIcon,  label: 'Facebook',  placeholder: 'https://facebook.com/deineseite' },
  { field: 'social_youtube',   Icon: YouTubeIcon,   label: 'YouTube',   placeholder: 'https://youtube.com/@deinkanal' },
  { field: 'social_linkedin',  Icon: LinkedInIcon,  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/deinprofil' },
  { field: 'social_tiktok',    Icon: TikTokIcon,    label: 'TikTok',    placeholder: 'https://tiktok.com/@deinprofil' },
] as const;

/* ── Component ──────────────────────────────────────────────── */

export default function SteckbriefForm({
  bio,
  partnerFirstName,
  partnerLastName,
}: {
  bio: Steckbrief | null;
  partnerFirstName: string;
  partnerLastName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [services, setServices] = useState<string[]>(bio?.services ?? []);
  const [serviceInput, setServiceInput] = useState('');
  const [trainingModes, setTrainingModes] = useState<string[]>(bio?.training_modes ?? []);
  const [imageUrl, setImageUrl] = useState<string | null>(bio?.image_url ?? null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SteckbriefInput>({
    resolver: zodResolver(steckbriefSchema),
    defaultValues: {
      contact_email:      bio?.contact_email ?? '',
      contact_phone:      bio?.contact_phone ?? '',
      contact_zip:        (bio as any)?.contact_zip ?? '',
      contact_city:       (bio as any)?.contact_city ?? '',
      philosophy:         bio?.philosophy ?? '',
      social_instagram:   bio?.social_instagram ?? '',
      social_facebook:    bio?.social_facebook ?? '',
      social_youtube:     bio?.social_youtube ?? '',
      social_linkedin:    bio?.social_linkedin ?? '',
      social_tiktok:      bio?.social_tiktok ?? '',
      services:           bio?.services ?? [],
      training_modes:     bio?.training_modes as ('online' | 'offline')[] ?? [],
    },
  });

  const status = bio?.status ?? 'draft';
  const isPendingStatus = status === 'pending';
  const cfg = STATUS_CONFIG[status];

  /* ── Image handling ─────────────────────────────────────────── */

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    setUploadingImage(true);
    const fd = new FormData();
    fd.append('image', new File([blob], 'profile.jpg', { type: 'image/jpeg' }));
    const result = await uploadSteckbriefImageAction(fd);
    setUploadingImage(false);
    if (result.success && result.data) {
      setImageUrl(result.data.url);
      toast.success('Bild hochgeladen');
    } else {
      toast.error(result.error ?? 'Upload fehlgeschlagen');
    }
  };

  /* ── Services ────────────────────────────────────────────────── */

  const addService = () => {
    const t = serviceInput.trim();
    if (!t || services.includes(t) || services.length >= 30) return;
    setServices(s => [...s, t]);
    setServiceInput('');
  };

  /* ── Form submit ─────────────────────────────────────────────── */

  const onSubmit = (data: SteckbriefInput, submit: boolean) => {
    startTransition(async () => {
      const fd = new FormData();
      // Inject names from account profile – not part of the form fields
      fd.append('contact_first_name', partnerFirstName);
      fd.append('contact_last_name', partnerLastName);
      Object.entries(data).forEach(([k, v]) => {
        if (v != null && k !== 'services' && k !== 'training_modes') fd.append(k, String(v));
      });
      fd.append('services', JSON.stringify(services));
      fd.append('training_modes', JSON.stringify(trainingModes));
      if (imageUrl) fd.append('image_url', imageUrl);

      const result = await upsertSteckbriefAction(fd, submit);
      if (result.success) {
        toast.success(submit ? 'Steckbrief eingereicht!' : 'Entwurf gespeichert');
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  /* ── Delete ──────────────────────────────────────────────────── */

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSteckbriefAction();
      if (result.success) {
        toast.success('Steckbrief gelöscht');
        setDeleteOpen(false);
        setServices([]);
        setTrainingModes([]);
        setImageUrl(null);
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  return (
    <div className="space-y-5">

      {/* ── Status Banner ─────────────────────────────────────────── */}
      {bio && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border ${cfg.bg}`}>
          <cfg.icon className={`h-5 w-5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
          <div>
            <p className={`text-sm font-semibold mb-0.5 ${cfg.titleColor}`}>{cfg.label}</p>
            <p className={`text-sm ${cfg.textColor}`}>
              {status === 'rejected'
                ? <>
                    {bio.rejection_reason && <><strong>Begründung:</strong> {bio.rejection_reason}<br /></>}
                    Bitte nimm die gewünschten Änderungen vor und reiche deinen Steckbrief erneut ein.
                  </>
                : cfg.message}
            </p>
          </div>
        </div>
      )}

      <form>
        {/* ── Profilbild ────────────────────────────────────────────── */}
        <Card className="mb-5">
          <CardHeader><CardTitle>Profilbild</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Large avatar */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage || isPendingStatus}
                className="relative w-36 h-36 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden group shrink-0 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
              >
                {imageUrl
                  ? <img src={imageUrl} alt="Profilbild" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-2">
                      <Camera className="h-8 w-8 text-gray-300" />
                      <span className="text-xs text-gray-400">Kein Bild</span>
                    </div>
                }
                {!isPendingStatus && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                    <Camera className="h-7 w-7 text-white" />
                  </div>
                )}
              </button>

              <div className="text-center sm:text-left">
                <p className="font-medium text-gray-900 mb-1">
                  {uploadingImage ? 'Wird hochgeladen…' : 'Bild hochladen & zuschneiden'}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  JPG, PNG oder WebP · max. 5 MB<br />
                  Nach der Auswahl kannst du das Bild zuschneiden.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || isPendingStatus}
                  loading={uploadingImage}
                >
                  <Camera className="h-4 w-4" />
                  Bild auswählen
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileSelect}
            />
          </CardContent>
        </Card>

        {/* ── Crop Dialog ────────────────────────────────────────────── */}
        {cropSrc && (
          <SteckbriefImageCropper
            imageSrc={cropSrc}
            onConfirm={handleCropConfirm}
            onCancel={() => setCropSrc(null)}
          />
        )}

        {/* ── Kontaktdaten ──────────────────────────────────────────── */}
        <Card className="mb-5">
          <CardHeader><CardTitle>Kontaktdaten</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name kommt automatisch vom Account */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Vorname</p>
              <p className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed">
                {partnerFirstName || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Nachname</p>
              <p className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed">
                {partnerLastName || '—'}
              </p>
            </div>
            <Input
              label="E-Mail-Adresse"
              type="email"
              disabled={isPendingStatus}
              {...register('contact_email')}
              error={errors.contact_email?.message}
            />
            <Input
              label="Telefonnummer"
              type="tel"
              disabled={isPendingStatus}
              {...register('contact_phone')}
              error={errors.contact_phone?.message}
            />
            <Input
              label="PLZ"
              disabled={isPendingStatus}
              {...register('contact_zip')}
              error={errors.contact_zip?.message}
            />
            <Input
              label="Stadt"
              disabled={isPendingStatus}
              {...register('contact_city')}
              error={errors.contact_city?.message}
            />
          </CardContent>
        </Card>

        {/* ── Leistungen ───────────────────────────────────────────── */}
        <Card className="mb-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Leistungen</CardTitle>
              <span className="text-xs text-gray-400">{services.length}/30</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isPendingStatus && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serviceInput}
                  onChange={e => setServiceInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addService(); } }}
                  placeholder="z. B. EMS-Training, Ernährungsberatung…"
                  maxLength={100}
                  disabled={services.length >= 30}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addService}
                  disabled={!serviceInput.trim() || services.length >= 30}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Hinzufügen
                </Button>
              </div>
            )}
            {services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {services.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-sm px-3 py-1.5 rounded-full">
                    {s}
                    {!isPendingStatus && (
                      <button type="button" onClick={() => setServices(sv => sv.filter((_, j) => j !== i))} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Noch keine Leistungen hinzugefügt.</p>
            )}
          </CardContent>
        </Card>

        {/* ── Trainingsform ─────────────────────────────────────────── */}
        <Card className="mb-5">
          <CardHeader><CardTitle>Trainingsform</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              {(['online', 'offline'] as const).map(mode => {
                const active = trainingModes.includes(mode);
                return (
                  <button
                    key={mode}
                    type="button"
                    disabled={isPendingStatus}
                    onClick={() => setTrainingModes(m => m.includes(mode) ? m.filter(x => x !== mode) : [...m, mode])}
                    className={[
                      'flex items-center gap-3 flex-1 p-4 rounded-2xl border-2 transition-all text-left',
                      active ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300',
                      isPendingStatus ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-gray-900' : 'bg-gray-100'}`}>
                      {mode === 'online'
                        ? <Wifi className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                        : <MapPin className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{mode === 'online' ? 'Online' : 'Vor Ort'}</p>
                      <p className="text-xs text-gray-500">{mode === 'online' ? 'Training per Video-Call' : 'Training beim Kunden / Studio'}</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                      {active && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Philosophie ───────────────────────────────────────────── */}
        <Card className="mb-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Meine Philosophie</CardTitle>
              <span className="text-xs text-gray-400">Optional</span>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              label=""
              placeholder="Beschreibe deine Trainingsphilosophie, deinen Ansatz und was dich als Trainer auszeichnet…"
              rows={5}
              disabled={isPendingStatus}
              {...register('philosophy')}
              error={errors.philosophy?.message}
            />
          </CardContent>
        </Card>

        {/* ── Social Media ──────────────────────────────────────────── */}
        <Card className="mb-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Social Media</CardTitle>
              <span className="text-xs text-gray-400">Optional</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {SOCIAL_FIELDS.map(({ field, Icon, label, placeholder }) => (
              <div key={field}>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <Icon size={18} />
                  {label}
                </label>
                <input
                  type="url"
                  placeholder={placeholder}
                  disabled={isPendingStatus}
                  {...register(field as keyof SteckbriefInput)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
                />
                {(errors as Record<string, { message?: string }>)[field]?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {(errors as Record<string, { message?: string }>)[field]?.message}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Action Buttons ────────────────────────────────────────── */}
        {!isPendingStatus && (
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-1">
            {bio && (
              <Button
                type="button"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 sm:mr-auto"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Steckbrief löschen
              </Button>
            )}
            {(status === 'draft' || !bio) && (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={handleSubmit(d => onSubmit(d, false))}
              >
                Entwurf speichern
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSubmit(d => onSubmit(d, true))}
              loading={isPending}
            >
              <Send className="h-4 w-4" />
              {status === 'approved' || status === 'rejected'
                ? 'Speichern & erneut einreichen'
                : 'Zur Freigabe einreichen'}
            </Button>
          </div>
        )}
      </form>

      {/* ── Delete Dialog ─────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Steckbrief löschen</DialogTitle></DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                Dein Steckbrief und das Profilbild werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>Abbrechen</Button>
              <Button type="button" loading={isPending} onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Endgültig löschen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
