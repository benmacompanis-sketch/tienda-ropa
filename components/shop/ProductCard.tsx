'use client'
import Link from 'next/link'
import Image from 'next/image'

type ProductColor = { name: string; hex: string; images: string[] }

const PROMO_BADGE: Record<string, string> = {
  TWO_FOR_ONE:    '2x1',
  THREE_FOR_TWO:  '3x2',
  FOUR_FOR_THREE: '4x3',
  FREE_SHIPPING:  '🚚 Envío gratis',
}

type Product = {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  promoType?: string | null
  images: string[]
  colors?: ProductColor[]
  category: string
  sizes: string[]
}

export default function ProductCard({ product }: { product: Product }) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price)

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const colors = product.colors ?? []
  const promoBadge = product.promoType ? PROMO_BADGE[product.promoType] : null

  return (
    <Link href={`/productos/${product.id}`} className="group block">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-gray-100">
        {product.images[0] ? (
          <Image src={product.images[0]} alt={product.name} fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-5xl">👗</span>
          </div>
        )}
        {promoBadge && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {promoBadge}
          </span>
        )}
        {!promoBadge && discount && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</p>
        <h3 className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-1 group-hover:text-rose-500 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</p>
          {product.originalPrice && (
            <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
          )}
        </div>
        {colors.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {colors.slice(0, 6).map((c) => (
              <span key={c.name} title={c.name}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: c.hex }} />
            ))}
            {colors.length > 6 && <span className="text-xs text-gray-400">+{colors.length - 6}</span>}
          </div>
        )}
        {!colors.length && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {product.sizes.slice(0, 4).map((s) => (
              <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
