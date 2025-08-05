"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect } from "react";
import ModalTambahEvent from "@/components/ModalTambahEvent";
import ModalEditEvent from "@/components/ModalEditEvent";
import "@/styles/calendar.css";

export default function KalenderAdminPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  function getEventColor(type: string) {
    switch (type) {
      case "MEETING":
        return "#007bff";
      case "BIRTHDAY":
        return "#e74c3c";
      case "HOLIDAY":
        return "#2ecc71";
      default:
        return "#f39c12";
    }
  }

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/event");
      const data = await res.json();

      const formatted = data.map((e: any) => ({
        id: e.id,
        title: e.title,
        start: e.date,
        backgroundColor: getEventColor(e.type),
        borderColor: getEventColor(e.type),
        textColor: "#fff",
        extendedProps: { type: e.type, description: e.description, date: e.date },
      }));

      setEvents(formatted);
    } catch (err) {
      console.error("Gagal fetch event", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventDrop = async (info: any) => {
    const newDate = info.event.startStr;
    const id = info.event.id;

    try {
      await fetch(`/api/admin/event/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate }),
      });

      fetchEvents();
    } catch (err) {
      console.error("Gagal update tanggal", err);
    }
  };

  const handleEventClick = (info: any) => {
    const { id, title, extendedProps } = info.event;
    setSelectedEvent({
      id,
      title,
      description: extendedProps.description,
      type: extendedProps.type,
      date: info.event.startStr,
    });
  };

  return (
    <div className="dashboard-card" style={{ overflowX: "auto" }}>
      <h1>Kalender Pengajuan & Pengingat</h1>

      <button
        onClick={() => setShowModal(true)}
        className="simpan-button"
        style={{ marginBottom: 10 }}
      >
        + Tambah Event
      </button>

      {/* Bagian Header Bulan + Legend */}
      <div
        className="header-calendar-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div
          className="legend-container"
          style={{
            display: "flex",
            gap: 15,
            flexWrap: "wrap",
          }}
        >
          <LegendItem color="#007bff" label="Meeting" />
          <LegendItem color="#e74c3c" label="Ulang Tahun" />
          <LegendItem color="#2ecc71" label="Libur" />
          <LegendItem color="#f39c12" label="Lainnya" />
        </div>
      </div>
      
      <div style={{ minWidth: "300px", maxWidth: "100%", overflowX: "auto" }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          editable={true}
          droppable={true}
          eventDrop={handleEventDrop}
          eventClick={handleEventClick}
          displayEventTime={false}
          eventDisplay="block"
        />
      </div>

      {showModal && (
        <ModalTambahEvent
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchEvents();
            setShowModal(false);
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
    </div>
  );
}

// Komponen LegendItem untuk dot warna
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
      <span style={{ fontSize: 14 }}>{label}</span>
    </div>
  );
}
