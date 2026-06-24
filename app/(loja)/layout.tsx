import { getCategories, getStoreConfig } from '@/lib/data'
import { SiteHeader } from '@/components/store/site-header'
import { SiteFooter } from '@/components/store/site-footer'

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const [categories, config] = await Promise.all([getCategories(), getStoreConfig()])
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#17181B]">
      <SiteHeader categories={categories} config={config} />
      <div className="flex-1">{children}</div>
      <SiteFooter categories={categories} config={config} />
    </div>
  )
}
