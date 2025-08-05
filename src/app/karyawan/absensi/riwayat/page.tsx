"use client"

import React, { useEffect, useState } from "react"

interface Attendance {
  id: number
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
}

export default function RiwayatAbsensiPage() {
  const [data, setData] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRiwayat() {
      try {
        const res = await fetch("/api/absensi/riwayat", {
          method: "GET",
          credentials: "include",
        })
        const result = await res.json()
        setData(result)
      } catch (err) {
        console.error("Gagal ambil data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRiwayat()
  }, [])

  return (
    <div className="page-container">
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Riwayat Absensi
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Tanggal</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Jam Masuk</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Jam Pulang</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((absen) => (
              <tr key={absen.id}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {new Date(absen.date).toLocaleDateString()}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {absen.checkIn ? new Date(absen.checkIn).toLocaleTimeString() : "-"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {absen.checkOut ? new Date(absen.checkOut).toLocaleTimeString() : "-"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {absen.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
