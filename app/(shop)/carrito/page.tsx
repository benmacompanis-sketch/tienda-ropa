'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCartStore()
  const count = itemCount()
  const subtotal = total()

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p)

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Agregá productos para continuar con tu compra.</p>
        <Link
          href="/productos"
          className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-medium transition-colors"
        >
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Carrito ({count} {count === 1 ? 'item' : 'items'})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4">
              <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Talle: {item.size}{item.color ? ` · ${item.color}` : ''}</p>
                <p className="font-semibold text-rose-500 mt-1">{formatPrice(item.price)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => removeItem(item.productId, item.size, item.color)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                    className="p-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-1.5 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-20">
            <h2 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm text-gray-600">
                  <span className="line-clamp-1 flex-1">{item.name} × {item.quantity}</span>
                  <span className="ml-2 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span className="text-rose-500">{formatPrice(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-4 w-full flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Proceder al pago
            </Link>
            <Link href="/productos" className="mt-3 w-full flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
