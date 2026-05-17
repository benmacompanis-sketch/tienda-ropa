import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

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

    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    )

    const order = await prisma.order.create({
      data: {
        buyerName,
        buyerEmail,
        buyerPhone,
        total,
        items: {
          create: items.map((item: { productId: string; size: string; quantity: number; price: number }) => ({
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
