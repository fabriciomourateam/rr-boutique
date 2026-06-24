'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { toSlug } from '@/lib/slug'
import { reaisToCents } from '@/lib/money'

export async function saveProduct(formData: FormData) {
  const supabase = await createClient()
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const hasGrid = String(formData.get('hasGrid')) === 'on'

  const fields = {
    name,
    slug: toSlug(name) + '-' + Math.random().toString(36).slice(2, 6),
    description: String(formData.get('description') ?? ''),
    category_id: String(formData.get('categoryId') || '') || null,
    cost_cents: reaisToCents(String(formData.get('cost') ?? '0')),
    price_cents: reaisToCents(String(formData.get('price') ?? '0')),
    discount_type: String(formData.get('discountType') ?? 'none'),
    discount_value: Number(formData.get('discountValue') ?? 0),
    visible: String(formData.get('visible')) === 'on',
    featured: String(formData.get('featured')) === 'on',
    has_grid: hasGrid,
    stock: hasGrid ? 0 : Number(formData.get('stock') ?? 0),
  }

  let productId = id
  if (id) {
    // mantém o slug atual ao editar
    const { slug: _slug, ...rest } = fields
    void _slug
    await supabase.from('products').update(rest).eq('id', id)
  } else {
    const { data } = await supabase.from('products').insert(fields).select('id').single()
    productId = data!.id
  }

  // Fotos: URLs já enviadas ao Storage (campo escondido photoUrls, separadas por vírgula)
  const photoUrls = String(formData.get('photoUrls') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  await supabase.from('photos').delete().eq('product_id', productId)
  if (photoUrls.length) {
    await supabase.from('photos').insert(
      photoUrls.map((url, i) => ({ product_id: productId, url, order: i })),
    )
  }

  // Variações: campos variantSize[], variantColor[], variantStock[]
  await supabase.from('variants').delete().eq('product_id', productId)
  if (hasGrid) {
    const sizes = formData.getAll('variantSize').map(String)
    const colors = formData.getAll('variantColor').map(String)
    const stocks = formData.getAll('variantStock').map((v) => Number(v))
    const rows = sizes
      .map((size, i) => ({
        product_id: productId,
        size: size || null,
        color: colors[i] || null,
        stock: stocks[i] || 0,
      }))
      .filter((r) => r.size || r.color)
    if (rows.length) await supabase.from('variants').insert(rows)
  }

  revalidatePath('/painel/produtos')
  revalidatePath('/', 'layout')
  redirect('/painel/produtos')
}
