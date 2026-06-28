import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCreditSaleById, getAllProductsAdmin } from '@/lib/data'
import { CreditSaleForm, type CreditSaleInitial } from '../credit-sale-form'
import { addPayment, deletePayment } from '../actions'
import { formatBRL } from '@/lib/money'
import { formatDateBR } from '@/lib/fiado'

export default async function EditarPedido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [data, products] = await Promise.all([getCreditSaleById(id), getAllProductsAdmin()])
  if (!data) notFound()
  const { order, items, payments } = data
  const saldo = Math.max(0, order.amountCents - order.paidTotal)
  const today = new Date().toISOString().slice(0, 10)

  const initial: CreditSaleInitial = {
    id: order.id,
    customerName: order.customerName,
    customerWhatsapp: order.customerWhatsapp,
    purchaseDate: order.purchaseDate ?? '',
    dueDate: order.dueDate ?? '',
    freight: order.freightCents ? (order.freightCents / 100).toFixed(2).replace('.', ',') : '',
    amount: order.amountCents ? (order.amountCents / 100).toFixed(2).replace('.', ',') : '',
    lines: items.length
      ? items.map((it) => ({ productId: it.productId ?? '', variantId: it.variantId ?? '', qty: String(it.quantity) }))
      : [{ productId: '', variantId: '', qty: '1' }],
  }

  return (
    <div className="max-w-2xl">
      <Link href="/painel/fiado" className="text-sm text-neutral-500">← voltar</Link>
      <h1 className="text-2xl font-serif my-3">Pedido — {order.customerName}</h1>

      <div className="border rounded-lg p-4 bg-white mb-6">
        <div className="flex justify-between mb-2">
          <p className="font-medium">Pagamentos</p>
          <p className="text-sm">Saldo: <strong className={saldo > 0 ? 'text-red-700' : 'text-green-700'}>{formatBRL(saldo)}</strong></p>
        </div>
        <ul className="text-sm divide-y mb-3">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-1.5">
              <span>{formatDateBR(p.paidDate)} — {formatBRL(p.amountCents)}{p.method ? ` (${p.method})` : ''}</span>
              <form action={deletePayment}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="orderId" value={order.id} />
                <button className="text-red-600 text-xs">remover</button>
              </form>
            </li>
          ))}
          {payments.length === 0 && <li className="py-1.5 text-neutral-400">Nenhum pagamento ainda.</li>}
        </ul>
        {saldo > 0 && (
          <form action={addPayment} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="orderId" value={order.id} />
            <label className="text-xs">Valor<br /><input name="amount" defaultValue={(saldo / 100).toFixed(2).replace('.', ',')} className="border rounded px-2 py-1 w-24" /></label>
            <label className="text-xs">Data<br /><input name="paidDate" type="date" defaultValue={today} className="border rounded px-2 py-1" /></label>
            <label className="text-xs">Forma<br /><input name="method" placeholder="dinheiro, cartão 15d" className="border rounded px-2 py-1 w-40" /></label>
            <button className="px-3 py-1 rounded bg-green-600 text-white text-sm">Registrar pagamento</button>
          </form>
        )}
      </div>

      <p className="font-medium mb-2">Itens e dados do pedido</p>
      <CreditSaleForm products={products} initial={initial} />
    </div>
  )
}
