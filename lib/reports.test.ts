import { describe, it, expect } from 'vitest'
import { weekRange, monthRange, inRange } from './reports'

describe('reports — períodos', () => {
  it('semana de segunda a domingo (quarta-feira)', () => {
    // 2026-06-24 é uma quarta-feira
    expect(weekRange('2026-06-24')).toEqual({ start: '2026-06-22', end: '2026-06-28' })
  })
  it('semana quando hoje é domingo', () => {
    // 2026-06-28 é domingo
    expect(weekRange('2026-06-28')).toEqual({ start: '2026-06-22', end: '2026-06-28' })
  })
  it('semana quando hoje é segunda', () => {
    // 2026-06-22 é segunda
    expect(weekRange('2026-06-22')).toEqual({ start: '2026-06-22', end: '2026-06-28' })
  })
  it('mês inteiro', () => {
    expect(monthRange('2026-06-24')).toEqual({ start: '2026-06-01', end: '2026-06-30' })
  })
  it('inRange é inclusivo nas pontas', () => {
    const r = { start: '2026-06-22', end: '2026-06-28' }
    expect(inRange('2026-06-22', r)).toBe(true)
    expect(inRange('2026-06-28', r)).toBe(true)
    expect(inRange('2026-06-21', r)).toBe(false)
    expect(inRange('2026-06-29', r)).toBe(false)
  })
})
