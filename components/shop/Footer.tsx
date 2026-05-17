export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-3">
              MODA<span className="text-rose-500">.</span>
            </h3>
            <p className="text-sm">Tu tienda de ropa con las últimas tendencias.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/productos" className="hover:text-white transition-colors">Todos los productos</a></li>
              <li><a href="/productos?category=mujer" className="hover:text-white transition-colors">Mujer</a></li>
              <li><a href="/productos?category=hombre" className="hover:text-white transition-colors">Hombre</a></li>
              <li><a href="/productos?category=accesorios" className="hover:text-white transition-colors">Accesorios</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>info@tiendaropa.com</li>
              <li>+54 11 1234-5678</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
          © {new Date().getFullYear()} Tienda de Ropa. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
