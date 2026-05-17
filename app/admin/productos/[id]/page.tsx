import { getSession } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/admin/ProductForm'

type Params = { params: Promise<{ id: string }> }

export default async function EditProductoPage({ params }: Params) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) notFound()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
        <p className="text-sm text-gray-500 mt-0.5">{product.name}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <ProductForm
          initial={{
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            sizes: product.sizes,
            stock: product.stock,
            featured: product.featured,
            active: product.active,
            images: product.images,
          }}
        />
      </div>
    </div>
  )
}
