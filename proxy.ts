import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedAdminRoutes = ['/admin/dashboard', '/admin/productos', '/admin/ordenes']
const publicAdminRoute = '/admin/login'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtectedAdmin = protectedAdminRoutes.some((r) => pathname.startsWith(r))

  if (isProtectedAdmin) {
    const sessionCookie = request.cookies.get('session')?.value
    const session = await decrypt(sessionCookie)

    if (!session) {
      return NextResponse.redirect(new URL(publicAdminRoute, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
