import { getCashEntries, getAllPayments } from '@/lib/data'
import { formatBRL } from '@/lib/money'
import { weekRange, monthRange, inRange, type DateRange } from '@/lib/reports'
import { formatDateBR } from '@/lib/fiado'
import { addCashEntry, deleteCashEntry } from './actions'
import type { CashEntry } from '@/lib/types'

type Payment = { amountCents: number; paidDate: string }

function computeReport(entries: CashEntry[], payments: Payment[], range: DateRange) {
  const entradasManuais = entries
    .filter((e) => e.kind === 'entrada' && inRange(e.entryDate, range))
    .reduce((s, e) => s + e.amountCents, 0)
  const pagamentosFiado = payments
    .filter((p) => inRange(p.paidDate, range))
    .reduce((s, p) => s + p.amountCents, 0)
  const saidas = entries
    .filter((e) => e.kind === 'saida' && inRange(e.entryDate, range))
    .reduce((s, e) => s + e.amountCents, 0)
  const entrada = entradasManuais + pagamentosFiado
  return { entrada, saida: saidas, saldo: entrada - saidas, pagamentosFiado }
}

function categoryBreakdown(entries: CashEntry[], range: DateRange) {
  const map = new Map<string, number>()
  entries
    .filter((e) => e.kind === 'saida' && inRange(e.entryDate, range))
    .forEach((e) => {
      const key = e.category || 'Sem categoria'
      map.set(key, (map.get(key) ?? 0) + e.amountCents)
    })
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
}

export default async function FinanceiroPage() {
  const [entries, payments] = await Promise.all([getCashEntries(), getAllPayments()])
  const today = new Date().toISOString().slice(0, 10)
  const week = weekRange(today)
  const month = monthRange(today)

  const semana = computeReport(entries, payments, week)
  const mes = computeReport(entries, payments, month)
  const gastosCategoriaMes = categoryBreakdown(entries, month)

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-serif mb-2">Financeiro — Caixa</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Entradas e saídas do dia a dia. Os <strong>pagamentos dos fiados entram automaticamente</strong> como
        entrada na data em que foram pagos (inclusive parcelas e cartão que cai depois).
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <ReportCard title="Esta semana" data={semana} />
        <ReportCard title="Este mês" data={mes} />
      </div>

      {gastosCategoriaMes.length > 0 && (
        <div className="border rounded-lg p-5 bg-white mb-8">
          <p className="text-sm text-neutral-500 mb-3">Gastos do mês por categoria</p>
          <ul className="space-y-1.5 text-sm">
            {gastosCategoriaMes.map(([cat, val]) => (
              <li key={cat} className="flex justify-between">
                <span className="text-neutral-700">{cat}</span>
                <span className="text-red-700">{formatBRL(val)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <EntryForm kind="entrada" today={today} />
        <EntryForm kind="saida" today={today} />
      </div>

      <h2 className="font-serif text-xl mb-3">Últimas movimentações</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-500 border-b">
            <th className="py-2">Data</th><th>Descrição</th><th>Fornecedor</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b">
              <td className="py-2">{formatDateBR(e.entryDate)}</td>
              <td className="text-neutral-600">{e.description || '—'}</td>
              <td className="text-neutral-500">{e.supplier || '—'}</td>
              <td className="text-neutral-500">{e.category || '—'}</td>
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
            <tr><td colSpan={7} className="py-4 text-neutral-500">Nenhuma movimentação manual registrada.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function ReportCard({ title, data }: { title: string; data: { entrada: number; saida: number; saldo: number; pagamentosFiado: number } }) {
  return (
    <div className="border rounded-lg p-5 bg-white">
      <p className="text-sm text-neutral-500 mb-3">{title}</p>
      <div className="space-y-1.5">
        <Line label="Entradas" value={formatBRL(data.entrada)} cls="text-green-700" />
        {data.pagamentosFiado > 0 && (
          <p className="text-xs text-neutral-400 pl-1">(inclui {formatBRL(data.pagamentosFiado)} de fiados pagos)</p>
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
        {isEntrada ? '➕ Registrar entrada' : '➖ Registrar saída (despesa)'}
      </p>
      <input name="description" required placeholder={isEntrada ? 'Ex: venda à vista' : 'Ex: compra de roupas'}
        className="w-full p-2 border rounded text-sm" />
      {!isEntrada && (
        <div className="grid grid-cols-2 gap-2">
          <input name="supplier" placeholder="Fornecedor (ex: Barra do William)" className="p-2 border rounded text-sm" />
          <input name="category" placeholder="Categoria (ex: Roupas, Água)" className="p-2 border rounded text-sm" />
        </div>
      )}
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
