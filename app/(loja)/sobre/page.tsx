import { getStoreConfig } from '@/lib/data'

export default async function SobrePage() {
  const c = await getStoreConfig()
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <section>
        <h1 className="font-serif text-2xl mb-2">Sobre a {c.name}</h1>
        <p className="whitespace-pre-line text-neutral-700">
          {c.aboutText || 'Moda feminina com estilo, elegância e confiança.'}
        </p>
      </section>
      <section>
        <h2 className="font-serif text-xl mb-2">Política de troca</h2>
        <p className="whitespace-pre-line text-neutral-700">
          {c.exchangeText || 'Fale conosco pelo WhatsApp para trocas.'}
        </p>
      </section>
    </div>
  )
}
