import Link from 'next/link'
import { getCreditSales } from '@/lib/data'
import { formatBRL } from '@/lib/money'
import { orderStatus, formatDateBR, cobrancaLink, type OrderStatus } from '@/lib/fiado'
import { addPayment, deleteCreditSale } from './actions'

export default async function FiadoPage() {
  const sales = await getCreditSales()
  const today = new Date().toISOString().slice(0, 10)
  const totalReceber = sales.reduce((sum, s) => sum + Math.max(0, s.amountCents - s.paidTotal), 0)
  const vencidos = sales.filter((s) => orderStatus(s, today) === 'vencido').length

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-serif">Fiado / A Receber</h1>
        <Link href="/painel/fiado/nova" className="px-4 py-2 rounded bg-[#E89BB0] text-black font-medium">
          + Registrar pedido
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="border rounded p-4 bg-white">
          <p className="text-sm text-neutral-500">Total a receber</p>
          <p className="text-3xl font-serif">{formatBRL(totalReceber)}</p>
          <p className="text-xs text-neutral-400">{sales.filter((s) => s.amountCents > s.paidTotal).length} em aberto</p>
        </div>
        {vencidos > 0 && (
          <div className="border border-red-200 rounded p-4 bg-red-50">
            <p className="text-sm text-red-600">Vencidos</p>
            <p className="text-3xl font-serif text-red-700">{vencidos}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {sales.map((s) => {
          const st = orderStatus(s, today)
          const saldo = Math.max(0, s.amountCents - s.paidTotal)
          return (
            <div key={s.id} className="border rounded-lg p-4 bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.customerName}</span>
                    <StatusBadge status={st} />
                  </div>
                  <p className="text-sm text-neutral-600 mt-0.5">{s.description}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {s.purchaseDate && <>Compra: {formatDateBR(s.purchaseDate)} · </>}
                    {s.dueDate && <>Vence: {formatDateBR(s.dueDate)} · </>}
                    {s.freightCents > 0 && <>Frete: {formatBRL(s.freightCents)}</>}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p>Total: <strong>{formatBRL(s.amountCents)}</strong></p>
                  <p className="text-green-700">Pago: {formatBRL(s.paidTotal)}</p>
                  <p className={saldo > 0 ? 'text-red-700 font-medium' : 'text-neutral-400'}>Saldo: {formatBRL(saldo)}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t text-xs">
                {saldo > 0 && (
                  <form action={addPayment} className="flex items-center gap-1.5">
                    <input type="hidden" name="orderId" value={s.id} />
                    <span className="text-neutral-500">Pagamento:</span>
                    <input name="amount" defaultValue={(saldo / 100).toFixed(2).replace('.', ',')}
                      className="w-20 border rounded px-1.5 py-0.5" title="Valor pago" />
                    <input name="paidDate" type="date" defaultValue={today} className="border rounded px-1.5 py-0.5" title="Data do pagamento" />
                    <input name="method" placeholder="forma (ex: cartão 15d)" className="w-32 border rounded px-1.5 py-0.5" title="Forma de pagamento" />
                    <button className="text-green-700 font-medium px-2 py-0.5 rounded bg-green-50">Registrar</button>
                  </form>
                )}
                {saldo > 0 && s.customerWhatsapp && (
                  <a href={cobrancaLink(s.customerWhatsapp, { name: s.customerName, amountCents: saldo, dueDate: s.dueDate })}
                    target="_blank" rel="noopener noreferrer" className="text-[#E89BB0]">Cobrar</a>
                )}
                <Link href={`/painel/fiado/${s.id}`} className="text-blue-600">Editar / detalhes</Link>
                <form action={deleteCreditSale} className="inline">
                  <input type="hidden" name="id" value={s.id} />
                  <button className="text-red-600">Excluir</button>
                </form>
              </div>
            </div>
          )
        })}
        {sales.length === 0 && <p className="py-4 text-neutral-500">Nenhum pedido registrado ainda.</p>}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cls: Record<OrderStatus, string> = {
    'quitado': 'bg-green-100 text-green-700',
    'parcial': 'bg-blue-100 text-blue-700',
    'vencido': 'bg-red-100 text-red-700',
    'a-vencer': 'bg-amber-100 text-amber-700',
    'sem-data': 'bg-neutral-100 text-neutral-600',
  }
  const label: Record<OrderStatus, string> = {
    'quitado': 'Quitado', 'parcial': 'Parcial', 'vencido': 'Vencido', 'a-vencer': 'A vencer', 'sem-data': 'Sem data',
  }
  return <span className={`px-2 py-0.5 rounded text-xs ${cls[status]}`}>{label[status]}</span>
}
