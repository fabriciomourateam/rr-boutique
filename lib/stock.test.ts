import { describe, it, expect } from 'vitest'
import { totalStock, isSoldOut, isLowStock } from './stock'
import type { Product } from './types'

function make(p: Partial<Product>): Product {
  return {
    id: '1', slug: 's', name: 'n', description: '', categoryId: null,
    costCents: 0, priceCents: 1000, discountType: 'none', discountValue: 0,
    visible: true, featured: false, hasGrid: false, stock: 0, variants: [], photos: [],
    ...p,
  }
}

describe('stock', () => {
  it('produto simples usa o campo stock', () => {
    expect(totalStock(make({ hasGrid: false, stock: 4 }))).toBe(4)
  })
  it('produto com grade soma as variações', () => {
    const p = make({ hasGrid: true, variants: [
      { id: 'a', size: 'P', color: null, stock: 2 },
      { id: 'b', size: 'M', color: null, stock: 3 },
    ]})
    expect(totalStock(p)).toBe(5)
  })
  it('esgotado quando total = 0', () => {
    expect(isSoldOut(make({ stock: 0 }))).toBe(true)
    expect(isSoldOut(make({ stock: 1 }))).toBe(false)
  })
  it('estoque baixo quando 1..3', () => {
    expect(isLowStock(make({ stock: 2 }))).toBe(true)
    expect(isLowStock(make({ stock: 0 }))).toBe(false)
    expect(isLowStock(make({ stock: 10 }))).toBe(false)
  })
})
