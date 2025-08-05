'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logoutUser } from '@/lib/auth'
import styles from './layout/Sidebar.module.css'

interface SidebarProps {
  role: 'admin' | 'karyawan'
}

export default function Sidebar({ role }: SidebarProps) {
  const router = useRouter()

  const handleLogout = () => {
    logoutUser()
    router.push('/login')
  }

  type MenuItem = {
    label: string;
    href?: string;
    subMenu?: { label: string; href: string }[];
  };

  const menuAdmin: MenuItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    {
      label: 'Absensi',
      subMenu: [
        { label: 'Kelola Absensi', href: '/admin/absensi' },
        { label: 'Absensi Pending', href: '/admin/absensi-pending' },
        { label: 'Area Absensi', href: '/admin/master/area-absensi' },
      ]
    },
    {
      label: 'Karyawan',
      subMenu: [
        { label: 'Kelola Karyawan', href: '/admin/karyawan' },
        { label: 'Pengajuan Karyawan', href: '/admin/pengajuan' },
      ]
    },
    { label: 'Kalender', href: '/admin/kalender' },
  ];

  const menuKaryawan: MenuItem[] = [
    { label: 'Dashboard', href: '/karyawan/dashboard' },
    { label: 'Absensi Saya', href: '/karyawan/absensi' },
    { label: 'Ajukan Izin', href: '/karyawan/izin' },
  ];

  const menu = role === 'admin' ? menuAdmin : menuKaryawan;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        HR-RAM <hr style={{ textAlign: "left", marginLeft: 0 }} />
      </div>

      <nav className={styles.nav}>
        {menu.map(item => (
          item.subMenu ? (
            <div key={item.label} className={styles.menuGroup}>
              <div className={styles.groupLabel}>{item.label}</div>
              {item.subMenu.map(sub => (
                <Link key={sub.href} href={sub.href} className={styles.link}>
                  {sub.label}
                </Link>
              ))}
            </div>
          ) : (
            item.href ? (
              <Link key={item.href} href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : null
          )
        ))}
      </nav>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        Logout
      </button>
    </aside>
  )
}
