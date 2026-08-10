// src/pages/MapPage.tsx — Public parking map (Visitor + authenticated users)
// Leaflet + OpenStreetMap base, KSU campus centred at 24.7246, 46.6183
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { zonesApi } from '@/api/zones';
import { useAuthStore } from '@/store/authStore';
import { getZoneColor, occupancyPct } from '@/utils/zoneColor';
import SimulatedDataBanner from '@/components/SimulatedDataBanner';
import Spinner from '@/components/Spinner';
import type { Zone } from '@/types';

// Fix Leaflet default icon paths in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const KSU_CENTER: L.LatLngTuple = [24.7246, 46.6183];
const ZOOM = 15;

function toLatLng(coords: number[][]): L.LatLngTuple[] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

export default function MapPage() {
  const { user } = useAuthStore();
  const mapRef    = useRef<L.Map | null>(null);
  const mapElRef  = useRef<HTMLDivElement>(null);
  const layerRef  = useRef<L.LayerGroup | null>(null);

  // Public endpoint for visitors; authenticated for logged-in users
  const { data, isLoading } = useQuery({
    queryKey: ['zones-map', !!user],
    queryFn:  () => user ? zonesApi.getAll().then(r => r.data.data) : zonesApi.getPublic().then(r => r.data.data),
    refetchInterval: 30_000,
  });

  // Init map once
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current, { center: KSU_CENTER, zoom: ZOOM });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current  = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Re-render zone polygons when data changes
  useEffect(() => {
    if (!mapRef.current || !layerRef.current || !data) return;
    layerRef.current.clearLayers();

    (data as Zone[]).forEach(zone => {
      const raw = zone.coordinates as { type: string; coordinates: number[][][] };
      if (!raw?.coordinates?.[0]) return;
      const latlngs = toLatLng(raw.coordinates[0]);
      const occ   = zone.occupied ?? 0;
      const total = zone.totalSpaces ?? 500;
      const { color, borderColor } = getZoneColor(occ, total);
      const pct = occupancyPct(occ, total);
      const avail = zone.available ?? (total - occ);

      const polygon = L.polygon(latlngs, {
        color: borderColor, fillColor: color, fillOpacity: 0.45, weight: 2,
      });

      const popup = L.popup({ maxWidth: 260 }).setContent(`
        <div style="font-family:system-ui,sans-serif;font-size:13px;line-height:1.5">
          <div style="font-weight:600;margin-bottom:4px">${zone.name} (${zone.code})</div>
          <div style="color:#555;font-size:11px;margin-bottom:6px">${zone.description ?? ''}</div>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="color:#666">Total spaces</td><td style="text-align:right;font-weight:500">${total}</td></tr>
            <tr><td style="color:#666">Occupied</td><td style="text-align:right;font-weight:500">${occ}</td></tr>
            <tr><td style="color:#666">Available</td><td style="text-align:right;font-weight:500;color:#16a34a">${avail}</td></tr>
            <tr><td style="color:#666">Occupancy</td><td style="text-align:right;font-weight:600;color:${pct > 85 ? '#dc2626' : pct > 60 ? '#d97706' : '#16a34a'}">${pct}%</td></tr>
          </table>
          <div style="margin-top:8px;font-size:11px;color:#888;font-style:italic">
            Simulated MVP data — not official KSU parking data
          </div>
        </div>
      `);

      polygon.bindPopup(popup);
      polygon.addTo(layerRef.current!);
    });
  }, [data]);

  return (
    <div className="flex flex-col h-full">
      <SimulatedDataBanner />
      <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">KSU Campus Parking Map</span>
        <span className="text-gray-400 text-xs">Click a zone to see availability</span>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-white border-b border-gray-100 flex items-center gap-4 text-xs text-gray-600">
        <span className="font-medium text-gray-500">Availability:</span>
        {[['#22c55e','Available (≤60%)'],['#f59e0b','Limited (61–85%)'],['#ef4444','Full (>85%)']].map(([c,l]) => (
          <span key={c} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>

      <div className="relative flex-1" style={{ minHeight: 480 }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <Spinner />
          </div>
        )}
        <div ref={mapElRef} className="w-full h-full" style={{ minHeight: 480 }} />
      </div>
    </div>
  );
}
