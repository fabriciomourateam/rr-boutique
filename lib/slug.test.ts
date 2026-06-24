import { describe, it, expect } from 'vitest'
import { toSlug } from './slug'

describe('toSlug', () => {
  it('normaliza acentos e espaços', () => {
    expect(toSlug('Vestido Floral')).toBe('vestido-floral')
    expect(toSlug('Camisa Coração ')).toBe('camisa-coracao')
    expect(toSlug('Calça   Jeans!!')).toBe('calca-jeans')
  })
})
