import Link from 'next/link'
import { CheckCircle, Clock } from 'lucide-react'

type SearchParams = Promise<{ orderId?: string; pending?: string }>

export default async function SuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { orderId, pending } = await searchParams
  const isPending = pending === 'true'

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPending ? 'bg-yellow-100' : 'bg-green-100'}`}>
        {isPending ? (
          <Clock size={40} className="text-yellow-500" />
        ) : (
          <CheckCircle size={40} className="text-green-500" />
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {isPending ? 'Pago pendiente' : '¡Compra realizada!'}
      </h1>

      <p className="text-gray-500 mb-4">
        {isPending
          ? 'Tu pago está siendo procesado. Te notificaremos por email cuando se confirme.'
          : 'Tu pedido fue confirmado. Recibirás un email con los detalles.'}
      </p>

      {orderId && (
        <p className="text-xs text-gray-400 mb-8 font-mono bg-gray-50 px-3 py-2 rounded-lg">
          Orden: {orderId}
        </p>
      )}

      <Link
        href="/"
        className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-medium transition-colors inline-block"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
