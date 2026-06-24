import { getStoreConfig } from '@/lib/data'
import { saveConfig } from './actions'

export default async function ConfigPage() {
  const c = await getStoreConfig()
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-serif mb-4">Configurações da loja</h1>
      <form action={saveConfig} className="space-y-4">
        <Field name="name" label="Nome da loja" defaultValue={c.name} />
        <Field name="whatsapp" label="WhatsApp (com DDD, ex 11999998888)" defaultValue={c.whatsapp} />
        <Field name="pixKey" label="Chave Pix" defaultValue={c.pixKey} />
        <Field name="instagram" label="Instagram (@)" defaultValue={c.instagram} />
        <Area name="aboutText" label="Sobre a loja" defaultValue={c.aboutText} />
        <Area name="exchangeText" label="Política de troca" defaultValue={c.exchangeText} />
        <button className="px-4 py-2 rounded bg-[#E89BB0] text-black font-medium">Salvar</button>
      </form>
    </div>
  )
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-600">{label}</span>
      <input name={name} defaultValue={defaultValue} className="mt-1 w-full p-2 border rounded" />
    </label>
  )
}

function Area({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-600">{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={3} className="mt-1 w-full p-2 border rounded" />
    </label>
  )
}
