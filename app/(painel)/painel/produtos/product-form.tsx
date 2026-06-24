'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Product } from '@/lib/types'
import { saveProduct } from './save'

type DraftVariant = { size: string | null; color: string | null; stock: number }

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const [hasGrid, setHasGrid] = useState(product?.hasGrid ?? false)
  const [photoUrls, setPhotoUrls] = useState<string[]>(product?.photos.map((p) => p.url) ?? [])
  const [variants, setVariants] = useState<DraftVariant[]>(
    product?.variants.map((v) => ({ size: v.size, color: v.color, stock: v.stock })) ?? [],
  )
  const [uploading, setUploading] = useState(false)

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    const supabase = createClient()
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error } = await supabase.storage.from('produtos').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('produtos').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setPhotoUrls((prev) => [...prev, ...urls])
    setUploading(false)
  }

  return (
    <form action={saveProduct} className="max-w-2xl space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="photoUrls" value={photoUrls.join(',')} />

      <Field name="name" label="Nome da peça" defaultValue={product?.name} required />

      <label className="block">
        <span className="text-sm text-neutral-600">Descrição</span>
        <textarea name="description" defaultValue={product?.description} rows={3}
          className="mt-1 w-full p-2 border rounded" />
      </label>

      <label className="block">
        <span className="text-sm text-neutral-600">Categoria</span>
        <select name="categoryId" defaultValue={product?.categoryId ?? ''} className="mt-1 w-full p-2 border rounded">
          <option value="">— sem categoria —</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Field name="cost" label="Preço de custo (privado) ex 45,00"
          defaultValue={product ? (product.costCents / 100).toString() : ''} />
        <Field name="price" label="Preço de venda ex 89,90"
          defaultValue={product ? (product.priceCents / 100).toString() : ''} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-neutral-600">Tipo de desconto</span>
          <select name="discountType" defaultValue={product?.discountType ?? 'none'} className="mt-1 w-full p-2 border rounded">
            <option value="none">Sem desconto</option>
            <option value="percent">Porcentagem (%)</option>
            <option value="amount">Valor (R$)</option>
          </select>
        </label>
        <Field name="discountValue" label="Valor do desconto (% ou centavos)"
          defaultValue={product?.discountValue?.toString() ?? '0'} />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="hasGrid" checked={hasGrid} onChange={(e) => setHasGrid(e.target.checked)} />
        <span>Esta peça tem grade (tamanho/cor)</span>
      </label>

      {!hasGrid && (
        <Field name="stock" label="Estoque (unidades)" defaultValue={product?.stock?.toString() ?? '0'} />
      )}

      {hasGrid && (
        <div className="border rounded p-3 space-y-2">
          <p className="text-sm font-medium">Grade</p>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input name="variantSize" defaultValue={v.size ?? ''} placeholder="Tamanho (P/M/G)" className="p-2 border rounded" />
              <input name="variantColor" defaultValue={v.color ?? ''} placeholder="Cor" className="p-2 border rounded" />
              <input name="variantStock" type="number" defaultValue={v.stock} placeholder="Qtd" className="p-2 border rounded" />
            </div>
          ))}
          <button type="button"
            onClick={() => setVariants([...variants, { size: '', color: '', stock: 0 }])}
            className="text-sm text-[#E89BB0]">+ Adicionar variação</button>
        </div>
      )}

      <div>
        <span className="text-sm text-neutral-600 block mb-1">Fotos</span>
        <input type="file" accept="image/*" multiple onChange={onUpload} />
        {uploading && <p className="text-sm text-neutral-500">Enviando…</p>}
        <div className="flex gap-2 mt-2 flex-wrap">
          {photoUrls.map((u, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="w-20 h-20 object-cover rounded" />
              <button type="button" onClick={() => setPhotoUrls(photoUrls.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="visible" defaultChecked={product?.visible} /> Visível na loja
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Destaque na home
        </label>
      </div>

      <button className="px-6 py-2 rounded bg-[#E89BB0] text-black font-medium">Salvar peça</button>
    </form>
  )
}

function Field({ name, label, defaultValue, required }: { name: string; label: string; defaultValue?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-600">{label}</span>
      <input name={name} defaultValue={defaultValue} required={required} className="mt-1 w-full p-2 border rounded" />
    </label>
  )
}
