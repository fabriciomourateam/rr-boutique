import { getCashEntries, getCreditSales } from '@/lib/data'
import { formatBRL } from '@/lib/money'
import { weekRange, monthRange, inRange, type DateRange } from '@/lib/reports'
import { formatDateBR } from '@/lib/fiado'
import { addCashEntry, deleteCashEntry } from './actions'
import type { CashEntry, CreditSale } from '@/lib/types'

function computeReport(entries: CashEntry[], paidSales: CreditSale[], range: DateRange) {
  const entradasManuais = entries
    .filter((e) => e.kind === 'entrada' && inRange(e.entryDate, range))
    .reduce((s, e) => s + e.amountCents, 0)
  const fiadoRecebido = paidSales
    .filter((s) => s.paidAt && inRange(s.paidAt, range))
    .reduce((s, x) => s + x.amountCents, 0)
  const saidas = entries
    .filter((e) => e.kind === 'saida' && inRange(e.entryDate, range))
    .reduce((s, e) => s + e.amountCents, 0)
  const entrada = entradasManuais + fiadoRecebido
  return { entrada, saida: saidas, saldo: entrada - saidas, fiadoRecebido }
}

export default async function FinanceiroPage() {
  const [entries, sales] = await Promise.all([getCashEntries(), getCreditSales()])
  const today = new Date().toISOString().slice(0, 10)
  const paidSales = sales.filter((s) => s.paid)

  const semana = computeReport(entries, paidSales, weekRange(today))
  const mes = computeReport(entries, paidSales, monthRange(today))

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-serif mb-2">Financeiro — Caixa</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Entradas e saídas do seu dia a dia. Os <strong>fiados que você marca como pagos</strong> entram
        automaticamente como entrada na data do pagamento.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <ReportCard title="Esta semana" data={semana} />
        <ReportCard title="Este mês" data={mes} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <EntryForm kind="entrada" today={today} />
        <EntryForm kind="saida" today={today} />
      </div>

      <h2 className="font-serif text-xl mb-3">Últimas movimentações</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-500 border-b">
            <th className="py-2">Data</th><th>Descrição</th><th>Tipo</th><th>Valor</th><th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b">
              <td className="py-2">{formatDateBR(e.entryDate)}</td>
              <td className="text-neutral-600">{e.description || '—'}</td>
              <td>
                <span className={e.kind === 'entrada' ? 'text-green-700' : 'text-red-700'}>
                  {e.kind === 'entrada' ? 'Entrada' : 'Saída'}
                </span>
              </td>
              <td>{formatBRL(e.amountCents)}</td>
              <td>
                <form action={deleteCashEntry} className="inline">
                  <input type="hidden" name="id" value={e.id} />
                  <button className="text-red-600 text-xs">Excluir</button>
                </form>
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr><td colSpan={5} className="py-4 text-neutral-500">Nenhuma movimentação manual registrada.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function ReportCard({ title, data }: { title: string; data: { entrada: number; saida: number; saldo: number; fiadoRecebido: number } }) {
  return (
    <div className="border rounded-lg p-5 bg-white">
      <p className="text-sm text-neutral-500 mb-3">{title}</p>
      <div className="space-y-1.5">
        <Line label="Entradas" value={formatBRL(data.entrada)} cls="text-green-700" />
        {data.fiadoRecebido > 0 && (
          <p className="text-xs text-neutral-400 pl-1">(inclui {formatBRL(data.fiadoRecebido)} de fiados pagos)</p>
        )}
        <Line label="Saídas" value={formatBRL(data.saida)} cls="text-red-700" />
        <div className="border-t pt-2 mt-2">
          <Line label="Saldo" value={formatBRL(data.saldo)} cls={data.saldo >= 0 ? 'text-[#17181B] font-semibold' : 'text-red-700 font-semibold'} big />
        </div>
      </div>
    </div>
  )
}

function Line({ label, value, cls, big }: { label: string; value: string; cls?: string; big?: boolean }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className={`${cls} ${big ? 'text-xl font-serif' : ''}`}>{value}</span>
    </div>
  )
}

function EntryForm({ kind, today }: { kind: 'entrada' | 'saida'; today: string }) {
  const isEntrada = kind === 'entrada'
  return (
    <form action={addCashEntry} className="border rounded-lg p-4 bg-white space-y-3">
      <input type="hidden" name="kind" value={kind} />
      <p className={`font-medium ${isEntrada ? 'text-green-700' : 'text-red-700'}`}>
        {isEntrada ? '➕ Registrar entrada' : '➖ Registrar saída'}
      </p>
      <input name="description" required placeholder={isEntrada ? 'Ex: venda à vista' : 'Ex: compra no Brás, sacolas'}
        className="w-full p-2 border rounded text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input name="amount" required placeholder="Valor (ex 120,00)" className="p-2 border rounded text-sm" />
        <input name="entryDate" type="date" defaultValue={today} className="p-2 border rounded text-sm" />
      </div>
      <button className={`w-full py-2 rounded text-sm font-medium ${isEntrada ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
        {isEntrada ? 'Adicionar entrada' : 'Adicionar saída'}
      </button>
    </form>
  )
}
