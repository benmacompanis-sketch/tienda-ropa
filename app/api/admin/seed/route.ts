import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Endpoint solo para crear el admin inicial. Deshabilitar en producción.
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'No disponible en producción' }, { status: 403 })
  }

  const email = 'admin@tienda.com'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ message: 'Admin ya existe', email })
  }

  const password = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.create({
    data: { email, password, name: 'Administrador' },
  })

  return Response.json({ message: 'Admin creado', email: user.email })
}
