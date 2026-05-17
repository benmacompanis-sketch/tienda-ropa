import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { uploadImage } from '@/lib/cloudinary'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const search = searchParams.get('search')

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
      ...(featured === 'true' ? { featured: true } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(products)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { name, description, price, category, sizes, stock, featured, images } = body

    const uploadedImages: string[] = []
    for (const img of images as string[]) {
      if (img.startsWith('data:')) {
        const url = await uploadImage(img)
        uploadedImages.push(url)
      } else {
        uploadedImages.push(img)
      }
    }

    const product = await prisma.product.create({
      data: { name, description, price: Number(price), category, sizes, stock: Number(stock), featured: Boolean(featured), images: uploadedImages },
    })

    return Response.json(product, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
