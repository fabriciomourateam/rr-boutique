import Link from 'next/link'
import { getAllProductsAdmin, getCreditSales } from '@/lib/data'
import { isLowStock, isSoldOut } from '@/lib/stock'
import { formatBRL } from '@/lib/money'

export default async function PainelHome() {
  const [products, sales] = await Promise.all([getAllProductsAdmin(), getCreditSales()])
  const ativos = products.filter((p) => p.visible).length
  const baixo = products.filter((p) => isLowStock(p) || isSoldOut(p)).length
  const totalReceber = sales.reduce((sum, s) => sum + Math.max(0, s.amountCents - s.paidTotal), 0)

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Olá! 👋</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mb-6">
        <Card label="Peças na loja" value={String(ativos)} />
        <Card label="Estoque baixo/esgotado" value={String(baixo)} />
        <Card label="A receber (fiado)" value={formatBRL(totalReceber)} />
      </div>
      <div className="flex gap-3 flex-wrap">
        <Link href="/painel/produtos/novo" className="px-4 py-2 rounded bg-[#E89BB0] text-black font-medium">Cadastrar peça</Link>
        <Link href="/painel/fiado/nova" className="px-4 py-2 rounded border">Registrar fiado</Link>
        <Link href="/painel/produtos" className="px-4 py-2 rounded border">Ver produtos</Link>
      </div>
    </div>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded p-4 bg-white">
      <p className="text-2xl font-serif">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  )
}
