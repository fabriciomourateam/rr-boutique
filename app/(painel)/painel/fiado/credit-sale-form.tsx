'use client'
import { useState, useEffect, useMemo } from 'react'
import type { Product } from '@/lib/types'
import { finalPriceCents, } from '@/lib/pricing'
import { formatBRL } from '@/lib/money'
import { createCreditSale } from './actions'

export function CreditSaleForm({ products }: { products: Product[] }) {
  const [productId, setProductId] = useState('')
  const [variantId, setVariantId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId])
  const variant = product?.variants.find((v) => v.id === variantId) ?? null

  // ao trocar a peça, limpa a variação
  useEffect(() => {
    setVariantId('')
  }, [productId])

  // valor sugerido = preço final x quantidade (editável)
  useEffect(() => {
    if (!product) return
    const qty = Math.max(1, Number(quantity) || 1)
    setAmount(((finalPriceCents(product) * qty) / 100).toFixed(2).replace('.', ','))
  }, [productId, quantity, product])

  // descrição = nome da peça (+ tamanho/cor)
  useEffect(() => {
    if (!product) {
      setDescription('')
      return
    }
    const extra = variant ? ` (${[variant.size, variant.color].filter(Boolean).join(' / ')})` : ''
    setDescription(`${product.name}${extra}`)
  }, [product, variant])

  return (
    <form action={createCreditSale} className="max-w-xl space-y-4">
      <label className="block">
        <span className="text-sm text-neutral-600">Peça vendida</span>
        <select name="productId" value={productId} onChange={(e) => setProductId(e.target.value)}
          className="mt-1 w-full p-2 border rounded" required>
          <option value="">— escolha a peça —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {formatBRL(finalPriceCents(p))}</option>
          ))}
        </select>
      </label>

      {product?.hasGrid && product.variants.length > 0 && (
        <label className="block">
          <span className="text-sm text-neutral-600">Tamanho / cor</span>
          <select name="variantId" value={variantId} onChange={(e) => setVariantId(e.target.value)}
            className="mt-1 w-full p-2 border rounded">
            <option value="">— selecione —</option>
            {product.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {[v.size, v.color].filter(Boolean).join(' / ') || 'variação'} (estoque: {v.stock})
              </option>
            ))}
          </select>
        </label>
      )}

      <input type="hidden" name="description" value={description} />

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-neutral-600">Quantidade</span>
          <input name="quantity" type="number" min="1" value={quantity}
            onChange={(e) => setQuantity(e.target.value)} className="mt-1 w-full p-2 border rounded" />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-600">Valor total (R$)</span>
          <input name="amount" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full p-2 border rounded" required />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-neutral-600">Nome do cliente</span>
          <input name="customerName" className="mt-1 w-full p-2 border rounded" required />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-600">WhatsApp do cliente</span>
          <input name="customerWhatsapp" placeholder="11999998888" className="mt-1 w-full p-2 border rounded" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-neutral-600">Vence em (data combinada de pagamento)</span>
        <input name="dueDate" type="date" className="mt-1 w-full p-2 border rounded" />
      </label>

      <button className="px-6 py-2 rounded bg-[#E89BB0] text-black font-medium">Registrar fiado</button>
    </form>
  )
}
