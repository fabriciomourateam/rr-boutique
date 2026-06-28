import { formatBRL } from './money'

export type CreditStatus = 'pago' | 'vencido' | 'a-vencer' | 'sem-data'

export function creditStatus(
  sale: { paid: boolean; dueDate: string | null },
  today: string,
): CreditStatus {
  if (sale.paid) return 'pago'
  if (!sale.dueDate) return 'sem-data'
  return sale.dueDate < today ? 'vencido' : 'a-vencer'
}

export type OrderStatus = 'quitado' | 'parcial' | 'vencido' | 'a-vencer' | 'sem-data'

export function orderStatus(
  o: { amountCents: number; paidTotal: number; dueDate: string | null },
  today: string,
): OrderStatus {
  if (o.amountCents > 0 && o.paidTotal >= o.amountCents) return 'quitado'
  if (o.dueDate && o.dueDate < today) return 'vencido'
  if (o.paidTotal > 0) return 'parcial'
  if (!o.dueDate) return 'sem-data'
  return 'a-vencer'
}

export function formatDateBR(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  if (!y || !m || !d) return ''
  return `${d}/${m}/${y}`
}

export function cobrancaLink(
  phone: string,
  info: { name: string; amountCents: number; dueDate?: string | null },
): string {
  const digits = phone.replace(/\D/g, '')
  const full = digits.startsWith('55') ? digits : `55${digits}`
  const parts = [
    `Oi ${info.name}! 😊 Passando pra lembrar do valor de ${formatBRL(info.amountCents)} da sua compra`,
  ]
  if (info.dueDate) parts.push(`combinado pra ${formatDateBR(info.dueDate)}.`)
  parts.push('Qualquer coisa me chama!')
  const text = encodeURIComponent(parts.join(' '))
  return `https://wa.me/${full}?text=${text}`
}
