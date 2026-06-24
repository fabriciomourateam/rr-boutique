import { describe, it, expect } from 'vitest'
import { formatBRL, reaisToCents, centsToReais } from './money'

describe('money', () => {
  it('formata centavos como BRL', () => {
    expect(formatBRL(8990)).toBe('R$ 89,90')
    expect(formatBRL(0)).toBe('R$ 0,00')
    expect(formatBRL(100000)).toBe('R$ 1.000,00')
  })
  it('converte reais (string) para centavos', () => {
    expect(reaisToCents('89,90')).toBe(8990)
    expect(reaisToCents('1.000,00')).toBe(100000)
    expect(reaisToCents('5')).toBe(500)
  })
  it('converte centavos para reais numérico', () => {
    expect(centsToReais(8990)).toBe(89.9)
  })
})
