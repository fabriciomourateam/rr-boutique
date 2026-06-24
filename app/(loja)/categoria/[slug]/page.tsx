import { getProductsByCategory, getCategories } from '@/lib/data'
import { ProductGridFiltered } from '@/components/product-grid-filtered'

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [products, categories] = await Promise.all([getProductsByCategory(slug), getCategories()])
  const cat = categories.find((c) => c.slug === slug)
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl mb-6">{cat?.name ?? 'Produtos'}</h1>
      <ProductGridFiltered products={products} />
    </div>
  )
}
