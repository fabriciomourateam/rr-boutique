'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('E-mail ou senha incorretos.')
      return
    }
    router.push('/painel')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-3xl font-serif text-[#E89BB0] text-center">RR Boutiques</h1>
        <p className="text-center text-neutral-400 text-sm">Painel da loja</p>
        <input
          className="w-full p-3 rounded bg-neutral-900 border border-neutral-700"
          type="email" placeholder="E-mail" value={email}
          onChange={(e) => setEmail(e.target.value)} required
        />
        <input
          className="w-full p-3 rounded bg-neutral-900 border border-neutral-700"
          type="password" placeholder="Senha" value={password}
          onChange={(e) => setPassword(e.target.value)} required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          className="w-full p-3 rounded bg-[#E89BB0] text-black font-medium disabled:opacity-60"
          type="submit" disabled={loading}
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
