'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X, Upload, Loader2, Plus } from 'lucide-react'

export type ProductColor = { name: string; hex: string; images: string[] }

export const PROMO_TYPES = [
  { value: '', label: 'Sin promoción' },
  { value: 'TWO_FOR_ONE', label: '2x1 — Llevás 2, pagás 1' },
  { value: 'THREE_FOR_TWO', label: '3x2 — Llevás 3, pagás 2' },
  { value: 'FOUR_FOR_THREE', label: '4x3 — Llevás 4, pagás 3' },
  { value: 'FREE_SHIPPING', label: '🚚 Envío gratis' },
]

type ProductFormData = {
  id?: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  promoType: string
  category: string
  sizes: string[]
  stock: number
  featured: boolean
  active: boolean
  images: string[]
  colors: ProductColor[]
}

const CATEGORIES = ['mujer', 'hombre', 'niños', 'accesorios', 'calzado']
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', 'Único']

export default function ProductForm({ initial }: { initial?: Partial<ProductFormData> }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const colorFileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addingColor, setAddingColor] = useState(false)
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000' })
  const [uploadingColorIdx, setUploadingColorIdx] = useState<number | null>(null)

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    originalPrice: null,
    promoType: '',
    category: 'mujer',
    sizes: [],
    stock: 0,
    featured: false,
    active: true,
    images: [],
    colors: [],
    ...initial,
  })

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) =>
        setForm((prev) => ({ ...prev, images: [...prev.images, e.target!.result as string] }))
      reader.readAsDataURL(file)
    })
  }

  const handleColorImageFiles = (files: FileList | null, colorIdx: number) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setForm((prev) => {
          const colors = [...prev.colors]
          colors[colorIdx] = { ...colors[colorIdx], images: [...colors[colorIdx].images, e.target!.result as string] }
          return { ...prev, colors }
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))

  const removeColorImage = (colorIdx: number, imgIdx: number) =>
    setForm((prev) => {
      const colors = [...prev.colors]
      colors[colorIdx] = { ...colors[colorIdx], images: colors[colorIdx].images.filter((_, i) => i !== imgIdx) }
      return { ...prev, colors }
    })

  const addColor = () => {
    if (!newColor.name.trim()) return
    setForm((prev) => ({ ...prev, colors: [...prev.colors, { ...newColor, images: [] }] }))
    setNewColor({ name: '', hex: '#000000' })
    setAddingColor(false)
  }

  const removeColor = (idx: number) =>
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== idx) }))

  const toggleSize = (size: string) =>
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }))

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
      if (!res.ok) { setError((await res.json()).error || 'Error al guardar'); return }
      router.push('/admin/productos')
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const discount = form.originalPrice && form.originalPrice > form.price
    ? Math.round((1 - form.price / form.originalPrice) * 100)
    : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Ej: Remera básica" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Describe el producto..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio (ARS)</label>
          <input type="number" required min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio original <span className="text-gray-400 font-normal">(opcional, para mostrar % de descuento)</span>
          </label>
          <input type="number" min={0} value={form.originalPrice ?? ''}
            onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : null })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Ej: 15000" />
          {discount && (
            <p className="text-xs text-green-600 mt-1 font-medium">🏷️ Descuento: {discount}% OFF</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de promoción</label>
          <select value={form.promoType} onChange={(e) => setForm({ ...form, promoType: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
            {PROMO_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input type="number" required min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4 pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-rose-500" />
            <span className="text-sm text-gray-700">Destacado</span>
          </label>
          {initial?.id && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-rose-500" />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
          )}
        </div>
      </div>

      {/* Talles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Talles disponibles</label>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button key={size} type="button" onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                form.sizes.includes(size) ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-gray-300 hover:border-rose-300'
              }`}>
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colores */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Colores disponibles</label>
          <button type="button" onClick={() => setAddingColor(true)}
            className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium">
            <Plus size={14} /> Agregar color
          </button>
        </div>

        {addingColor && (
          <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre</label>
              <input type="text" value={newColor.name} onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                placeholder="Ej: Rojo" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Color</label>
              <input type="color" value={newColor.hex} onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                className="w-10 h-9 rounded border border-gray-300 cursor-pointer" />
            </div>
            <button type="button" onClick={addColor} className="bg-rose-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-rose-600">Agregar</button>
            <button type="button" onClick={() => setAddingColor(false)} className="text-gray-500 text-sm hover:text-gray-700">Cancelar</button>
          </div>
        )}

        <div className="space-y-3">
          {form.colors.map((color, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: color.hex }} />
                  <span className="text-sm font-medium text-gray-800">{color.name}</span>
                </div>
                <button type="button" onClick={() => removeColor(i)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {color.images.map((img, j) => (
                  <div key={j} className="relative w-16 h-16">
                    <Image src={img} alt="" fill className="object-cover rounded-lg" />
                    <button type="button" onClick={() => removeColorImage(i, j)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"><X size={12} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => { setUploadingColorIdx(i); colorFileRef.current?.click() }}
                  className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-rose-400 hover:text-rose-400 transition-colors">
                  <Upload size={14} />
                  <span className="text-xs mt-0.5">Foto</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <input ref={colorFileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => { if (uploadingColorIdx !== null) handleColorImageFiles(e.target.files, uploadingColorIdx) }} />
      </div>

      {/* Imágenes generales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes generales <span className="text-gray-400 font-normal">(se usan si no hay fotos por color)</span>
        </label>
        <div className="flex flex-wrap gap-3 mb-3">
          {form.images.map((img, i) => (
            <div key={i} className="relative w-24 h-24">
              <Image src={img} alt="" fill className="object-cover rounded-lg" />
              <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-rose-400 hover:text-rose-400 transition-colors">
            <Upload size={20} />
            <span className="text-xs mt-1">Subir</span>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageFiles(e.target.files)} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {initial?.id ? 'Actualizar producto' : 'Crear producto'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
