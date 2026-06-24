import type { DiscountType } from './types'

interface Priceable {
  priceCents: number
  discountType: DiscountType
  discountValue: number
}

export function hasDiscount(p: Priceable): boolean {
  return p.discountType !== 'none' && p.discountValue > 0
}

export function finalPriceCents(p: Priceable): number {
  if (!hasDiscount(p)) return p.priceCents
  let result = p.priceCents
  if (p.discountType === 'percent') {
    result = Math.round(p.priceCents * (1 - p.discountValue / 100))
  } else if (p.discountType === 'amount') {
    result = p.priceCents - p.discountValue
  }
  return Math.max(0, result)
}
