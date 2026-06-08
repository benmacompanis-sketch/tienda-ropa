'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react'
import { useCartStore } from '@/store/cart'

type ProductColor = { name: string; hex: string; images: string[] }

type Product = {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  category: string
  sizes: string[]
  images: string[]
  colors: ProductColor[]
  stock: number
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const colors = (data.colors as ProductColor[]) ?? []
        setProduct({ ...data, colors })
        if (colors.length > 0) setSelectedColor(colors[0])
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    setSelectedImage(0)
  }, [selectedColor])

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Loader2 size={32} className="animate-spin text-rose-500" />
    </div>
  )
  if (!product) return <div className="text-center py-20 text-gray-500">Producto no encontrado</div>

  const activeImages = selectedColor?.images.length ? selectedColor.images : product.images
  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p)

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const handleAddToCart = () => {
    if (!selectedSize) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: activeImages[0] ?? '',
      size: selectedSize,
      color: selectedColor?.name ?? null,
      quantity: 1,
      stock: product.stock,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Imágenes */}
        <div className="space-y-3">
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100">
            {activeImages[selectedImage] ? (
              <Image src={activeImages[selectedImage]} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">👗</div>
            )}
          </div>
          {activeImages.length > 1 && (
            <div className="flex gap-2">
              {activeImages.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 relative rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-rose-500' : 'border-transparent'}`}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">{product.category}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <p className="text-3xl font-semibold text-rose-500">{formatPrice(product.price)}</p>
            {product.originalPrice && (
              <>
                <p className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                {discount && (
                  <span className="bg-rose-100 text-rose-600 text-sm font-bold px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                )}
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Colores */}
          {product.colors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Color {selectedColor && <span className="text-rose-500">— {selectedColor.name}</span>}
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <button key={color.name} onClick={() => setSelectedColor(color)}
                    title={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      selectedColor?.name === color.name ? 'border-gray-900 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Talles */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Talle {selectedSize && <span className="text-rose-500">— {selectedSize}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      selectedSize === size ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                    }`}>
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && <p className="text-xs text-gray-400 mt-2">Seleccioná un talle para continuar</p>}
            </div>
          )}

          {product.stock === 0 ? (
            <div className="w-full py-3.5 rounded-xl font-medium text-sm text-center bg-gray-100 text-gray-400">Sin stock</div>
          ) : (
            <button onClick={handleAddToCart} disabled={!selectedSize || product.sizes.length === 0}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm transition-all ${
                added ? 'bg-green-500 text-white' : !selectedSize ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}>
              <ShoppingBag size={18} />
              {added ? '¡Agregado al carrito!' : 'Agregar al carrito'}
            </button>
          )}

          <p className="text-xs text-gray-400 mt-3 text-center">
            {product.stock > 0 ? `Stock disponible: ${product.stock} unidades` : 'Producto agotado'}
          </p>
        </div>
      </div>
    </div>
  )
}
