export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { prisma } = await import('./lib/prisma')
    try {
      await prisma.$executeRaw`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "colors" JSONB NOT NULL DEFAULT '[]'`
      await prisma.$executeRaw`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION`
      await prisma.$executeRaw`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "promoType" TEXT`
    } catch {
      // columns already exist or migration already applied
    }
  }
}
