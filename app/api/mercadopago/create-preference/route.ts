import { NextRequest } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const { orderId, items, buyerEmail } = await request.json()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        items: items.map((item: { name: string; price: number; quantity: number; image: string }) => ({
          id: item.name,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          picture_url: item.image,
          currency_id: 'ARS',
        })),
        payer: { email: buyerEmail },
        back_urls: {
          success: `${baseUrl}/checkout/success?orderId=${orderId}`,
          failure: `${baseUrl}/checkout?error=pago_fallido`,
          pending: `${baseUrl}/checkout/success?orderId=${orderId}&pending=true`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        external_reference: orderId,
      },
    })

    return Response.json({ preferenceId: result.id, initPoint: result.init_point })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error al crear preferencia de pago' }, { status: 500 })
  }
}
