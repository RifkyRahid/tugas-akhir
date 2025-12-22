"use client";
import React from "react";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number | null;
  lng: number | null;
  userName: string;
}

export default function MapModal({ isOpen, onClose, lat, lng, userName }: MapModalProps) {
  if (!isOpen) return null;

  if (!lat || !lng) return null;

  // Menggunakan Embed API Sederhana
  const googleMapsUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=id&z=17&output=embed`;
  const directLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
            <h3>Lokasi Absen: {userName}</h3>
            <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
            <div style={{ width: '100%', height: '400px', background: '#eee', borderRadius: '8px', overflow: 'hidden' }}>
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={googleMapsUrl}
                    title="Lokasi Karyawan"
                ></iframe>
            </div>

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <a 
                    href={directLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-open-maps"
                >
                    📍 Buka di Google Maps App
                </a>
            </div>
        </div>

      </div>

      <style jsx>{`
        .modal-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999;
            display: flex; justify-content: center; align-items: center;
            padding: 20px;
            backdrop-filter: blur(2px);
        }
        .modal-card {
            background: white; width: 600px; max-width: 100%; border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden;
            animation: slideDown 0.3s ease;
        }
        @keyframes slideDown { from {transform: translateY(-20px); opacity: 0;} to {transform: translateY(0); opacity: 1;} }
        
        .modal-header {
            padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;
        }
        .modal-header h3 { margin: 0; font-size: 18px; color: #1e293b; }
        .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
        .close-btn:hover { color: #333; }
        .modal-body { padding: 20px; }
        .btn-open-maps {
            display: inline-block; background-color: #4285F4; color: white; text-decoration: none;
            padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; transition: background 0.2s;
        }
        .btn-open-maps:hover { background-color: #3367d6; }
      `}</style>
    </div>
  );
}