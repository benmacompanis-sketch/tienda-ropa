import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { secret, email, password, name } = await request.json()

  if (secret !== process.env.SETUP_SECRET) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ message: 'Usuario ya existe', email })
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({ data: { email, password: hashed, name } })

  return Response.json({ ok: true, message: 'Admin creado', email })
}
