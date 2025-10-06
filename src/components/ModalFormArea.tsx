"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import L from "leaflet";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    name: string;
    alamat: string;
    radius: number;
    latitude: number;
    longitude: number;
  }) => void;
  initialData?: {
    id: string;
    name: string;
    alamat: string;
    radius: number;
    latitude: number;
    longitude: number;
  } | null;
}

const ModalFormArea: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [alamat, setAlamat] = useState("");
  const [radius, setRadius] = useState(100);
  const [location, setLocation] = useState<[number, number]>([-6.2, 106.816666]);

  // Initialize form data saat buka modal
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAlamat(initialData.alamat);
      setRadius(initialData.radius);
      setLocation([initialData.latitude, initialData.longitude]);
    } else {
      setName("");
      setAlamat("");
      setRadius(100);
      setLocation([-6.2, 106.816666]);
    }
  }, [initialData, isOpen]);

  // Setup Leaflet Map
  useEffect(() => {
    if (!isOpen) return;

    // hapus instance lama kalau ada
    if (L.DomUtil.get("map") !== null) {
      (L.DomUtil.get("map") as any)._leaflet_id = null;
    }

    const map = L.map("map").setView(location, 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const marker = L.marker(location, { draggable: true }).addTo(map);
    const circle = L.circle(location, { radius, color: "blue" }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      setLocation([pos.lat, pos.lng]);
      circle.setLatLng(pos);
    });

    // update radius circle kalau radius berubah
    circle.setRadius(radius);

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      map.remove();
    };
  }, [isOpen, radius, location]);

  const handleSubmit = () => {
    onSubmit({
      id: initialData?.id,
      name,
      alamat,
      radius,
      latitude: location[0],
      longitude: location[1],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Area" : "Tambah Area Baru"}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Ubah detail area yang sudah ada."
              : "Isi form untuk menambahkan area baru."}
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Input
            placeholder="Nama Area"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Alamat"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Radius (meter)"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />

          {/* Peta Leaflet */}
          <div
            id="map"
            style={{
              width: "100%",
              height: "300px",
              marginTop: "10px",
              border: "1px solid #ccc",
            }}
          ></div>

          <Button onClick={handleSubmit}>
            {initialData ? "Simpan Perubahan" : "Tambah Area"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalFormArea;
