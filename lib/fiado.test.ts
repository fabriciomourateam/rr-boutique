import { describe, it, expect } from 'vitest'
import { creditStatus, formatDateBR, cobrancaLink, orderStatus } from './fiado'

describe('creditStatus', () => {
  it('pago tem prioridade', () => {
    expect(creditStatus({ paid: true, dueDate: '2020-01-01' }, '2026-06-24')).toBe('pago')
  })
  it('sem data quando não há vencimento', () => {
    expect(creditStatus({ paid: false, dueDate: null }, '2026-06-24')).toBe('sem-data')
  })
  it('vencido quando vencimento < hoje', () => {
    expect(creditStatus({ paid: false, dueDate: '2026-06-20' }, '2026-06-24')).toBe('vencido')
  })
  it('a-vencer quando vencimento >= hoje', () => {
    expect(creditStatus({ paid: false, dueDate: '2026-06-30' }, '2026-06-24')).toBe('a-vencer')
    expect(creditStatus({ paid: false, dueDate: '2026-06-24' }, '2026-06-24')).toBe('a-vencer')
  })
})

describe('orderStatus', () => {
  const t = '2026-06-24'
  it('quitado quando pago >= total', () => {
    expect(orderStatus({ amountCents: 10000, paidTotal: 10000, dueDate: '2020-01-01' }, t)).toBe('quitado')
  })
  it('vencido quando falta pagar e passou da data', () => {
    expect(orderStatus({ amountCents: 10000, paidTotal: 4000, dueDate: '2026-06-20' }, t)).toBe('vencido')
  })
  it('parcial quando pagou parte e ainda não venceu', () => {
    expect(orderStatus({ amountCents: 10000, paidTotal: 4000, dueDate: '2026-06-30' }, t)).toBe('parcial')
  })
  it('a-vencer quando nada pago e dentro do prazo', () => {
    expect(orderStatus({ amountCents: 10000, paidTotal: 0, dueDate: '2026-06-30' }, t)).toBe('a-vencer')
  })
  it('sem-data quando nada pago e sem vencimento', () => {
    expect(orderStatus({ amountCents: 10000, paidTotal: 0, dueDate: null }, t)).toBe('sem-data')
  })
})

describe('formatDateBR', () => {
  it('formata ISO para BR', () => {
    expect(formatDateBR('2026-06-30')).toBe('30/06/2026')
    expect(formatDateBR(null)).toBe('')
  })
})

describe('cobrancaLink', () => {
  it('monta link de cobrança com DDI', () => {
    const url = cobrancaLink('11999998888', { name: 'Ana', amountCents: 8990, dueDate: '2026-06-30' })
    expect(url).toContain('https://wa.me/5511999998888?text=')
    const text = decodeURIComponent(url.split('text=')[1])
    expect(text).toContain('Ana')
    expect(text).toContain('89,90')
    expect(text).toContain('30/06/2026')
  })
})
