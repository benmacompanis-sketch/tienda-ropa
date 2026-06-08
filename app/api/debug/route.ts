import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Intentar leer un producto con todos los campos posibles
    const p = await prisma.product.findFirst()
    return Response.json({ fields: p ? Object.keys(p) : [], sample: p })
  } catch (e) {
    return Response.json({ error: String(e) })
  }
}
