// src/app/admin/layout.tsx
'use client'
import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserFromLocalStorage } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import '@/styles/dashboard.css'
import 'leaflet/dist/leaflet.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"admin" | "superadmin" | "karyawan">('admin');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const user = getUserFromLocalStorage()
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      router.push('/')
    } else {
      setUserRole(user.role as "admin" | "superadmin" | "karyawan");
      setIsAuthorized(true)
    }
  }, [router])

  if (!isAuthorized) return null; 

  return (
    <div className="layout-container">
      <Sidebar role={userRole} />
      
      {/* Cukup begini saja, CSS .main-content yang akan mengurus margin 250px */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}