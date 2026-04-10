'use client';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfileAction, changePasswordAction, uploadAvatarAction } from '@/actions/profile';
import { updatePartnerProfileSchema, type UpdatePartnerProfileInput } from '@/lib/validations/partner';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations/auth';
import { Camera } from 'lucide-react';

export default function ProfileForm({ profile, partnerProfile }: { profile: any; partnerProfile: any }) {
  const [isPending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url);

  const profileForm = useForm<UpdatePartnerProfileInput>({
    resolver: zodResolver(updatePartnerProfileSchema),
    defaultValues: {
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      company_name: partnerProfile?.company_name ?? '',
      address_street: partnerProfile?.address_street ?? '',
      address_zip: partnerProfile?.address_zip ?? '',
      address_city: partnerProfile?.address_city ?? '',
      address_country: partnerProfile?.address_country ?? 'Deutschland',
      phone: partnerProfile?.phone ?? '',
      website: partnerProfile?.website ?? '',
    }
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onProfileSubmit = (data: UpdatePartnerProfileInput) => {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
      const result = await updateProfileAction(fd);
      if (result.success) toast.success('Profil gespeichert');
      else toast.error(result.error ?? 'Fehler');
    });
  };

  const onPasswordSubmit = (data: ChangePasswordInput) => {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      const result = await changePasswordAction(fd);
      if (result.success) {
        toast.success('Passwort geändert');
        passwordForm.reset();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    const result = await uploadAvatarAction(fd);
    if (result.success && result.data) {
      setAvatarUrl(result.data.url);
      toast.success('Profilbild aktualisiert');
    } else {
      toast.error(result.error ?? 'Upload fehlgeschlagen');
    }
  };

  const initials = `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-semibold text-gray-500">{initials}</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-900 text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="font-medium text-gray-900">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG oder WebP · max. 2 MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
        <Card>
          <CardHeader><CardTitle>Persönliche Daten</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Vorname" required {...profileForm.register('first_name')} error={profileForm.formState.errors.first_name?.message} />
            <Input label="Nachname" required {...profileForm.register('last_name')} error={profileForm.formState.errors.last_name?.message} />
            <Input label="Firmenname" {...profileForm.register('company_name')} className="sm:col-span-2" />
            <Input label="Straße" {...profileForm.register('address_street')} />
            <Input label="PLZ" {...profileForm.register('address_zip')} />
            <Input label="Stadt" {...profileForm.register('address_city')} />
            <Input label="Land" {...profileForm.register('address_country')} />
            <Input label="Telefon" type="tel" {...profileForm.register('phone')} />
            <Input label="Website" type="url" {...profileForm.register('website')} error={profileForm.formState.errors.website?.message} />
          </CardContent>
          <div className="px-6 pb-6 flex justify-end">
            <Button type="submit" loading={isPending}>Änderungen speichern</Button>
          </div>
        </Card>
      </form>

      {/* Password form */}
      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
        <Card>
          <CardHeader><CardTitle>Passwort ändern</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Aktuelles Passwort" type="password" required {...passwordForm.register('currentPassword')} error={passwordForm.formState.errors.currentPassword?.message} />
            <Input label="Neues Passwort" type="password" required {...passwordForm.register('newPassword')} error={passwordForm.formState.errors.newPassword?.message} hint="Min. 8 Zeichen, 1 Großbuchstabe, 1 Zahl" />
            <Input label="Passwort bestätigen" type="password" required {...passwordForm.register('confirmPassword')} error={passwordForm.formState.errors.confirmPassword?.message} />
          </CardContent>
          <div className="px-6 pb-6 flex justify-end">
            <Button type="submit" loading={isPending}>Passwort ändern</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
