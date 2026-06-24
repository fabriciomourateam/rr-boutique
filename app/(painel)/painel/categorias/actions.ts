'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { toSlug } from '@/lib/slug'

export async function createCategory(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return
  const supabase = await createClient()
  await supabase.from('categories').insert({ name, slug: toSlug(name) })
  revalidatePath('/painel/categorias')
  revalidatePath('/', 'layout')
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get('id'))
  const supabase = await createClient()
  await supabase.from('categories').delete().eq('id', id)
  revalidatePath('/painel/categorias')
  revalidatePath('/', 'layout')
}
