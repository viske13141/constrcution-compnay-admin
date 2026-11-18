import React, { useState } from 'react';
import { MapPin, Navigation, Radio, WifiOff } from 'lucide-react';
import { AttendanceRecord, ConstructionSite } from '@/src/types/erp';
import { cn } from '@/src/lib/utils';

interface SiteGeofenceMapProps {
  sites: ConstructionSite[];
  attendance?: AttendanceRecord[];
  selectedSiteId?: string;
  onSelectSite?: (siteId: string) => void;
  heightClass?: string;
}

export function SiteGeofenceMap({
  sites,
  attendance = [],
  selectedSiteId,
  onSelectSite,
  heightClass = 'h-72 sm:h-80',
}: SiteGeofenceMapProps) {
  const activeSite = sites.find((s) => s.id === selectedSiteId) || sites[0];
  const [showGeofence, setShowGeofence] = useState(true);

  if (!activeSite) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-xs text-[#64748B]">
        No site coordinates available for the selected filter.
      </div>
    );
  }

  const siteWorkers = attendance.filter((a) => a.siteId === activeSite.id);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      {/* Explicit Simulated Telemetry Disclaimer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-[#172B4D] font-medium">
          <Navigation className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>Simulated Site Geofence Map</span>
          <span className="text-[#64748B] font-normal">
            · Mock GPS {activeSite.mockGps.lat.toFixed(4)}°N, {activeSite.mockGps.lng.toFixed(4)}°E
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowGeofence((v) => !v)}
            className="text-xs font-medium text-[#2563EB] hover:underline cursor-pointer"
          >
            {showGeofence ? 'Hide' : 'Show'} Geofence ({activeSite.geofenceRadiusMeters}m)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Interactive Blueprint Grid Canvas */}
        <div className={cn('lg:col-span-8 relative bg-[#EEF2F7] overflow-hidden', heightClass)}>
          <svg
            viewBox="0 0 600 320"
            className="w-full h-full select-none"
            role="img"
            aria-label={`Simulated geofence map for ${activeSite.name}`}
          >
            {/* Technical CAD Grid */}
            <defs>
              <pattern id="siteGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#CBD5E1" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="600" height="320" fill="url(#siteGrid)" />

            {/* Mock Arterial Access Road */}
            <path d="M 0 250 Q 260 220 600 265" fill="none" stroke="#FFFFFF" strokeWidth="18" />
            <path d="M 0 250 Q 260 220 600 265" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="6 4" />

            {/* Mock Site Perimeter Polygon */}
            <polygon
              points="155,75 435,68 462,212 140,218"
              fill="#FFFFFF"
              fillOpacity="0.65"
              stroke="#64748B"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text x="166" y="96" fontSize="10" fill="#475569" fontFamily="JetBrains Mono, monospace">
              {activeSite.code} · PERMITTED WORK ZONE
            </text>

            {/* Geofence Boundary Circle */}
            {showGeofence && (
              <g>
                <circle
                  cx="300"
                  cy="145"
                  r="105"
                  fill="#2563EB"
                  fillOpacity="0.07"
                  stroke="#2563EB"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                <text x="300" y="34" textAnchor="middle" fontSize="10" fill="#2563EB" fontWeight="600">
                  Geofence Radius: {activeSite.geofenceRadiusMeters}m (Simulated)
                </text>
              </g>
            )}

            {/* Central Site Anchor */}
            <g transform="translate(300, 145)">
              <circle r="7" fill="#101F35" />
              <circle r="3" fill="#F59E0B" />
              <text y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="#172B4D">
                Site Gate & Muster Point
              </text>
            </g>

            {/* Worker Session Markers */}
            {siteWorkers.map((w) => {
              const cx = 120 + (w.mockCoordOffset.x / 100) * 360;
              const cy = 55 + (w.mockCoordOffset.y / 100) * 200;
              const isStale = w.trackingStatus === 'Stale (>15m)';
              const isOffline = w.trackingStatus === 'Offline Queued';
              const color = isStale ? '#DC2626' : isOffline ? '#D97706' : '#16A34A';

              return (
                <g key={w.id} transform={`translate(${cx}, ${cy})`}>
                  <circle r="11" fill={color} fillOpacity="0.18" />
                  <circle r="5" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
                  <text
                    y="-10"
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="600"
                    fill="#172B4D"
                  >
                    {w.employeeName.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Legend */}
          <div className="absolute bottom-2.5 left-2.5 flex flex-wrap items-center gap-3 bg-white/95 border border-slate-200 rounded-md px-2.5 py-1.5 text-[11px] text-[#172B4D]">
            <span className="inline-flex items-center gap-1">
              <Radio className="h-3 w-3 text-[#16A34A]" /> Live (5m interval)
            </span>
            <span className="inline-flex items-center gap-1">
              <WifiOff className="h-3 w-3 text-[#D97706]" /> Offline Queued
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#DC2626]" /> Stale / Outside Fence
            </span>
          </div>
        </div>

        {/* Site Selector & Telemetry Summary Sidebar */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {sites.map((site) => {
            const isSelected = site.id === activeSite.id;
            return (
              <button
                key={site.id}
                type="button"
                onClick={() => onSelectSite?.(site.id)}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 transition-colors cursor-pointer',
                  isSelected ? 'bg-[#2563EB]/5' : 'hover:bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('text-xs font-semibold truncate', isSelected ? 'text-[#2563EB]' : 'text-[#172B4D]')}>
                    {site.name}
                  </span>
                  <span className="text-[11px] font-mono text-[#64748B] shrink-0">
                    {site.presentToday}/{site.workforceCount}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-[#64748B] truncate">
                  {site.siteManagerName} · {site.lastLocationSync}
                </div>
                {site.alerts.length > 0 && (
                  <div className="mt-1 text-[11px] text-[#DC2626] truncate">
                    Alert: {site.alerts[0]}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
