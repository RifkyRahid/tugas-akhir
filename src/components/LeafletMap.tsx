"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvent } from "react-leaflet";
// Komponen untuk handle klik pada peta
const MapClickHandler = ({ setLocation }: { setLocation: (loc: [number, number]) => void }) => {
  useMapEvent("click", (e) => {
    setLocation([e.latlng.lat, e.latlng.lng]);
  });
  return null;
};
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LeafletEvent } from "leaflet";

interface Props {
  location: [number, number];
  radius: number;
  setLocation: (loc: [number, number]) => void;
}

// Komponen untuk update posisi map ketika lokasi berubah
const RecenterMap = ({ location }: { location: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(location, map.getZoom());
  }, [location, map]);
  return null;
};

const LeafletMap: React.FC<Props> = ({ location, radius, setLocation }) => {
  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  useEffect(() => {
    console.log("[LeafletMap] mount, props:", { location, radius, setLocation });
  }, []);

  useEffect(() => {
    console.log("[LeafletMap] location changed:", location);
  }, [location]);

  // Event saat marker di-drag
  const handleMarkerDrag = (e: LeafletEvent) => {
    // @ts-ignore
    const { lat, lng } = e.target.getLatLng();
    console.log("[LeafletMap] marker dragged:", { lat, lng });
    setLocation([lat, lng]);
  };


  return (
    <MapContainer
      center={location}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={location}
        icon={markerIcon}
        draggable={true}
        eventHandlers={{
          dragend: handleMarkerDrag,
        }}
      />
      <Circle center={location} radius={radius} color="blue" />
      <RecenterMap location={location} />
      <MapClickHandler setLocation={setLocation} />
    </MapContainer>
  );
};

export default LeafletMap;
