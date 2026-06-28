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
  description: string
  amountCents: number     // total a receber (itens + frete, ou valor combinado)
  freightCents: number
  quantity: number
  saleDate: string        // ISO YYYY-MM-DD (registro)
  purchaseDate: string | null // ISO YYYY-MM-DD (data da compra)
  dueDate: string | null  // ISO YYYY-MM-DD (vencimento)
  paid: boolean
  paidAt: string | null
  paidTotal: number       // soma dos pagamentos (centavos) — calculado
}

export interface CreditSalePayment {
  id: string
  creditSaleId: string
  amountCents: number
  paidDate: string        // ISO YYYY-MM-DD
  method: string
}

export interface CreditSaleItem {
  id: string
  productId: string | null
  variantId: string | null
  description: string
  quantity: number
  amountCents: number
}

export interface CashEntry {
  id: string
  kind: 'entrada' | 'saida'
  description: string
  amountCents: number
  entryDate: string // ISO YYYY-MM-DD
  supplier: string
  category: string
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
