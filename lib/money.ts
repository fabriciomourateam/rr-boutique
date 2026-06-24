export function formatBRL(cents: number): string {
  const negative = cents < 0
  const abs = Math.abs(Math.round(cents))
  const value = (abs / 100).toFixed(2) // "86.63"
  const [intPart, decPart] = value.split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') // "1.000"
  return `${negative ? '-' : ''}R$ ${grouped},${decPart}`
}

export function reaisToCents(input: string): number {
  const normalized = input.trim().replace(/\./g, '').replace(',', '.')
  const value = Number(normalized)
  if (Number.isNaN(value)) return 0
  return Math.round(value * 100)
}

export function centsToReais(cents: number): number {
  return cents / 100
}

export function installmentText(cents: number, parts = 3): string {
  if (cents <= 0) return ''
  const each = Math.round(cents / parts)
  return `${parts}x de ${formatBRL(each)} sem juros`
}
