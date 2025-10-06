"use client";
import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  location: [number, number];
  radius: number;
  setLocation: (loc: [number, number]) => void;
}

function LocationPicker({ setLocation }: { setLocation: (loc: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setLocation([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const LeafletMap: React.FC<Props> = ({ location, radius, setLocation }) => {
  return (
    <div className="h-64 w-full">
      <MapContainer
        center={location}
        zoom={13}
        className="h-full w-full rounded-md"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={location} />
        <Circle center={location} radius={radius} />
        <LocationPicker setLocation={setLocation} />
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
