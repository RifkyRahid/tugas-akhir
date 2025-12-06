"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Swal from "sweetalert2";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoData: string, location: GeolocationPosition | null) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State Kamera
  const [isMirrored, setIsMirrored] = useState(false); // Default false (Tidak Mirror/Tulisan Terbaca)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user"); // user = depan, environment = belakang

  // Mulai Kamera saat modal dibuka atau facingMode berubah
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    // Stop stream lama jika ada
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: facingMode,
            width: { ideal: 1280 }, // Coba resolusi HD jika bisa
            height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      Swal.fire("Error", "Gagal mengakses kamera. Pastikan izin diberikan.", "error");
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set ukuran canvas sesuai ukuran video asli
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (ctx) {
        // LOGIKA MIRROR UNTUK HASIL FOTO
        if (isMirrored) {
            // Jika mode mirror aktif, kita balik canvas-nya juga
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Kembalikan transformasi (reset)
        if (isMirrored) {
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
        }
    }

    const photoData = canvas.toDataURL("image/png"); // Kualitas tinggi

    // Ambil lokasi
    try {
      const location = await getLocation();
      onCapture(photoData, location);
      // Close dipanggil di parent (handleCaptureComplete) setelah sukses/gagal
    } catch (err) {
      console.error("Failed to get location:", err);
      Swal.fire({
          icon: 'warning',
          title: 'Lokasi Gagal',
          text: 'Tidak bisa mengambil lokasi GPS. Pastikan GPS aktif.',
          showCancelButton: true,
          confirmButtonText: 'Tetap Kirim Tanpa Lokasi',
          cancelButtonText: 'Batal'
      }).then((result) => {
          if (result.isConfirmed) {
              onCapture(photoData, null);
          } else {
              setLoading(false);
          }
      });
    }
  };

  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, // Paksa GPS akurasi tinggi
          timeout: 10000,
          maximumAge: 0
      });
    });
  };

  const switchCamera = () => {
      setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 style={{marginBottom: '10px'}}>Ambil Foto Absen</h3>
        
        <div className="video-container">
            {/* Hidden Canvas untuk processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                style={{ 
                    width: "100%", 
                    borderRadius: "10px", 
                    backgroundColor: '#000',
                    // CSS Transform untuk Preview
                    transform: isMirrored ? "scaleX(-1)" : "none" 
                }} 
            />
            
            {/* Tombol Kontrol di atas Video */}
            <div className="camera-controls">
                <button 
                    onClick={switchCamera} 
                    className="control-btn"
                    title="Ganti Kamera Depan/Belakang"
                >
                    🔄 Switch
                </button>
                <button 
                    onClick={() => setIsMirrored(!isMirrored)} 
                    className={`control-btn ${isMirrored ? 'active' : ''}`}
                    title="Aktifkan/Matikan Mirror"
                >
                    🪞 {isMirrored ? "Mirrored" : "Normal"}
                </button>
            </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={handleCapture} 
            disabled={loading}
            className="capture-btn"
          >
            {loading ? "Memproses..." : "📸 Ambil Foto"}
          </button>
          <button 
            onClick={onClose} 
            className="cancel-btn"
            disabled={loading}
          >
            Batal
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          padding: 20px;
        }
        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          width: 500px;
          max-width: 100%;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          text-align: center;
        }
        .video-container {
            position: relative;
            overflow: hidden;
            border-radius: 10px;
            background: #000;
            margin-bottom: 15px;
        }
        .camera-controls {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 8px;
            z-index: 10;
        }
        .control-btn {
            background: rgba(0,0,0,0.5);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
            backdrop-filter: blur(4px);
        }
        .control-btn.active {
            background: rgba(59, 130, 246, 0.8); /* Biru jika aktif */
            border-color: #3b82f6;
        }
        .action-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .capture-btn {
          padding: 12px 24px;
          background: #22c55e;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
          flex: 1;
        }
        .capture-btn:disabled {
            background: #86efac;
            cursor: not-allowed;
        }
        .cancel-btn {
          padding: 12px 20px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        .cancel-btn:hover { background: #dc2626; }
      `}</style>
    </div>
  );
};

export default CameraModal;