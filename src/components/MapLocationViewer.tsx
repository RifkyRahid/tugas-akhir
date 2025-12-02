"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Icon Leaflet di Next.js
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function FitBounds({ markers }: { markers: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => L.latLng(m[0], m[1])));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, markers]);
    return null;
}

interface MapProps {
    userLat: number; userLng: number;
    areaLat: number; areaLng: number;
    areaName: string; userName: string;
}

export default function MapLocationViewer({ userLat, userLng, areaLat, areaLng, areaName, userName }: MapProps) {
    const userPos: [number, number] = [userLat, userLng];
    const areaPos: [number, number] = [areaLat, areaLng];
    const lineOptions = { color: 'red', dashArray: '5, 10' };

    return (
        <MapContainer center={areaPos} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            <Marker position={areaPos} icon={defaultIcon}>
                <Popup><strong>Kantor: {areaName}</strong></Popup>
            </Marker>

            <Marker position={userPos} icon={redIcon}>
                <Popup><strong>{userName}</strong><br/>Lokasi Absen</Popup>
            </Marker>

            <Polyline positions={[userPos, areaPos]} pathOptions={lineOptions} />
            <FitBounds markers={[userPos, areaPos]} />
        </MapContainer>
    );
}