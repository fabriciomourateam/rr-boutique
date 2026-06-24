import { notFound } from 'next/navigation'
import { getCategories, getAllProductsAdmin } from '@/lib/data'
import { ProductForm } from '../product-form'

export default async function EditarProduto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [categories, products] = await Promise.all([getCategories(), getAllProductsAdmin()])
  const product = products.find((p) => p.id === id)
  if (!product) notFound()
  return (
    <div>
      <h1 className="text-2xl font-serif mb-4">Editar peça</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
