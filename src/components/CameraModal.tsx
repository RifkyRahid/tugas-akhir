"use client";

import React, { useEffect, useRef, useState } from "react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoData: string, location: GeolocationPosition | null) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    setLoading(true);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL("image/png");

    // Ambil lokasi
    try {
      const location = await getLocation();
      onCapture(photoData, location);
      onClose();
    } catch (err) {
      console.error("Failed to get location:", err);
      onCapture(photoData, null); // kalau gagal tetap kirim foto
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: "10px" }} />
        <div style={{ marginTop: "10px" }}>
          <button onClick={handleCapture} disabled={loading}>
            {loading ? "Processing..." : "Capture & Submit"}
          </button>
          <button onClick={onClose} style={{ marginLeft: "10px" }}>Cancel</button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }
        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          text-align: center;
        }
        button {
          padding: 10px 20px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background: #005bb5;
        }
      `}</style>
    </div>
  );
};

export default CameraModal;
