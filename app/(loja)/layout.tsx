import Link from 'next/link'
import { getCategories, getStoreConfig } from '@/lib/data'

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const [categories, config] = await Promise.all([getCategories(), getStoreConfig()])
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <header className="bg-[#0A0A0A] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-[#E89BB0]">{config.name}</Link>
          <nav className="hidden md:flex gap-4 text-sm">
            {categories.filter((c) => !c.parentId).map((c) => (
              <Link key={c.id} href={`/categoria/${c.slug}`} className="hover:text-[#E89BB0]">{c.name}</Link>
            ))}
            <Link href="/sobre" className="hover:text-[#E89BB0]">Sobre</Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="bg-[#0A0A0A] text-neutral-300 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm space-y-2">
          <p className="font-serif text-[#E89BB0] text-lg">{config.name}</p>
          <p>Moda Feminina — Estilo • Elegância • Confiança</p>
          {config.pixKey && <p>Pix: {config.pixKey}</p>}
          {config.instagram && <p>Instagram: {config.instagram}</p>}
          <p className="pt-2"><Link href="/sobre" className="underline hover:text-[#E89BB0]">Sobre &amp; Trocas</Link></p>
        </div>
      </footer>
    </div>
  )
}
