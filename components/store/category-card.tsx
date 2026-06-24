import Link from 'next/link'

export function CategoryCard({ name, slug, image }: { name: string; slug: string; image?: string }) {
  return (
    <Link
      href={`/categoria/${slug}`}
      className="group relative block aspect-[3/4] rounded-2xl overflow-hidden bg-[#17181B]"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#2A2B2F] to-[#0B0B0D]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5">
        <h3 className="font-serif text-2xl text-white">{name}</h3>
        <span className="text-xs text-[#F3C7D2]">Ver peças →</span>
      </div>
    </Link>
  )
}
