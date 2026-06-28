'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { reaisToCents } from '@/lib/money'
import { getAllProductsAdmin } from '@/lib/data'
import { finalPriceCents } from '@/lib/pricing'
import type { Product } from '@/lib/types'

type Line = {
  productId: string
  variantId: string | null
  description: string
  quantity: number
  amountCents: number
}

function buildLines(formData: FormData, products: Product[]): Line[] {
  const byId = new Map(products.map((p) => [p.id, p]))
  const productIds = formData.getAll('itemProductId').map(String)
  const variantIds = formData.getAll('itemVariantId').map(String)
  const quantities = formData.getAll('itemQty').map((v) => Math.max(1, Number(v) || 1))
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
      productId: pid, variantId: vid,
      description: `${product.name}${extra}`,
      quantity: qty, amountCents: finalPriceCents(product) * qty,
    })
  }
  return lines
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function decrementStock(supabase: any, line: Line) {
  if (line.variantId) {
    const { data: v } = await supabase.from('variants').select('stock').eq('id', line.variantId).maybeSingle()
    if (v) await supabase.from('variants').update({ stock: Math.max(0, v.stock - line.quantity) }).eq('id', line.variantId)
  } else {
    const { data: p } = await supabase.from('products').select('stock,has_grid').eq('id', line.productId).maybeSingle()
    if (p && !p.has_grid) await supabase.from('products').update({ stock: Math.max(0, p.stock - line.quantity) }).eq('id', line.productId)
  }
}
async function restoreStock(supabase: any, item: { productId: string | null; variantId: string | null; quantity: number }) {
  if (item.variantId) {
    const { data: v } = await supabase.from('variants').select('stock').eq('id', item.variantId).maybeSingle()
    if (v) await supabase.from('variants').update({ stock: v.stock + item.quantity }).eq('id', item.variantId)
  } else if (item.productId) {
    const { data: p } = await supabase.from('products').select('stock,has_grid').eq('id', item.productId).maybeSingle()
    if (p && !p.has_grid) await supabase.from('products').update({ stock: p.stock + item.quantity }).eq('id', item.productId)
  }
}
async function recomputePaid(supabase: any, orderId: string) {
  const { data: order } = await supabase.from('credit_sales').select('amount_cents').eq('id', orderId).maybeSingle()
  if (!order) return
  const { data: pays } = await supabase.from('credit_sale_payments').select('amount_cents, paid_date').eq('credit_sale_id', orderId)
  const total = order.amount_cents
  const sum = (pays ?? []).reduce((s: number, p: any) => s + p.amount_cents, 0)
  const quitado = total > 0 && sum >= total
  const lastDate = (pays ?? []).map((p: any) => p.paid_date).sort().slice(-1)[0] ?? null
  await supabase.from('credit_sales').update({ paid: quitado, paid_at: quitado ? lastDate : null }).eq('id', orderId)
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function orderFields(formData: FormData, lines: Line[]) {
  const itemsTotal = lines.reduce((s, l) => s + l.amountCents, 0)
  const freight = reaisToCents(String(formData.get('freight') ?? '0'))
  const overrideRaw = String(formData.get('amount') ?? '').trim()
  const total = overrideRaw ? reaisToCents(overrideRaw) : itemsTotal + freight
  const summary = lines.map((l) => (l.quantity > 1 ? `${l.quantity}x ${l.description}` : l.description)).join(', ')
  return {
    customer_name: String(formData.get('customerName') ?? '').trim(),
    customer_whatsapp: String(formData.get('customerWhatsapp') ?? '').replace(/\D/g, ''),
    description: summary,
    amount_cents: total,
    freight_cents: freight,
    quantity: lines.reduce((s, l) => s + l.quantity, 0),
    purchase_date: String(formData.get('purchaseDate') || '') || null,
    due_date: String(formData.get('dueDate') || '') || null,
  }
}

function revalidatePaths() {
  revalidatePath('/painel/fiado')
  revalidatePath('/painel/produtos')
  revalidatePath('/painel/financeiro')
  revalidatePath('/painel')
  revalidatePath('/', 'layout')
}

export async function createCreditSale(formData: FormData) {
  const supabase = await createClient()
  const products = await getAllProductsAdmin()
  const lines = buildLines(formData, products)
  if (lines.length === 0) return
  const { data: order } = await supabase.from('credit_sales').insert(orderFields(formData, lines)).select('id').single()
  const orderId = order!.id
  await supabase.from('credit_sale_items').insert(
    lines.map((l) => ({ credit_sale_id: orderId, product_id: l.productId, variant_id: l.variantId, description: l.description, quantity: l.quantity, amount_cents: l.amountCents })),
  )
  for (const l of lines) await decrementStock(supabase, l)
  revalidatePaths()
  redirect('/painel/fiado')
}

export async function updateCreditSale(formData: FormData) {
  const supabase = await createClient()
  const orderId = String(formData.get('id'))
  const products = await getAllProductsAdmin()
  const lines = buildLines(formData, products)
  if (lines.length === 0) return
  // restaura estoque dos itens antigos
  const { data: oldItems } = await supabase.from('credit_sale_items').select('product_id, variant_id, quantity').eq('credit_sale_id', orderId)
  for (const it of oldItems ?? []) await restoreStock(supabase, { productId: it.product_id, variantId: it.variant_id, quantity: it.quantity })
  await supabase.from('credit_sale_items').delete().eq('credit_sale_id', orderId)
  // novos itens + baixa
  await supabase.from('credit_sale_items').insert(
    lines.map((l) => ({ credit_sale_id: orderId, product_id: l.productId, variant_id: l.variantId, description: l.description, quantity: l.quantity, amount_cents: l.amountCents })),
  )
  for (const l of lines) await decrementStock(supabase, l)
  await supabase.from('credit_sales').update(orderFields(formData, lines)).eq('id', orderId)
  await recomputePaid(supabase, orderId)
  revalidatePaths()
  redirect('/painel/fiado')
}

export async function addPayment(formData: FormData) {
  const orderId = String(formData.get('orderId'))
  const amount = reaisToCents(String(formData.get('amount') ?? '0'))
  if (amount <= 0) return
  const today = new Date().toISOString().slice(0, 10)
  const paidDate = String(formData.get('paidDate') || '') || today
  const method = String(formData.get('method') ?? '').trim()
  const supabase = await createClient()
  await supabase.from('credit_sale_payments').insert({ credit_sale_id: orderId, amount_cents: amount, paid_date: paidDate, method })
  await recomputePaid(supabase, orderId)
  revalidatePaths()
}

export async function deletePayment(formData: FormData) {
  const id = String(formData.get('id'))
  const orderId = String(formData.get('orderId'))
  const supabase = await createClient()
  await supabase.from('credit_sale_payments').delete().eq('id', id)
  await recomputePaid(supabase, orderId)
  revalidatePaths()
}

export async function deleteCreditSale(formData: FormData) {
  const id = String(formData.get('id'))
  const supabase = await createClient()
  const { data: items } = await supabase.from('credit_sale_items').select('product_id, variant_id, quantity').eq('credit_sale_id', id)
  for (const it of items ?? []) await restoreStock(supabase, { productId: it.product_id, variantId: it.variant_id, quantity: it.quantity })
  await supabase.from('credit_sales').delete().eq('id', id)
  revalidatePaths()
}
