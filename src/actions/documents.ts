'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { ActionResult } from '@/types';

const documentSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(200),
  description: z.string().max(500).optional().or(z.literal('')),
  category: z.string().max(100).optional().or(z.literal('')),
  type: z.enum(['pdf', 'video', 'link']),
  file_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional().or(z.literal('')),
  is_published: z.coerce.boolean().default(false),
});

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
  return { user, supabase };
}

export async function createDocumentAction(formData: FormData): Promise<ActionResult> {
  try {
    const { user, supabase } = await requireAdmin();
    const raw = Object.fromEntries(formData.entries());
    const parsed = documentSchema.safeParse({ ...raw, is_published: raw.is_published === 'true' });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const { error } = await supabase.from('bt_documents').insert({
      ...parsed.data,
      created_by: user.id,
      file_url: parsed.data.file_url || null,
      video_url: parsed.data.video_url || null,
      category: parsed.data.category || null,
      description: parsed.data.description || null,
    });

    if (error) return { success: false, error: 'Dokument konnte nicht gespeichert werden.' };
    revalidatePath('/admin/documents');
    revalidatePath('/partner/documents');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function updateDocumentAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const raw = Object.fromEntries(formData.entries());
    const parsed = documentSchema.safeParse({ ...raw, is_published: raw.is_published === 'true' });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const { error } = await supabase.from('bt_documents').update({
      ...parsed.data,
      file_url: parsed.data.file_url || null,
      video_url: parsed.data.video_url || null,
      category: parsed.data.category || null,
      description: parsed.data.description || null,
    }).eq('id', id);

    if (error) return { success: false, error: 'Aktualisierung fehlgeschlagen.' };
    revalidatePath('/admin/documents');
    revalidatePath('/partner/documents');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function deleteDocumentAction(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from('bt_documents').delete().eq('id', id);
    if (error) return { success: false, error: 'Löschen fehlgeschlagen.' };
    revalidatePath('/admin/documents');
    revalidatePath('/partner/documents');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function toggleDocumentPublishAction(id: string, publish: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from('bt_documents').update({ is_published: publish }).eq('id', id);
    if (error) return { success: false, error: 'Fehler beim Ändern des Status.' };
    revalidatePath('/admin/documents');
    revalidatePath('/partner/documents');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}
