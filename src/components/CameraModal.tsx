"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const [isMirrored, setIsMirrored] = useState(false); 
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user"); 

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: { 
            facingMode: facingMode,
            // Kita minta resolusi 4:3 agar sesuai dengan container kita nanti
            width: { ideal: 1280 }, 
            height: { ideal: 960 }, // 1280x960 adalah 4:3
        } 
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
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

    if (video.videoWidth === 0 || video.videoHeight === 0) {
        setLoading(false); return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (ctx) {
        if (isMirrored) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0); 
    }

    const photoData = canvas.toDataURL("image/png", 0.9); 

    try {
      const location = await getLocation();
      onCapture(photoData, location);
    } catch (err) {
      console.error("Failed to get location:", err);
      setLoading(false);
      Swal.fire({
          icon: 'warning',
          title: 'Gagal Mendapat Lokasi',
          text: 'Pastikan GPS aktif dan izin lokasi diberikan browser.',
          showCancelButton: true,
          confirmButtonText: 'Coba Lagi',
          cancelButtonText: 'Batal Absen',
          reverseButtons: true
      }).then((result) => {
          if (result.isConfirmed) {
              handleCapture(); 
          }
      });
    }
  };

  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported")); return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 15000, maximumAge: 0
      });
    });
  };

  const switchCamera = () => {
      setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
      if (facingMode === 'user') setIsMirrored(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
            <h3>Ambil Foto Absen</h3>
        </div>
        
        {/* PERBAIKAN DISINI: Wrapper dipaksa rasio 4:3 */}
        <div className="video-wrapper">
            <div className="video-container">
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: 'contain', // Pastikan seluruh video masuk dalam kotak 4:3
                        backgroundColor: '#000',
                        transform: isMirrored ? "scaleX(-1)" : "none" 
                    }} 
                />
                
                <div className="camera-controls">
                    <button onClick={switchCamera} className="control-btn" type="button">
                        🔄 Switch
                    </button>
                    <button onClick={() => setIsMirrored(!isMirrored)} className={`control-btn ${isMirrored ? 'active' : ''}`} type="button">
                        🪞 {isMirrored ? "Mirrored" : "Normal"}
                    </button>
                </div>
            </div>
        </div>

        <div className="action-buttons">
          <button onClick={handleCapture} disabled={loading} className="capture-btn" type="button">
            {loading ? "Memproses..." : "📸 Ambil Foto"}
          </button>
          <button onClick={onClose} className="cancel-btn" disabled={loading} type="button">
            Batal
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center; /* Center vertikal */
          z-index: 9999;
          padding: 20px; /* Padding luar aman */
        }

        .modal-content {
          background: #fff;
          border-radius: 16px;
          width: 100%; 
          max-width: 450px; /* Sedikit lebih ramping */
          /* HAPUS height/max-height fleksibel sebelumnya. */
          /* Biarkan modal menyesuaikan tinggi kontennya sendiri. */
          
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .modal-header {
            padding: 15px;
            text-align: center;
            background: #fff;
        }
        .modal-header h3 { margin: 0; font-size: 1.1rem; color: #333; }

        /* --- INI SOLUSI UTAMANYA --- */
        .video-wrapper {
            width: 100%;
            /* Paksa rasio aspek 4:3 (Landscape standar foto).
               Tingginya akan selalu 75% dari lebarnya. 
               Ini menjamin dia tidak akan pernah terlalu tinggi di layar HP portrait. */
            aspect-ratio: 4 / 3; 
            background: #000;
            position: relative;
            /* Flex-grow dihapus agar tidak menekan ke bawah */
        }
        
        .video-container {
            width: 100%;
            height: 100%; /* Mengisi wrapper 4:3 */
            position: relative;
        }

        .camera-controls {
            position: absolute;
            top: 10px; right: 10px;
            display: flex; gap: 8px; z-index: 10;
        }
        .control-btn {
            background: rgba(0,0,0,0.6); color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 5px 10px; border-radius: 20px;
            font-size: 11px; cursor: pointer; backdrop-filter: blur(4px);
        }
        .control-btn.active { background: rgba(59, 130, 246, 0.9); border-color: #3b82f6; }

        .action-buttons {
            padding: 15px;
            display: flex; gap: 10px;
            background: #fff;
            border-top: 1px solid #eee;
        }
        .capture-btn {
          padding: 12px;
          background: #22c55e; color: white;
          border: none; border-radius: 10px;
          cursor: pointer; font-weight: 600; font-size: 16px;
          flex: 2; display: flex; align-items: center; justify-content: center;
        }
        .capture-btn:disabled { background: #86efac; cursor: not-allowed; opacity: 0.7; }
        .cancel-btn {
          padding: 12px; background: #ef4444; color: white;
          border: none; border-radius: 10px;
          cursor: pointer; font-weight: 600; flex: 1;
        }
      `}</style>
    </div>
  );
};

export default CameraModal;