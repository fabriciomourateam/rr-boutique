import Link from 'next/link'
import { getAllProductsAdmin } from '@/lib/data'
import { formatBRL } from '@/lib/money'
import { totalStock } from '@/lib/stock'
import { toggleVisible, deleteProduct } from './actions'

export default async function ProdutosPage() {
  const products = await getAllProductsAdmin()
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-serif">Produtos</h1>
        <Link href="/painel/produtos/novo" className="px-4 py-2 rounded bg-[#E89BB0] text-black font-medium">
          + Cadastrar peça
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-500 border-b">
            <th className="py-2">Peça</th><th>Preço</th><th>Estoque</th><th>Na loja?</th><th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">
                <Link href={`/painel/produtos/${p.id}`} className="hover:underline">{p.name}</Link>
              </td>
              <td>{formatBRL(p.priceCents)}</td>
              <td>{totalStock(p)}</td>
              <td>
                <form action={toggleVisible}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="next" value={(!p.visible).toString()} />
                  <button className={p.visible ? 'text-green-600' : 'text-neutral-400'}>
                    {p.visible ? 'Visível' : 'Oculto'}
                  </button>
                </form>
              </td>
              <td>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="text-red-600 text-xs">Excluir</button>
                </form>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={5} className="py-4 text-neutral-500">Nenhuma peça cadastrada.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
