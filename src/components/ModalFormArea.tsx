"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LeafletMap from "./LeafletMap";

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
  }, [initialData]);

  useEffect(() => {
    console.log("[ModalFormArea] mount, props:", { location, radius });
  }, []);

  useEffect(() => {
    console.log("[ModalFormArea] location changed:", location);
  }, [location]);

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
        <div style={{ maxWidth: "800px", width: "100%" }}>
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Edit Area" : "Tambah Area Baru"}
            </DialogTitle>
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

            {/* Map untuk pilih lokasi */}
            <div style={{ height: "400px", border: "1px solid #ddd" }}>
              <LeafletMap
                location={location}
                radius={radius}
                setLocation={(loc) => setLocation(loc)}
              />
            </div>

            <Button onClick={handleSubmit}>
              {initialData ? "Simpan Perubahan" : "Tambah Area"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalFormArea;
