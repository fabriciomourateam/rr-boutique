'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { reaisToCents } from '@/lib/money'

export async function createCreditSale(formData: FormData) {
  const supabase = await createClient()
  const productId = String(formData.get('productId') || '') || null
  const variantId = String(formData.get('variantId') || '') || null
  const quantity = Math.max(1, Number(formData.get('quantity') ?? 1))
  const amountCents = reaisToCents(String(formData.get('amount') ?? '0'))
  const dueDate = String(formData.get('dueDate') || '') || null

  await supabase.from('credit_sales').insert({
    customer_name: String(formData.get('customerName') ?? '').trim(),
    customer_whatsapp: String(formData.get('customerWhatsapp') ?? '').replace(/\D/g, ''),
    product_id: productId,
    variant_id: variantId,
    description: String(formData.get('description') ?? '').trim(),
    amount_cents: amountCents,
    quantity,
    due_date: dueDate,
  })

  // Baixa o estoque da variação escolhida, ou do produto simples
  if (variantId) {
    const { data: v } = await supabase.from('variants').select('stock').eq('id', variantId).maybeSingle()
    if (v) await supabase.from('variants').update({ stock: Math.max(0, v.stock - quantity) }).eq('id', variantId)
  } else if (productId) {
    const { data: p } = await supabase.from('products').select('stock,has_grid').eq('id', productId).maybeSingle()
    if (p && !p.has_grid) {
      await supabase.from('products').update({ stock: Math.max(0, p.stock - quantity) }).eq('id', productId)
    }
  }

  revalidatePath('/painel/fiado')
  revalidatePath('/painel/produtos')
  revalidatePath('/painel/financeiro')
  revalidatePath('/', 'layout')
  redirect('/painel/fiado')
}

export async function markPaid(formData: FormData) {
  const id = String(formData.get('id'))
  const today = new Date().toISOString().slice(0, 10)
  const paidAt = String(formData.get('paidAt') || '') || today
  const supabase = await createClient()
  await supabase.from('credit_sales').update({ paid: true, paid_at: paidAt }).eq('id', id)
  revalidatePath('/painel/fiado')
  revalidatePath('/painel/financeiro')
}

export async function markUnpaid(formData: FormData) {
  const id = String(formData.get('id'))
  const supabase = await createClient()
  await supabase.from('credit_sales').update({ paid: false, paid_at: null }).eq('id', id)
  revalidatePath('/painel/fiado')
  revalidatePath('/painel/financeiro')
}

export async function deleteCreditSale(formData: FormData) {
  const id = String(formData.get('id'))
  const supabase = await createClient()
  await supabase.from('credit_sales').delete().eq('id', id)
  revalidatePath('/painel/fiado')
  revalidatePath('/painel/financeiro')
}
