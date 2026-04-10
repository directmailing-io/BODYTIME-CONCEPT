'use client';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { changePasswordAction } from '@/actions/profile';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations/auth';

export default function AdminPasswordForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordInput) => {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      const result = await changePasswordAction(fd);
      if (result.success) {
        toast.success('Passwort geändert');
        form.reset();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader><CardTitle>Passwort ändern</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Aktuelles Passwort"
            type="password"
            required
            {...form.register('currentPassword')}
            error={form.formState.errors.currentPassword?.message}
          />
          <Input
            label="Neues Passwort"
            type="password"
            required
            {...form.register('newPassword')}
            error={form.formState.errors.newPassword?.message}
            hint="Min. 8 Zeichen, 1 Großbuchstabe, 1 Zahl"
          />
          <Input
            label="Passwort bestätigen"
            type="password"
            required
            {...form.register('confirmPassword')}
            error={form.formState.errors.confirmPassword?.message}
          />
        </CardContent>
        <div className="px-6 pb-6 flex justify-end">
          <Button type="submit" loading={isPending}>Passwort ändern</Button>
        </div>
      </Card>
    </form>
  );
}
