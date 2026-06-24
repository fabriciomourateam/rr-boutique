import { getCategories } from '@/lib/data'
import { createCategory, deleteCategory } from './actions'

export default async function CategoriasPage() {
  const cats = await getCategories()
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-serif mb-4">Categorias</h1>
      <form action={createCategory} className="flex gap-2 mb-6">
        <input name="name" placeholder="Nova categoria (ex: Vestidos)"
          className="flex-1 p-2 border rounded" required />
        <button className="px-4 rounded bg-[#E89BB0] text-black font-medium">Adicionar</button>
      </form>
      <ul className="divide-y">
        {cats.map((c) => (
          <li key={c.id} className="flex justify-between items-center py-2">
            <span>{c.name}</span>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <button className="text-sm text-red-600">Excluir</button>
            </form>
          </li>
        ))}
        {cats.length === 0 && <li className="py-2 text-neutral-500">Nenhuma categoria ainda.</li>}
      </ul>
    </div>
  )
}
