// src/app/admin/layout.tsx
'use client'
import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserFromLocalStorage } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import '@/styles/dashboard.css'
import 'leaflet/dist/leaflet.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const user = getUserFromLocalStorage()
    if (!user || user.role !== 'admin') {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="layout-container">
      <Sidebar role="admin" />
      <main className="main-content">{children}</main>
    </div>
  )
}
