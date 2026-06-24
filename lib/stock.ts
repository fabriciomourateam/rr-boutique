import type { Product } from './types'

const LOW_STOCK_THRESHOLD = 3

export function totalStock(p: Product): number {
  if (p.hasGrid) return p.variants.reduce((sum, v) => sum + v.stock, 0)
  return p.stock
}

export function isSoldOut(p: Product): boolean {
  return totalStock(p) <= 0
}

export function isLowStock(p: Product): boolean {
  const total = totalStock(p)
  return total > 0 && total <= LOW_STOCK_THRESHOLD
}
