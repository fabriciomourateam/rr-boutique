'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { reaisToCents } from '@/lib/money'

export async function addCashEntry(formData: FormData) {
  const kind = String(formData.get('kind'))
  if (kind !== 'entrada' && kind !== 'saida') return
  const today = new Date().toISOString().slice(0, 10)
  const supabase = await createClient()
  await supabase.from('cash_entries').insert({
    kind,
    description: String(formData.get('description') ?? '').trim(),
    amount_cents: reaisToCents(String(formData.get('amount') ?? '0')),
    entry_date: String(formData.get('entryDate') || '') || today,
  })
  revalidatePath('/painel/financeiro')
  revalidatePath('/painel')
}

export async function deleteCashEntry(formData: FormData) {
  const id = String(formData.get('id'))
  const supabase = await createClient()
  await supabase.from('cash_entries').delete().eq('id', id)
  revalidatePath('/painel/financeiro')
  revalidatePath('/painel')
}
