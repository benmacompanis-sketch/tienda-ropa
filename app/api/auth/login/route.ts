import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return Response.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return Response.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    await createSession(user.id, user.email, user.name)

    return Response.json({ ok: true, name: user.name })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
