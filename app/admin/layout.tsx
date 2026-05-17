import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
    </div>
  )
}
