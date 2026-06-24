import { createClient } from '@/lib/supabase/server'
import type { Product, Category, StoreConfig } from '@/lib/types'

const PUBLIC_PRODUCT_COLS =
  'id, slug, name, description, category_id, price_cents, discount_type, discount_value, ' +
  'visible, featured, has_grid, stock, variants(id,size,color,stock), photos(url,order)'

const ADMIN_PRODUCT_COLS =
  'id, slug, name, description, category_id, cost_cents, price_cents, discount_type, discount_value, ' +
  'visible, featured, has_grid, stock, variants(id,size,color,stock), photos(url,order)'

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    categoryId: row.category_id,
    costCents: row.cost_cents ?? 0,
    priceCents: row.price_cents,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    visible: row.visible,
    featured: row.featured,
    hasGrid: row.has_grid,
    stock: row.stock,
    variants: (row.variants ?? []).map((v: any) => ({
      id: v.id, size: v.size, color: v.color, stock: v.stock,
    })),
    photos: (row.photos ?? [])
      .map((p: any) => ({ url: p.url, order: p.order }))
      .sort((a: any, b: any) => a.order - b.order),
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getVisibleProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(PUBLIC_PRODUCT_COLS)
    .eq('visible', true)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapProduct)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(PUBLIC_PRODUCT_COLS)
    .eq('visible', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(PUBLIC_PRODUCT_COLS)
    .eq('slug', slug)
    .eq('visible', true)
    .maybeSingle()
  return data ? mapProduct(data) : null
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()
  if (!cat) return []
  const { data } = await supabase
    .from('products')
    .select(PUBLIC_PRODUCT_COLS)
    .eq('visible', true)
    .eq('category_id', cat.id)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapProduct)
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(ADMIN_PRODUCT_COLS)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapProduct)
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('id,slug,name,parent_id')
    .order('name')
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return (data ?? []).map((c: any) => ({ id: c.id, slug: c.slug, name: c.name, parentId: c.parent_id }))
}

export async function getStoreConfig(): Promise<StoreConfig> {
  const supabase = await createClient()
  const { data } = await supabase.from('store_config').select('*').eq('id', 1).single()
  return {
    name: data?.name ?? 'RR Boutiques',
    whatsapp: data?.whatsapp ?? '',
    pixKey: data?.pix_key ?? '',
    instagram: data?.instagram ?? '',
    bannerUrl: data?.banner_url ?? '',
    aboutText: data?.about_text ?? '',
    exchangeText: data?.exchange_text ?? '',
  }
}
