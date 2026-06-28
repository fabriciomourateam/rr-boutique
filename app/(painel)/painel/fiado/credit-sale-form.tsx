'use client'
import { useState } from 'react'
import type { Product } from '@/lib/types'
import { finalPriceCents } from '@/lib/pricing'
import { formatBRL, reaisToCents } from '@/lib/money'
import { createCreditSale, updateCreditSale } from './actions'

type Line = { productId: string; variantId: string; qty: string }
export type CreditSaleInitial = {
  id: string
  customerName: string
  customerWhatsapp: string
  purchaseDate: string
  dueDate: string
  freight: string
  amount: string
  lines: Line[]
}

export function CreditSaleForm({ products, initial }: { products: Product[]; initial?: CreditSaleInitial }) {
  const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  const isEdit = !!initial
  const [lines, setLines] = useState<Line[]>(
    initial?.lines?.length ? initial.lines : [{ productId: '', variantId: '', qty: '1' }],
  )
  const [freight, setFreight] = useState(initial?.freight ?? '')

  const productById = (id: string) => sorted.find((p) => p.id === id)

  function update(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  }
  function addLine() { setLines((prev) => [...prev, { productId: '', variantId: '', qty: '1' }]) }
  function removeLine(i: number) { setLines((prev) => prev.filter((_, j) => j !== i)) }

  const itemsTotal = lines.reduce((sum, l) => {
    const p = productById(l.productId)
    if (!p) return sum
    return sum + finalPriceCents(p) * Math.max(1, Number(l.qty) || 1)
  }, 0)
  const total = itemsTotal + reaisToCents(freight || '0')

  return (
    <form action={isEdit ? updateCreditSale : createCreditSale} className="max-w-2xl space-y-4">
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}

      <div className="space-y-3">
        {lines.map((l, i) => {
          const p = productById(l.productId)
          const subtotal = p ? finalPriceCents(p) * Math.max(1, Number(l.qty) || 1) : 0
          return (
            <div key={i} className="border rounded p-3 space-y-2 bg-neutral-50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Peça {i + 1}</span>
                {lines.length > 1 && (
                  <button type="button" onClick={() => removeLine(i)} className="text-red-600 text-xs">Remover</button>
                )}
              </div>

              <select
                name="itemProductId" value={l.productId}
                onChange={(e) => update(i, { productId: e.target.value, variantId: '' })}
                className="w-full p-2 border rounded text-sm" required={i === 0}
              >
                <option value="">— escolha a peça (digite a inicial) —</option>
                {sorted.map((pp) => (
                  <option key={pp.id} value={pp.id}>{pp.name} — {formatBRL(finalPriceCents(pp))}</option>
                ))}
              </select>

              {p?.hasGrid && p.variants.length > 0 ? (
                <select
                  name="itemVariantId" value={l.variantId}
                  onChange={(e) => update(i, { variantId: e.target.value })}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="">— tamanho / cor —</option>
                  {p.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {[v.size, v.color].filter(Boolean).join(' / ') || 'variação'} (estoque: {v.stock})
                    </option>
                  ))}
                </select>
              ) : (
                <input type="hidden" name="itemVariantId" value="" />
              )}

              <div className="flex items-center gap-3">
                <label className="text-sm text-neutral-600">Qtd</label>
                <input
                  name="itemQty" type="number" min="1" value={l.qty}
                  onChange={(e) => update(i, { qty: e.target.value })}
                  className="w-20 p-2 border rounded text-sm"
                />
                <span className="text-sm text-neutral-500 ml-auto">{p ? formatBRL(subtotal) : ''}</span>
              </div>
            </div>
          )
        })}
      </div>

      <button type="button" onClick={addLine} className="text-sm text-[#E89BB0] font-medium">
        + Adicionar peça ao pedido
      </button>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-neutral-600">Frete (R$)</span>
          <input name="freight" value={freight} onChange={(e) => setFreight(e.target.value)}
            placeholder="0,00" className="mt-1 w-full p-2 border rounded" />
        </label>
        <div className="flex items-end justify-end">
          <div className="text-right">
            <p className="text-sm text-neutral-500">Total do pedido</p>
            <p className="font-serif text-xl">{formatBRL(total)}</p>
          </div>
        </div>
      </div>

      <label className="block">
        <span className="text-sm text-neutral-600">
          Valor a cobrar (deixe em branco para usar {formatBRL(total)}; preencha se deu desconto no conjunto)
        </span>
        <input name="amount" defaultValue={initial?.amount ?? ''} placeholder={(total / 100).toFixed(2).replace('.', ',')} className="mt-1 w-full p-2 border rounded" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-neutral-600">Nome do cliente</span>
          <input name="customerName" defaultValue={initial?.customerName ?? ''} className="mt-1 w-full p-2 border rounded" required />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-600">WhatsApp do cliente</span>
          <input name="customerWhatsapp" defaultValue={initial?.customerWhatsapp ?? ''} placeholder="11999998888" className="mt-1 w-full p-2 border rounded" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-neutral-600">Data da compra</span>
          <input name="purchaseDate" type="date" defaultValue={initial?.purchaseDate ?? ''} className="mt-1 w-full p-2 border rounded" />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-600">Vence em (pagamento)</span>
          <input name="dueDate" type="date" defaultValue={initial?.dueDate ?? ''} className="mt-1 w-full p-2 border rounded" />
        </label>
      </div>

      <button className="px-6 py-2 rounded bg-[#E89BB0] text-black font-medium">
        {isEdit ? 'Salvar alterações' : 'Registrar pedido fiado'}
      </button>
    </form>
  )
}
