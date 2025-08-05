"use client";

import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import { LatLngExpression } from "leaflet";

interface Props {
  location: LatLngExpression;
  radius: number;
  setLocation: (loc: LatLngExpression) => void;
}

function LocationPicker({ setLocation }: { setLocation: (loc: LatLngExpression) => void }) {
  useMapEvents({
    click(e) {
      setLocation([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function LeafletMap({ location, radius, setLocation }: Props) {
  return (
    <MapContainer center={location} zoom={15} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationPicker setLocation={setLocation} />
      <Marker position={location} />
      <Circle center={location} radius={radius} pathOptions={{ color: "red" }} />
    </MapContainer>
  );
}
