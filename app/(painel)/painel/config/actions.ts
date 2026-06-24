'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveConfig(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('store_config').update({
    name: String(formData.get('name') ?? ''),
    whatsapp: String(formData.get('whatsapp') ?? '').replace(/\D/g, ''),
    pix_key: String(formData.get('pixKey') ?? ''),
    instagram: String(formData.get('instagram') ?? ''),
    about_text: String(formData.get('aboutText') ?? ''),
    exchange_text: String(formData.get('exchangeText') ?? ''),
  }).eq('id', 1)
  revalidatePath('/painel/config')
  revalidatePath('/', 'layout')
}
