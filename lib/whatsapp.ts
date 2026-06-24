import { formatBRL } from './money'

interface WaItem {
  name: string
  size?: string | null
  color?: string | null
  priceCents: number
}

export function whatsappLink(phone: string, item: WaItem): string {
  const parts = [`Olá! Tenho interesse na peça: ${item.name}`]
  if (item.size) parts.push(`Tamanho: ${item.size}`)
  if (item.color) parts.push(`Cor: ${item.color}`)
  parts.push(`Valor: ${formatBRL(item.priceCents)}`)
  const text = encodeURIComponent(parts.join('\n'))
  return `https://wa.me/${phone}?text=${text}`
}
