import Link from 'next/link'
import { getAllProductsAdmin } from '@/lib/data'
import { isLowStock, isSoldOut } from '@/lib/stock'

export default async function PainelHome() {
  const products = await getAllProductsAdmin()
  const ativos = products.filter((p) => p.visible).length
  const baixo = products.filter((p) => isLowStock(p) || isSoldOut(p)).length
  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Olá! 👋</h1>
      <div className="grid grid-cols-2 gap-4 max-w-md mb-6">
        <Card label="Peças na loja" value={ativos} />
        <Card label="Estoque baixo/esgotado" value={baixo} />
      </div>
      <div className="flex gap-3">
        <Link href="/painel/produtos/novo" className="px-4 py-2 rounded bg-[#E89BB0] text-black font-medium">Cadastrar peça</Link>
        <Link href="/painel/produtos" className="px-4 py-2 rounded border">Ver produtos</Link>
      </div>
    </div>
  )
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded p-4 bg-white">
      <p className="text-3xl font-serif">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  )
}
