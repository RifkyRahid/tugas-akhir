"use client";
import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";

interface DateRollerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateRoller({ selectedDate, onDateChange }: DateRollerProps) {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});
  
  const calendarRef = useRef<HTMLDivElement>(null);

  // Helper: Format Date ke YYYY-MM-DD sesuai LOKAL time (bukan UTC)
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchBadges = async () => {
        try {
            const m = currentDate.getMonth() + 1;
            const y = currentDate.getFullYear();
            const res = await fetch(`/api/absensi/pending?month=${m}&year=${y}`);
            if (res.ok) {
                const data = await res.json();
                setPendingCounts(data.summary || {});
            }
        } catch (e) {
            console.error("Gagal load badge kalender");
        }
    };
    fetchBadges();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const changeDay = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    
    // Cegah masa depan
    if (newDate > new Date()) {
        Swal.fire({
            icon: 'warning',
            title: 'Ups!',
            text: 'Tidak bisa memilih tanggal di masa depan.',
            timer: 1500,
            showConfirmButton: false
        });
        return;
    }
    
    // --- PERBAIKAN DISINI ---
    // Jangan pakai toISOString() karena akan convert ke UTC (mundur hari)
    const dateStr = formatDateLocal(newDate); 
    
    setCurrentDate(newDate);
    onDateChange(dateStr);
  };

  // Render Calendar Grid
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayIndex = firstDay.getDay(); 
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    const days = [];
    
    for (let i = 0; i < startDayIndex; i++) {
        days.push(<div key={`empty-${i}`} style={{padding: '10px'}}></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        
        // --- PERBAIKAN DISINI JUGA ---
        const dateStr = formatDateLocal(dateObj);
        
        const isSelected = dateStr === selectedDate;
        const isFuture = dateObj > today;
        const count = pendingCounts[dateStr] || 0;

        days.push(
            <div 
                key={d} 
                onClick={() => {
                    if (!isFuture) {
                        setCurrentDate(dateObj);
                        onDateChange(dateStr);
                        setIsOpen(false);
                    }
                }}
                style={{
                    padding: '8px',
                    textAlign: 'center',
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                    borderRadius: '4px',
                    backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                    color: isSelected ? 'white' : (isFuture ? '#ccc' : '#333'),
                    position: 'relative',
                    fontWeight: isSelected ? 'bold' : 'normal'
                }}
            >
                {d}
                {count > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontSize: '9px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {count}
                    </div>
                )}
            </div>
        );
    }
    return days;
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={calendarRef}>
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: '#f3f4f6', 
            padding: '5px', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
        }}>
            <button 
                onClick={() => changeDay(-1)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '5px 10px', fontSize:'18px' }}
            >
                ‹
            </button>

            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    padding: '5px 15px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    minWidth: '150px', 
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                }}
            >
                {/* Tampilkan tanggal dengan format lokal Indonesia */}
                <span>📅 {currentDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>

            <button 
                onClick={() => changeDay(1)}
                style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    cursor: new Date(currentDate.getTime() + 86400000) > new Date() ? 'not-allowed' : 'pointer', 
                    padding: '5px 10px', 
                    fontSize:'18px',
                    opacity: new Date(currentDate.getTime() + 86400000) > new Date() ? 0.3 : 1
                }}
                disabled={new Date(currentDate.getTime() + 86400000) > new Date()}
            >
                ›
            </button>
        </div>

        {isOpen && (
            <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '5px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                zIndex: 1000,
                width: '300px',
                padding: '15px'
            }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                     <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()-1)))}>«</button>
                     <span style={{fontWeight:'bold'}}>{currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                     <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()+1)))} disabled={currentDate > new Date()}>»</button>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', fontSize:'12px'}}>
                    {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(h => (
                        <div key={h} style={{textAlign:'center', fontWeight:'bold', color:'#888', padding:'5px'}}>{h}</div>
                    ))}
                    {renderCalendar()}
                </div>
            </div>
        )}
    </div>
  );
}