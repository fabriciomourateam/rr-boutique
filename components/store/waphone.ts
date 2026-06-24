// Monta a URL do WhatsApp a partir de um número (com ou sem DDI 55).
export function waUrl(whatsapp: string, text?: string): string | null {
  const digits = (whatsapp || '').replace(/\D/g, '')
  if (!digits) return null
  const full = digits.startsWith('55') ? digits : `55${digits}`
  const q = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${full}${q}`
}
