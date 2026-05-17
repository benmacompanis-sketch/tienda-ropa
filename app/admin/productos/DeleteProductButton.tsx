'use client'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`¿Desactivar "${name}"?`)) return
    setLoading(true)
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 size={15} />
    </button>
  )
}
