import { describe, it, expect } from 'vitest'
import { finalPriceCents, hasDiscount } from './pricing'

const base = { priceCents: 10000, discountType: 'none' as const, discountValue: 0 }

describe('pricing', () => {
  it('sem desconto retorna o preço cheio', () => {
    expect(finalPriceCents(base)).toBe(10000)
    expect(hasDiscount(base)).toBe(false)
  })
  it('desconto percentual', () => {
    const p = { ...base, discountType: 'percent' as const, discountValue: 10 }
    expect(finalPriceCents(p)).toBe(9000)
    expect(hasDiscount(p)).toBe(true)
  })
  it('desconto em valor (centavos)', () => {
    const p = { ...base, discountType: 'amount' as const, discountValue: 1500 }
    expect(finalPriceCents(p)).toBe(8500)
  })
  it('nunca fica negativo', () => {
    const p = { ...base, discountType: 'amount' as const, discountValue: 999999 }
    expect(finalPriceCents(p)).toBe(0)
  })
})
