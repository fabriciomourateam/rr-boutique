import Link from 'next/link'
import { getCreditSales } from '@/lib/data'
import { formatBRL } from '@/lib/money'
import { creditStatus, formatDateBR, cobrancaLink, type CreditStatus } from '@/lib/fiado'
import { markPaid, markUnpaid, deleteCreditSale } from './actions'

export default async function FiadoPage() {
  const sales = await getCreditSales()
  const today = new Date().toISOString().slice(0, 10)
  const pendentes = sales.filter((s) => !s.paid)
  const totalReceber = pendentes.reduce((sum, s) => sum + s.amountCents, 0)
  const vencidos = pendentes.filter((s) => creditStatus(s, today) === 'vencido').length

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-serif">Fiado / A Receber</h1>
        <Link href="/painel/fiado/nova" className="px-4 py-2 rounded bg-[#E89BB0] text-black font-medium">
          + Registrar fiado
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="border rounded p-4 bg-white">
          <p className="text-sm text-neutral-500">Total a receber</p>
          <p className="text-3xl font-serif">{formatBRL(totalReceber)}</p>
          <p className="text-xs text-neutral-400">{pendentes.length} pendente(s)</p>
        </div>
        {vencidos > 0 && (
          <div className="border border-red-200 rounded p-4 bg-red-50">
            <p className="text-sm text-red-600">Vencidos</p>
            <p className="text-3xl font-serif text-red-700">{vencidos}</p>
            <p className="text-xs text-red-400">cobre esses clientes 😉</p>
          </div>
        )}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-500 border-b">
            <th className="py-2">Cliente</th><th>Itens</th><th>Valor</th><th>Vence</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => {
            const st = creditStatus(s, today)
            return (
              <tr key={s.id} className="border-b">
                <td className="py-2">{s.customerName}</td>
                <td className="text-neutral-600">{s.description}</td>
                <td>{formatBRL(s.amountCents)}</td>
                <td>{formatDateBR(s.dueDate) || '—'}</td>
                <td><StatusBadge status={st} /></td>
                <td className="text-xs py-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {!s.paid && s.customerWhatsapp && (
                      <a
                        href={cobrancaLink(s.customerWhatsapp, { name: s.customerName, amountCents: s.amountCents, dueDate: s.dueDate })}
                        target="_blank" rel="noopener noreferrer" className="text-[#E89BB0]"
                      >
                        Cobrar
                      </a>
                    )}
                    {!s.paid ? (
                      <form action={markPaid} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={s.id} />
                        <input type="date" name="paidAt" defaultValue={today}
                          className="border rounded px-1.5 py-0.5 text-xs" title="Data do pagamento" />
                        <button className="text-green-600 font-medium">Pago</button>
                      </form>
                    ) : (
                      <>
                        <span className="text-green-700">Pago em {formatDateBR(s.paidAt)}</span>
                        <form action={markUnpaid} className="inline">
                          <input type="hidden" name="id" value={s.id} />
                          <button className="text-neutral-500">Desfazer</button>
                        </form>
                      </>
                    )}
                    <form action={deleteCreditSale} className="inline">
                      <input type="hidden" name="id" value={s.id} />
                      <button className="text-red-600">Excluir</button>
                    </form>
                  </div>
                </td>
              </tr>
            )
          })}
          {sales.length === 0 && (
            <tr><td colSpan={6} className="py-4 text-neutral-500">Nenhum fiado registrado ainda.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }: { status: CreditStatus }) {
  const cls: Record<CreditStatus, string> = {
    'pago': 'bg-green-100 text-green-700',
    'vencido': 'bg-red-100 text-red-700',
    'a-vencer': 'bg-amber-100 text-amber-700',
    'sem-data': 'bg-neutral-100 text-neutral-600',
  }
  const label: Record<CreditStatus, string> = {
    'pago': 'Pago', 'vencido': 'Vencido', 'a-vencer': 'A vencer', 'sem-data': 'Sem data',
  }
  return <span className={`px-2 py-1 rounded ${cls[status]}`}>{label[status]}</span>
}
