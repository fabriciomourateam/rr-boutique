import Link from 'next/link'
import { getAllProductsAdmin } from '@/lib/data'
import { CreditSaleForm } from '../credit-sale-form'

export default async function NovoFiado() {
  const products = await getAllProductsAdmin()
  return (
    <div>
      <h1 className="text-2xl font-serif mb-4">Registrar fiado</h1>
      {products.length === 0 ? (
        <p className="text-neutral-500">
          Cadastre uma peça primeiro em{' '}
          <Link href="/painel/produtos/novo" className="text-[#E89BB0] underline">Produtos</Link>{' '}
          para registrar uma venda fiado.
        </p>
      ) : (
        <CreditSaleForm products={products} />
      )}
    </div>
  )
}
