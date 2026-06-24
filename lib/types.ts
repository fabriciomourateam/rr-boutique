export type DiscountType = 'none' | 'percent' | 'amount'

export interface Variant {
  id: string
  size: string | null
  color: string | null
  stock: number
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  categoryId: string | null
  costCents: number        // preço de custo (privado)
  priceCents: number       // preço de venda
  discountType: DiscountType
  discountValue: number    // % (0-100) quando percent; centavos quando amount
  visible: boolean
  featured: boolean
  hasGrid: boolean         // true = usa variants; false = estoque simples
  stock: number            // usado quando hasGrid = false
  variants: Variant[]
  photos: { url: string; order: number }[]
}

export interface Category {
  id: string
  slug: string
  name: string
  parentId: string | null
}

export interface CreditSale {
  id: string
  customerName: string
  customerWhatsapp: string
  productId: string | null
  variantId: string | null
  description: string
  amountCents: number
  quantity: number
  saleDate: string        // ISO YYYY-MM-DD
  dueDate: string | null  // ISO YYYY-MM-DD
  paid: boolean
  paidAt: string | null
}

export interface StoreConfig {
  name: string
  whatsapp: string         // só dígitos, com DDI: ex 5511999999999
  pixKey: string
  instagram: string
  bannerUrl: string
  aboutText: string
  exchangeText: string
}
