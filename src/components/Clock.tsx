'use client'
import React, { useEffect, useState } from 'react';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{ marginBottom: '1rem' }}>
      <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formattedDate}</p>
      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563EB' }}>{formattedTime}</p>
    </div>
  );
}
