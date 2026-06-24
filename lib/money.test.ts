import { describe, it, expect } from 'vitest'
import { formatBRL, reaisToCents, centsToReais, installmentText } from './money'

describe('money', () => {
  it('formata centavos como BRL', () => {
    expect(formatBRL(8990)).toBe('R$ 89,90')
    expect(formatBRL(0)).toBe('R$ 0,00')
    expect(formatBRL(100000)).toBe('R$ 1.000,00')
  })
  it('converte reais (string) para centavos', () => {
    expect(reaisToCents('89,90')).toBe(8990)
    expect(reaisToCents('1.000,00')).toBe(100000)
    expect(reaisToCents('5')).toBe(500)
  })
  it('converte centavos para reais numérico', () => {
    expect(centsToReais(8990)).toBe(89.9)
  })
  it('monta texto de parcelamento em 3x', () => {
    expect(installmentText(25990)).toBe('3x de R$ 86,63 sem juros')
    expect(installmentText(0)).toBe('')
  })
})
