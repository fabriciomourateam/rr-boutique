import { describe, it, expect } from 'vitest'
import { whatsappLink } from './whatsapp'

describe('whatsappLink', () => {
  it('monta link com mensagem da peça', () => {
    const url = whatsappLink('5511999999999', {
      name: 'Vestido Floral', size: 'M', color: 'Preto', priceCents: 8990,
    })
    expect(url).toContain('https://wa.me/5511999999999?text=')
    const text = decodeURIComponent(url.split('text=')[1])
    expect(text).toContain('Vestido Floral')
    expect(text).toContain('M')
    expect(text).toContain('Preto')
    expect(text).toContain('89,90')
  })
  it('omite tamanho/cor quando ausentes', () => {
    const url = whatsappLink('5511999999999', { name: 'Bolsa', priceCents: 5000 })
    const text = decodeURIComponent(url.split('text=')[1])
    expect(text).toContain('Bolsa')
    expect(text).not.toContain('Tamanho')
  })
})
