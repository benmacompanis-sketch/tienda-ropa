import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export default async function NuevoProductoPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
        <p className="text-sm text-gray-500 mt-0.5">Completá los datos del nuevo producto.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <ProductForm />
      </div>
    </div>
  )
}
