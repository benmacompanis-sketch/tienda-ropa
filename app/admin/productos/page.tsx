import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Plus, Pencil } from 'lucide-react'
import DeleteProductButton from './DeleteProductButton'

export default async function AdminProductosPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} productos en total</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nuevo producto
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p>No hay productos. ¡Crea el primero!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.images[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">👗</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          {product.featured && (
                            <span className="text-xs text-amber-600 font-medium">★ Destacado</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{product.category}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-gray-500">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={15} />
                        </Link>
                        <DeleteProductButton id={product.id} name={product.name} />
                      </div>
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
