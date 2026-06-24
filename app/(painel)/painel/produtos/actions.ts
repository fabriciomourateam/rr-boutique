'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleVisible(formData: FormData) {
  const id = String(formData.get('id'))
  const next = String(formData.get('next')) === 'true'
  const supabase = await createClient()
  await supabase.from('products').update({ visible: next }).eq('id', id)
  revalidatePath('/painel/produtos')
  revalidatePath('/', 'layout')
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get('id'))
  const supabase = await createClient()
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/painel/produtos')
  revalidatePath('/', 'layout')
}
