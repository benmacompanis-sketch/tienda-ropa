import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function OrdenesPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p)

  const statusConfig: Record<string, { text: string; color: string }> = {
    PENDING: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { text: 'Aprobado', color: 'bg-green-100 text-green-700' },
    REJECTED: { text: 'Rechazado', color: 'bg-red-100 text-red-700' },
    CANCELLED: { text: 'Cancelado', color: 'bg-gray-100 text-gray-600' },
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Órdenes</h1>
        <p className="text-sm text-gray-500 mt-0.5">{orders.length} órdenes en total</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🛒</p>
            <p>No hay órdenes todavía.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Orden</th>
                  <th className="px-4 py-3 font-medium">Comprador</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Productos</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.id.slice(0, 10)}…</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.buyerName}</td>
                    <td className="px-4 py-3 text-gray-500">{order.buyerEmail}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {order.items.map((item) => (
                          <div key={item.id} className="text-xs text-gray-500">
                            {item.product.name} × {item.quantity} ({item.size})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status]?.color}`}>
                        {statusConfig[order.status]?.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
