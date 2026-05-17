import { NextRequest } from 'next/server'
import MercadoPagoConfig, { Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.type === 'payment') {
      const paymentId = body.data?.id
      if (!paymentId) return Response.json({ ok: true })

      const payment = new Payment(client)
      const paymentData = await payment.get({ id: paymentId })

      const orderId = paymentData.external_reference
      const status = paymentData.status

      if (!orderId) return Response.json({ ok: true })

      const orderStatus =
        status === 'approved' ? 'APPROVED' :
        status === 'rejected' ? 'REJECTED' :
        'PENDING'

      await prisma.order.update({
        where: { id: orderId },
        data: { status: orderStatus as any, mpPaymentId: String(paymentId) },
      })
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Webhook error' }, { status: 500 })
  }
}
