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

export async function addStock(formData: FormData) {
  const qty = Math.max(1, Number(formData.get('qty') ?? 1))
  const variantId = String(formData.get('variantId') || '')
  const productId = String(formData.get('productId') || '')
  const supabase = await createClient()
  if (variantId) {
    const { data: v } = await supabase.from('variants').select('stock').eq('id', variantId).maybeSingle()
    if (v) await supabase.from('variants').update({ stock: v.stock + qty }).eq('id', variantId)
  } else if (productId) {
    const { data: p } = await supabase.from('products').select('stock').eq('id', productId).maybeSingle()
    if (p) await supabase.from('products').update({ stock: p.stock + qty }).eq('id', productId)
  }
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
