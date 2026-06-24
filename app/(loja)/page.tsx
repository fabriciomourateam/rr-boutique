import { getFeaturedProducts, getVisibleProducts, getCategories, getStoreConfig } from '@/lib/data'
import { Hero } from '@/components/store/hero'
import { BenefitsBar } from '@/components/store/benefits-bar'
import { CategoryCard } from '@/components/store/category-card'
import { ProductCard } from '@/components/product-card'
import { AboutBanner } from '@/components/store/about-banner'
import { InstagramStrip } from '@/components/store/instagram-strip'

export default async function Home() {
  const [featured, all, categories, config] = await Promise.all([
    getFeaturedProducts(),
    getVisibleProducts(),
    getCategories(),
    getStoreConfig(),
  ])
  const tops = categories.filter((c) => !c.parentId)
  const coverFor = (catId: string) =>
    all.find((p) => p.categoryId === catId && p.photos[0])?.photos[0]?.url
  const destaques = (featured.length ? featured : all).slice(0, 6)
  const instaImages = all.flatMap((p) => p.photos.map((ph) => ph.url)).slice(0, 6)

  return (
    <>
      <Hero config={config} />
      <BenefitsBar />

      {tops.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 py-16">
          <SectionHeader title="Nova coleção" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
            {tops.slice(0, 8).map((c) => (
              <CategoryCard key={c.id} name={c.name} slug={c.slug} image={coverFor(c.id)} />
            ))}
          </div>
        </section>
      )}

      <section id="destaques" className="bg-[#F7F3EF]">
        <div className="max-w-[1280px] mx-auto px-4 py-16">
          <SectionHeader title="Mais desejados" />
          {destaques.length === 0 ? (
            <p className="text-center text-neutral-500 mt-8">Em breve, novidades! 💕</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-8">
              {destaques.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <AboutBanner config={config} />
      <InstagramStrip images={instaImages} config={config} />
    </>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="text-center">
      <h2 className="font-serif text-4xl text-[#17181B]">{title}</h2>
      <div className="mx-auto mt-2 h-px w-16 bg-[#E8A1B4]" />
    </div>
  )
}
