"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect } from "react";
import ModalTambahEvent from "@/components/ModalTambahEvent";
import ModalEditEvent from "@/components/ModalEditEvent";
import Swal from "sweetalert2";
import "@/styles/calendar.css";

export default function KalenderAdminPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); // Menyimpan tanggal yang diklik
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Helper Warna
  function getEventColor(type: string) {
    switch (type) {
      case "MEETING": return "#3b82f6"; // Biru
      case "BIRTHDAY": return "#ef4444"; // Merah
      case "HOLIDAY": return "#22c55e"; // Hijau
      default: return "#f59e0b"; // Kuning/Orange
    }
  }

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/event"); // Pastikan path API sesuai folder kamu
      const data = await res.json();

      const formatted = data.map((e: any) => ({
        id: e.id,
        title: e.title,
        start: e.date,
        allDay: true, // <--- PENTING: Paksa jadi event seharian agar pasti muncul
        backgroundColor: getEventColor(e.type),
        borderColor: getEventColor(e.type),
        textColor: "#fff",
        extendedProps: { 
            type: e.type, 
            description: e.description, 
            date: e.date,
            isAutomatic: e.isAutomatic // Flag dari backend (true jika ultah user)
        },
        // Blokir drag & drop jika event otomatis
        editable: !e.isAutomatic, 
      }));

      setEvents(formatted);
    } catch (err) {
      console.error("Gagal fetch event", err);
      Swal.fire("Error", "Gagal memuat data kalender", "error");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handler: Geser Event (Drag & Drop)
  const handleEventDrop = async (info: any) => {
    const { id, extendedProps } = info.event;
    
    // Proteksi ganda: Jangan biarkan event otomatis digeser
    if (extendedProps.isAutomatic) {
        info.revert();
        Swal.fire("Akses Ditolak", "Event Ulang Tahun Karyawan dibuat otomatis dan tidak bisa digeser.", "warning");
        return;
    }

    const newDate = info.event.startStr;

    try {
      // Tampilkan loading kecil
      const toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      
      const res = await fetch(`/api/admin/event/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate }),
      });

      if(res.ok) {
        toast.fire({ icon: 'success', title: 'Jadwal diperbarui' });
      } else {
        info.revert();
      }
    } catch (err) {
      info.revert();
      console.error("Gagal update tanggal", err);
    }
  };

  // Handler: Klik Event (Untuk Edit)
  const handleEventClick = (info: any) => {
    const { id, title, extendedProps } = info.event;
    
    // Jika Event Otomatis, Tampilkan Info Saja (Tidak bisa edit)
    if (extendedProps.isAutomatic) {
        Swal.fire({
            title: title,
            text: "Ini adalah event ulang tahun otomatis berdasarkan data karyawan.",
            icon: "info",
            confirmButtonColor: "#3b82f6"
        });
        return;
    }

    // Jika Event Manual, Buka Modal Edit
    setSelectedEvent({
      id,
      title,
      description: extendedProps.description,
      type: extendedProps.type,
      date: info.event.startStr,
    });
  };

  // Handler: Klik Tanggal Kosong (Untuk Tambah)
  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr); // Ambil tanggal yang diklik
    setShowAddModal(true);        // Buka modal
  };

  return (
    <div className="dashboard-card" style={{ overflowX: "auto", minHeight: '80vh' }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h1 style={{margin:0}}>Kalender Kegiatan</h1>
        <button
            onClick={() => {
                setSelectedDate(""); // Reset tanggal jika klik tombol manual
                setShowAddModal(true);
            }}
            className="add-button"
            style={{ margin: 0 }}
        >
            + Tambah Event Baru
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginBottom: 20, padding: '10px', background:'#f8f9fa', borderRadius:'8px' }}>
          <LegendItem color="#3b82f6" label="Meeting" />
          <LegendItem color="#ef4444" label="Ulang Tahun" />
          <LegendItem color="#22c55e" label="Libur" />
          <LegendItem color="#f59e0b" label="Lainnya" />
      </div>
      
      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          editable={true} // Global edit setting
          droppable={true}
          eventDrop={handleEventDrop}
          eventClick={handleEventClick}
          dateClick={handleDateClick} // <--- FITUR KLIK TANGGAL
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth' // bisa tambah ,timeGridWeek jika mau
          }}
          height="auto"
          dayMaxEvents={3} // Batasi max 3 event per kotak agar tidak panjang ke bawah
        />
      </div>

      {showAddModal && (
        <ModalTambahEvent
          initialDate={selectedDate} // Kirim tanggal yang diklik
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchEvents();
            setShowAddModal(false);
          }}
        />
      )}

      {selectedEvent && (
        <ModalEditEvent
          eventData={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSuccess={() => {
            fetchEvents();
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Style Override Khusus Kalender */}
      <style jsx global>{`
        .fc-event { cursor: pointer; }
        .fc-daygrid-day:hover { background-color: #f0f9ff; cursor: pointer; }
        .fc-toolbar-title { font-size: 1.5rem !important; color: #1e293b; }
        .fc-button-primary { background-color: #3b82f6 !important; border-color: #3b82f6 !important; }
        .fc-button-primary:hover { background-color: #2563eb !important; }
      `}</style>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
      <span style={{ fontSize: 13, color:'#64748b', fontWeight: 600 }}>{label}</span>
    </div>
  );
}