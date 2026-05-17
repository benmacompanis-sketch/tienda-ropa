import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/shop/ProductCard'

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { active: true, featured: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  const newArrivals = await prisma.product.findMany({
    where: { active: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
          <span className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-4">
            Nueva colección
          </span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-2xl">
            Moda que te define
          </h1>
          <p className="text-gray-300 mt-4 max-w-md text-lg">
            Las últimas tendencias en ropa para hombre, mujer y niños. Calidad y estilo en cada prenda.
          </p>
          <div className="flex gap-4 mt-8">
            <Link
              href="/productos"
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              Ver colección
            </Link>
            <Link
              href="/productos?category=mujer"
              className="border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              Mujer
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Mujer', category: 'mujer', emoji: '👗' },
            { label: 'Hombre', category: 'hombre', emoji: '👔' },
            { label: 'Niños', category: 'niños', emoji: '🧒' },
            { label: 'Accesorios', category: 'accesorios', emoji: '👜' },
          ].map(({ label, category, emoji }) => (
            <Link
              key={category}
              href={`/productos?category=${category}`}
              className="bg-gray-50 hover:bg-rose-50 rounded-2xl p-6 flex flex-col items-center gap-3 transition-colors group"
            >
              <span className="text-4xl">{emoji}</span>
              <span className="font-medium text-gray-800 group-hover:text-rose-600 transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Productos destacados</h2>
            <Link href="/productos?featured=true" className="text-sm text-rose-500 hover:text-rose-600 font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Nuevos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nuevos ingresos</h2>
          <Link href="/productos" className="text-sm text-rose-500 hover:text-rose-600 font-medium">
            Ver todos →
          </Link>
        </div>
        {newArrivals.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-4">🛍️</p>
            <p>Pronto habrá productos disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
