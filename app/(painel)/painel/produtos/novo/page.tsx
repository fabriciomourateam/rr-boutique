import { getCategories } from '@/lib/data'
import { ProductForm } from '../product-form'

export default async function NovoProduto() {
  const categories = await getCategories()
  return (
    <div>
      <h1 className="text-2xl font-serif mb-4">Cadastrar peça</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
