'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X, Upload, Loader2 } from 'lucide-react'

type ProductFormData = {
  id?: string
  name: string
  description: string
  price: number
  category: string
  sizes: string[]
  stock: number
  featured: boolean
  active: boolean
  images: string[]
}

const CATEGORIES = ['mujer', 'hombre', 'niños', 'accesorios', 'calzado']
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', 'Único']

export default function ProductForm({ initial }: { initial?: ProductFormData }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<ProductFormData>(
    initial ?? {
      name: '',
      description: '',
      price: 0,
      category: 'mujer',
      sizes: [],
      stock: 0,
      featured: false,
      active: true,
      images: [],
    }
  )

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setForm((prev) => ({ ...prev, images: [...prev.images, e.target!.result as string] }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = initial?.id ? `/api/products/${initial.id}` : '/api/products'
      const method = initial?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al guardar')
        return
      }

      router.push('/admin/productos')
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Ej: Remera básica blanca"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Describe el producto..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio (ARS)</label>
          <input
            type="number"
            required
            min={0}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input
            type="number"
            required
            min={0}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 accent-rose-500"
            />
            <span className="text-sm text-gray-700">Destacado</span>
          </label>
          {initial && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 accent-rose-500"
              />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Talles disponibles</label>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                form.sizes.includes(size)
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-rose-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {form.images.map((img, i) => (
            <div key={i} className="relative w-24 h-24">
              <Image src={img} alt="" fill className="object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-rose-400 hover:text-rose-400 transition-colors"
          >
            <Upload size={20} />
            <span className="text-xs mt-1">Subir</span>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleImageFiles(e.target.files)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {initial ? 'Actualizar producto' : 'Crear producto'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
