import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <aside className="w-56 bg-[#0A0A0A] text-white p-4 space-y-1 shrink-0">
        <p className="font-serif text-[#E89BB0] text-lg mb-4">RR Boutiques</p>
        <Link className="block py-2 hover:text-[#E89BB0]" href="/painel">Início</Link>
        <Link className="block py-2 hover:text-[#E89BB0]" href="/painel/produtos">Produtos</Link>
        <Link className="block py-2 hover:text-[#E89BB0]" href="/painel/fiado">Fiado / A Receber</Link>
        <Link className="block py-2 hover:text-[#E89BB0]" href="/painel/categorias">Categorias</Link>
        <Link className="block py-2 hover:text-[#E89BB0]" href="/painel/config">Configurações</Link>
        <form action="/auth/sign-out" method="post" className="pt-6">
          <button className="text-sm text-neutral-400 hover:text-white">Sair</button>
        </form>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
