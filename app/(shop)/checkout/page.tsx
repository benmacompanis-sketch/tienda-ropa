'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { Loader2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const subtotal = total()

  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
        <p className="text-gray-500 mb-6">Tu carrito está vacío.</p>
        <Link href="/productos" className="bg-rose-500 text-white px-8 py-3 rounded-full font-medium">
          Ver productos
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Crear orden en la DB
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: form.name,
          buyerEmail: form.email,
          buyerPhone: form.phone,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      })

      if (!orderRes.ok) throw new Error('Error al crear la orden')
      const order = await orderRes.json()

      // 2. Crear preferencia de MercadoPago
      const mpRes = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          buyerEmail: form.email,
          items: items.map((i) => ({
            name: `${i.name} - Talle ${i.size}`,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
        }),
      })

      if (!mpRes.ok) throw new Error('Error al iniciar el pago')
      const { initPoint } = await mpRes.json()

      clearCart()
      window.location.href = initPoint
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Finalizar compra</h1>

      <div className="grid lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Tus datos</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="juan@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="+54 11 1234-5678"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-colors"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Procesando...' : `Pagar con MercadoPago — ${formatPrice(subtotal)}`}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Serás redirigido a MercadoPago para completar el pago de forma segura.
          </p>
        </form>

        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Tu pedido</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                  <div className="text-gray-700">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-400"> × {item.quantity} ({item.size})</span>
                  </div>
                  <span className="text-gray-900 font-medium ml-2 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-rose-500">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
