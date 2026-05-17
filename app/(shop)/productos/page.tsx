import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/shop/ProductCard'
import Link from 'next/link'

type SearchParams = Promise<{ category?: string; search?: string; featured?: string }>

const CATEGORIES = ['mujer', 'hombre', 'niños', 'accesorios', 'calzado']

export default async function ProductosPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, search, featured } = await searchParams

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
      ...(featured === 'true' ? { featured: true } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filtros */}
        <aside className="w-full md:w-48 shrink-0">
          <h3 className="font-semibold text-gray-900 mb-3">Categorías</h3>
          <div className="flex md:flex-col gap-2">
            <Link
              href="/productos"
              className={`px-3 py-1.5 rounded-lg text-sm ${!category ? 'bg-rose-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Todos
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/productos?category=${c}`}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize ${category === c ? 'bg-rose-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {c}
              </Link>
            ))}
          </div>
        </aside>

        {/* Productos */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Todos los productos'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{products.length} productos</p>
            </div>
            <form>
              <input
                name="search"
                defaultValue={search}
                placeholder="Buscar..."
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 w-40"
              />
            </form>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg">No hay productos disponibles</p>
              <Link href="/productos" className="text-rose-500 text-sm mt-2 inline-block">
                Ver todos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
