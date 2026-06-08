import { NextRequest } from 'next/server'
import MercadoPagoConfig, { Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const { formData, orderId, amount, email } = await request.json()

    const payment = new Payment(client)
    const result = await payment.create({
      body: {
        token: formData.token,
        installments: formData.installments,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        transaction_amount: amount,
        description: 'Compra en tienda',
        payer: {
          email: (formData.payer as Record<string, unknown>)?.email ?? email,
          identification: (formData.payer as Record<string, unknown>)?.identification as { type: string; number: string } | undefined,
        },
        external_reference: orderId,
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`,
      },
    })

    const orderStatus =
      result.status === 'approved' ? 'APPROVED' :
      result.status === 'rejected' ? 'REJECTED' :
      'PENDING'

    await prisma.order.update({
      where: { id: orderId },
      data: { status: orderStatus as 'APPROVED' | 'REJECTED' | 'PENDING', mpPaymentId: String(result.id) },
    })

    return Response.json({ status: result.status, paymentId: result.id })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error al procesar el pago' }, { status: 500 })
  }
}
