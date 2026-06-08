import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { uploadImage } from '@/lib/cloudinary'

type Params = { params: Promise<{ id: string }> }
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

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return Response.json({ error: 'No encontrado' }, { status: 404 })
  return Response.json(product)
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const body = await request.json()
    const { name, description, price, originalPrice, category, sizes, stock, featured, active, images, colors } = body

    const uploadedImages: string[] = []
    for (const img of images as string[]) {
      uploadedImages.push(img.startsWith('data:') ? await uploadImage(img) : img)
    }

    const uploadedColors = await uploadColors(colors ?? [])

    const product = await prisma.product.update({
      where: { id },
      data: {
        name, description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        category, sizes,
        stock: Number(stock),
        featured: Boolean(featured),
        active: Boolean(active),
        images: uploadedImages,
        colors: uploadedColors,
      },
    })

    return Response.json(product)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.product.update({ where: { id }, data: { active: false } })
  return Response.json({ ok: true })
}
