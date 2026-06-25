'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { reaisToCents } from '@/lib/money'
import { getAllProductsAdmin } from '@/lib/data'
import { finalPriceCents } from '@/lib/pricing'

export async function createCreditSale(formData: FormData) {
  const supabase = await createClient()

  const productIds = formData.getAll('itemProductId').map(String)
  const variantIds = formData.getAll('itemVariantId').map(String)
  const quantities = formData.getAll('itemQty').map((v) => Math.max(1, Number(v) || 1))

  const products = await getAllProductsAdmin()
  const byId = new Map(products.map((p) => [p.id, p]))

  type Line = { productId: string; variantId: string | null; description: string; quantity: number; amountCents: number }
  const lines: Line[] = []
  for (let i = 0; i < productIds.length; i++) {
    const pid = productIds[i]
    if (!pid) continue
    const product = byId.get(pid)
    if (!product) continue
    const qty = quantities[i] ?? 1
    const vid = variantIds[i] || null
    const variant = vid ? product.variants.find((v) => v.id === vid) : null
    const extra = variant ? ` (${[variant.size, variant.color].filter(Boolean).join(' / ')})` : ''
    lines.push({
      productId: pid,
      variantId: vid,
      description: `${product.name}${extra}`,
      quantity: qty,
      amountCents: finalPriceCents(product) * qty,
    })
  }
  if (lines.length === 0) return

  const computedTotal = lines.reduce((s, l) => s + l.amountCents, 0)
  const overrideRaw = String(formData.get('amount') ?? '').trim()
  const total = overrideRaw ? reaisToCents(overrideRaw) : computedTotal
  const summary = lines.map((l) => (l.quantity > 1 ? `${l.quantity}x ${l.description}` : l.description)).join(', ')
  const dueDate = String(formData.get('dueDate') || '') || null

  const { data: order } = await supabase
    .from('credit_sales')
    .insert({
      customer_name: String(formData.get('customerName') ?? '').trim(),
      customer_whatsapp: String(formData.get('customerWhatsapp') ?? '').replace(/\D/g, ''),
      description: summary,
      amount_cents: total,
      quantity: lines.reduce((s, l) => s + l.quantity, 0),
      due_date: dueDate,
    })
    .select('id')
    .single()

  const orderId = order!.id

  await supabase.from('credit_sale_items').insert(
    lines.map((l) => ({
      credit_sale_id: orderId,
      product_id: l.productId,
      variant_id: l.variantId,
      description: l.description,
      quantity: l.quantity,
      amount_cents: l.amountCents,
    })),
  )

  // baixa de estoque por item
  for (const l of lines) {
    if (l.variantId) {
      const { data: v } = await supabase.from('variants').select('stock').eq('id', l.variantId).maybeSingle()
      if (v) await supabase.from('variants').update({ stock: Math.max(0, v.stock - l.quantity) }).eq('id', l.variantId)
    } else {
      const { data: p } = await supabase.from('products').select('stock,has_grid').eq('id', l.productId).maybeSingle()
      if (p && !p.has_grid) await supabase.from('products').update({ stock: Math.max(0, p.stock - l.quantity) }).eq('id', l.productId)
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
