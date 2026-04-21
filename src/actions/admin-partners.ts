'use server';
import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { createPartnerSchema } from '@/lib/validations/partner';
import { sendMail } from '@/lib/email/mailer';
import { invitePartnerEmail, accountDeactivatedEmail, accountReactivatedEmail } from '@/lib/email/templates';
import type { ActionResult } from '@/types';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht authentifiziert');
  const { data: profile } = await supabase
    .from('bt_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    throw new Error('Keine Berechtigung');
  }
  return { user, profile, supabase };
}

export async function createPartnerAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const { user: adminUser, supabase } = await requireAdmin();
    const adminClient = createAdminClient();

    const raw = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      password: formData.get('password') || undefined,
      send_invite: formData.get('send_invite') === 'true',
      license_start: formData.get('license_start') as string,
      license_duration_months: Number(formData.get('license_duration_months') ?? 12),
    };

    const parsed = createPartnerSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    const { first_name, last_name, email, password, send_invite, license_start, license_duration_months } = parsed.data;

    const { data: existing } = await adminClient.auth.admin.listUsers();
    if (existing?.users.some((u: { email?: string }) => u.email === email)) {
      return { success: false, error: 'Diese E-Mail-Adresse ist bereits vergeben.' };
    }

    let newUserId: string;

    if (password && !send_invite) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name, last_name, role: 'partner' },
      });
      if (error || !data.user) {
        return { success: false, error: 'Benutzer konnte nicht erstellt werden.' };
      }
      newUserId = data.user.id;
    } else {
      const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { first_name, last_name, role: 'partner' },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/invite`,
      });
      if (error || !data.user) {
        return { success: false, error: 'Einladung konnte nicht gesendet werden.' };
      }
      newUserId = data.user.id;
    }

    await adminClient.from('bt_partner_profiles').insert({
      user_id: newUserId,
      license_start,
      license_duration_months,
    });

    await supabase.from('bt_audit_logs').insert({
      user_id: adminUser.id,
      action: 'partner.created',
      table_name: 'bt_profiles',
      record_id: newUserId,
      new_values: { email, first_name, last_name, license_start },
    });

    if (password && !send_invite) {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
      await sendMail({
        to: email,
        subject: 'BODYTIME concept – Ihr Partner-Zugang',
        html: invitePartnerEmail({ firstName: first_name, lastName: last_name, inviteUrl: loginUrl }).html,
      }).catch((e) => console.error('[createPartner email]', e));
    }

    revalidatePath('/admin/partners');
    return { success: true, data: { id: newUserId } };
  } catch (err) {
    console.error('[createPartnerAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function togglePartnerStatusAction(
  partnerId: string,
  activate: boolean,
): Promise<ActionResult> {
  try {
    const { user: adminUser, supabase } = await requireAdmin();
    const adminClient = createAdminClient();

    const { data: profile } = await supabase
      .from('bt_profiles')
      .select('first_name, last_name, email, is_active')
      .eq('id', partnerId)
      .single();

    if (!profile) return { success: false, error: 'Partner nicht gefunden.' };
    if (profile.is_active === activate) {
      return { success: false, error: 'Status ist bereits korrekt.' };
    }

    const { error } = await supabase
      .from('bt_profiles')
      .update({ is_active: activate })
      .eq('id', partnerId);

    if (error) return { success: false, error: 'Status konnte nicht geändert werden.' };

    await adminClient.auth.admin.updateUserById(partnerId, {
      ban_duration: activate ? 'none' : '87600h',
    });

    await supabase.from('bt_audit_logs').insert({
      user_id: adminUser.id,
      action: activate ? 'partner.activated' : 'partner.deactivated',
      table_name: 'bt_profiles',
      record_id: partnerId,
      old_values: { is_active: !activate },
      new_values: { is_active: activate },
    });

    const emailPayload = activate
      ? accountReactivatedEmail({
          firstName: profile.first_name,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
        })
      : accountDeactivatedEmail({ firstName: profile.first_name });

    await sendMail({ to: profile.email, ...emailPayload }).catch((e) =>
      console.error('[togglePartnerStatus email]', e),
    );

    revalidatePath('/admin/partners');
    return { success: true };
  } catch (err) {
    console.error('[togglePartnerStatusAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function updatePartnerNotesAction(partnerId: string, notes: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('bt_partner_profiles')
      .upsert({ user_id: partnerId, admin_notes: notes || null }, { onConflict: 'user_id' });
    if (error) {
      console.error('[updatePartnerNotesAction] upsert error:', JSON.stringify(error));
      return { success: false, error: 'Notiz konnte nicht gespeichert werden.' };
    }
    revalidatePath(`/admin/partners/${partnerId}`);
    return { success: true };
  } catch (err) {
    console.error('[updatePartnerNotesAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function updatePartnerLicenseAction(
  partnerId: string,
  licenseStart: string,
  durationMonths: number,
  noticeMonths: number,
): Promise<ActionResult> {
  try {
    const { user: adminUser, supabase } = await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('bt_partner_profiles')
      .upsert(
        { user_id: partnerId, license_start: licenseStart, license_duration_months: durationMonths, cancellation_notice_months: noticeMonths },
        { onConflict: 'user_id' },
      );

    if (error) return { success: false, error: 'Lizenzinformationen konnten nicht gespeichert werden.' };

    await supabase.from('bt_audit_logs').insert({
      user_id: adminUser.id,
      action: 'partner.license_updated',
      table_name: 'bt_partner_profiles',
      record_id: partnerId,
      new_values: { license_start: licenseStart, license_duration_months: durationMonths, cancellation_notice_months: noticeMonths },
    });

    revalidatePath(`/admin/partners/${partnerId}`);
    return { success: true };
  } catch (err) {
    console.error('[updatePartnerLicenseAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function cancelPartnerAction(
  partnerId: string,
  reason: string,
): Promise<ActionResult> {
  try {
    const { user: adminUser, supabase } = await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('bt_partner_profiles')
      .update({
        is_cancelled: true,
        cancellation_reason: reason.trim() || null,
        cancellation_date: new Date().toISOString().split('T')[0],
      })
      .eq('user_id', partnerId);

    if (error) return { success: false, error: 'Kündigung konnte nicht gespeichert werden.' };

    await supabase.from('bt_audit_logs').insert({
      user_id: adminUser.id,
      action: 'partner.cancelled',
      table_name: 'bt_partner_profiles',
      record_id: partnerId,
      new_values: { is_cancelled: true, cancellation_reason: reason.trim() || null },
    });

    revalidatePath(`/admin/partners/${partnerId}`);
    revalidatePath('/admin/partners');
    return { success: true };
  } catch (err) {
    console.error('[cancelPartnerAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function reinstatePartnerAction(
  partnerId: string,
  newLicenseStart: string,
  durationMonths: number,
): Promise<ActionResult> {
  try {
    const { user: adminUser, supabase } = await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('bt_partner_profiles')
      .update({
        is_cancelled: false,
        cancellation_reason: null,
        cancellation_date: null,
        license_start: newLicenseStart,
        license_duration_months: durationMonths,
      })
      .eq('user_id', partnerId);

    if (error) return { success: false, error: 'Reaktivierung fehlgeschlagen.' };

    await supabase.from('bt_audit_logs').insert({
      user_id: adminUser.id,
      action: 'partner.reinstated',
      table_name: 'bt_partner_profiles',
      record_id: partnerId,
      new_values: { is_cancelled: false, license_start: newLicenseStart, license_duration_months: durationMonths },
    });

    revalidatePath(`/admin/partners/${partnerId}`);
    revalidatePath('/admin/partners');
    return { success: true };
  } catch (err) {
    console.error('[reinstatePartnerAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function deletePartnerAction(partnerId: string): Promise<ActionResult> {
  try {
    const { user: adminUser, supabase } = await requireAdmin();
    const adminClient = createAdminClient();

    const { data: profile } = await supabase
      .from('bt_profiles')
      .select('email, first_name, last_name')
      .eq('id', partnerId)
      .single();

    if (!profile) return { success: false, error: 'Partner nicht gefunden.' };

    const { error } = await adminClient.auth.admin.deleteUser(partnerId);
    if (error) return { success: false, error: 'Löschen fehlgeschlagen.' };

    await supabase.from('bt_audit_logs').insert({
      user_id: adminUser.id,
      action: 'partner.deleted',
      table_name: 'bt_profiles',
      record_id: partnerId,
      old_values: { email: profile.email, first_name: profile.first_name, last_name: profile.last_name },
    });

    revalidatePath('/admin/partners');
    return { success: true };
  } catch (err) {
    console.error('[deletePartnerAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}
