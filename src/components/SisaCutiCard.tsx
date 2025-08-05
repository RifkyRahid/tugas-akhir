import React, { useEffect, useState } from "react";

const SisaCutiCard = () => {
  const [sisaCuti, setSisaCuti] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSisaCuti = async () => {
      try {
        const res = await fetch("/api/cuti/sisa");
        const data = await res.json();
        setSisaCuti(data.sisaCuti);
      } catch {
        setSisaCuti(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSisaCuti();
  }, []);

  return (
    <div className="sisa-cuti-card">
      <h4 style={{ color: "#004073" }}>Sisa Cuti Tahun Ini</h4>
      {loading ? (
        <p>Loading...</p>
      ) : sisaCuti !== null ? (
        <p>
          <strong>{sisaCuti}</strong> hari
        </p>
      ) : (
        <p>Gagal mengambil data cuti.</p>
      )}
    </div>
  );
};

export default SisaCutiCard;