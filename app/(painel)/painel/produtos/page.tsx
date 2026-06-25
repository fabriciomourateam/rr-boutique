import Link from 'next/link'
import { getAllProductsAdmin } from '@/lib/data'
import { formatBRL } from '@/lib/money'
import { totalStock } from '@/lib/stock'
import { toggleVisible, deleteProduct, addStock } from './actions'

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
            <th className="py-2">Peça</th><th>Preço</th><th>Estoque</th><th>Repor estoque</th><th>Na loja?</th><th></th>
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
                {p.hasGrid ? (
                  p.variants.length > 0 ? (
                    <form action={addStock} className="flex items-center gap-1">
                      <select name="variantId" className="border rounded px-1 py-0.5 text-xs max-w-[120px]">
                        {p.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {[v.size, v.color].filter(Boolean).join('/') || 'var'} ({v.stock})
                          </option>
                        ))}
                      </select>
                      <input name="qty" type="number" min="1" defaultValue="1" className="w-12 border rounded px-1 py-0.5 text-xs" />
                      <button className="text-green-700 text-xs font-medium">+</button>
                    </form>
                  ) : (
                    <span className="text-xs text-neutral-400">sem grade</span>
                  )
                ) : (
                  <form action={addStock} className="flex items-center gap-1">
                    <input type="hidden" name="productId" value={p.id} />
                    <input name="qty" type="number" min="1" defaultValue="1" className="w-12 border rounded px-1 py-0.5 text-xs" />
                    <button className="text-green-700 text-xs font-medium">+ repor</button>
                  </form>
                )}
              </td>
              <td>
                <form action={toggleVisible}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="next" value={(!p.visible).toString()} />
                  <button className={p.visible ? 'text-green-600' : 'text-neutral-400'}>
                    {p.visible ? 'Visível' : 'Oculto'}
                  </button>
                </form>
              </td>
              <td className="whitespace-nowrap">
                <Link href={`/painel/produtos/${p.id}`} className="text-[#E89BB0] text-xs mr-3">Editar</Link>
                <form action={deleteProduct} className="inline">
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
