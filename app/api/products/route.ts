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

type ColorInput = { name: string; hex: string; images: string[] }

async function uploadColors(colors: ColorInput[]): Promise<ColorInput[]> {
  return Promise.all(
    colors.map(async (color) => ({
      ...color,
      images: await Promise.all(
        color.images.map((img) =>
          img.startsWith('data:') ? uploadImage(img) : Promise.resolve(img)
        )
      ),
    }))
  )
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { name, description, price, originalPrice, promoType, category, sizes, stock, featured, images, colors } = body

    const uploadedImages: string[] = []
    for (const img of images as string[]) {
      uploadedImages.push(img.startsWith('data:') ? await uploadImage(img) : img)
    }

    const uploadedColors = await uploadColors(colors ?? [])

    const product = await prisma.product.create({
      data: {
        name, description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        promoType: promoType || null,
        category, sizes,
        stock: Number(stock),
        featured: Boolean(featured),
        images: uploadedImages,
        colors: uploadedColors,
      },
    })

    return Response.json(product, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
