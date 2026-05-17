import { prisma } from '@/lib/prisma'
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const [totalProducts, totalOrders, recentOrders, revenue] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'APPROVED' },
    }),
  ])

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p)

  const stats = [
    { label: 'Productos activos', value: totalProducts, icon: Package, color: 'bg-blue-100 text-blue-600' },
    { label: 'Órdenes totales', value: totalOrders, icon: ShoppingCart, color: 'bg-rose-100 text-rose-600' },
    { label: 'Ingresos aprobados', value: formatPrice(revenue._sum.total ?? 0), icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { label: 'Administradores', value: 1, icon: Users, color: 'bg-purple-100 text-purple-600' },
  ]

  const statusLabel: Record<string, { text: string; color: string }> = {
    PENDING: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { text: 'Aprobado', color: 'bg-green-100 text-green-700' },
    REJECTED: { text: 'Rechazado', color: 'bg-red-100 text-red-700' },
    CANCELLED: { text: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenido, {session.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Últimas órdenes</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No hay órdenes todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Comprador</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs text-gray-400">{order.id.slice(0, 8)}…</td>
                    <td className="py-3 text-gray-900">{order.buyerName}</td>
                    <td className="py-3 text-gray-500">{order.items.length}</td>
                    <td className="py-3 font-medium text-gray-900">{formatPrice(order.total)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusLabel[order.status]?.color}`}>
                        {statusLabel[order.status]?.text}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('es-AR')}
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
