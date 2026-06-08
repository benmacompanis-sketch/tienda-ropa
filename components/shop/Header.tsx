'use client'
import Link from 'next/link'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useState } from 'react'

export default function Header() {
  const itemCount = useCartStore((s) => s.itemCount())
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
            Tienda<span className="text-rose-500"> Demo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/productos" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Productos
            </Link>
            <Link href="/productos?category=mujer" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Mujer
            </Link>
            <Link href="/productos?category=hombre" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Hombre
            </Link>
            <Link href="/productos?category=accesorios" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Accesorios
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/carrito" className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          <Link href="/productos" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Todos los productos</Link>
          <Link href="/productos?category=mujer" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Mujer</Link>
          <Link href="/productos?category=hombre" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Hombre</Link>
          <Link href="/productos?category=accesorios" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Accesorios</Link>
        </div>
      )}
    </header>
  )
}
