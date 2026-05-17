'use client'
import Link from 'next/link'
import Image from 'next/image'

type Product = {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  sizes: string[]
}

export default function ProductCard({ product }: { product: Product }) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price)

  return (
    <Link href={`/productos/${product.id}`} className="group block">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-gray-100">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-5xl">👗</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</p>
        <h3 className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-1 group-hover:text-rose-500 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(product.price)}</p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {product.sizes.slice(0, 4).map((s) => (
            <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {s}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
