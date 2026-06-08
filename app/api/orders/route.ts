import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

function effectiveQuantity(quantity: number, promoType: string | null): number {
  switch (promoType) {
    case 'TWO_FOR_ONE':    return Math.ceil(quantity / 2)
    case 'THREE_FOR_TWO':  return quantity - Math.floor(quantity / 3)
    case 'FOUR_FOR_THREE': return quantity - Math.floor(quantity / 4)
    default: return quantity
  }
}

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: { select: { name: true, images: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(orders)
}

export async function POST(request: NextRequest) {
  try {
    const { buyerName, buyerEmail, buyerPhone, items } = await request.json()

    if (!buyerName || !buyerEmail || !items?.length) {
      return Response.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    type ItemInput = { productId: string; quantity: number; size: string; price: number }
    let total = 0

    for (const item of items as ItemInput[]) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) return Response.json({ error: 'Producto no encontrado' }, { status: 400 })
      if (product.stock < item.quantity) {
        return Response.json(
          { error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}` },
          { status: 400 }
        )
      }
      const effectiveQty = effectiveQuantity(item.quantity, product.promoType)
      total += product.price * effectiveQty
    }

    const order = await prisma.order.create({
      data: {
        buyerName,
        buyerEmail,
        buyerPhone,
        total,
        items: {
          create: (items as ItemInput[]).map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    })

    return Response.json(order, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error al crear orden' }, { status: 500 })
  }
}
