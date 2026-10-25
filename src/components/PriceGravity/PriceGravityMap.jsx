import React, { useState, useMemo } from 'react';
import { MapPin, Info, Layers, Compass, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function PriceGravityMap({ locations = [], overallAvgRate = 0, selectedLocation, onSelectLocation }) {
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Determine if actual coordinates exist in dataset
  const hasCoordinates = useMemo(() => {
    return locations.some(loc => loc.lat && loc.lng);
  }, [locations]);

  // Compute map bounds or dynamic grid positions
  const mappedNodes = useMemo(() => {
    if (locations.length === 0) return [];

    if (hasCoordinates) {
      const validCoords = locations.filter(l => l.lat && l.lng);
      const lats = validCoords.map(l => l.lat);
      const lngs = validCoords.map(l => l.lng);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const latDiff = maxLat - minLat || 0.01;
      const lngDiff = maxLng - minLng || 0.01;

      return locations.map(loc => {
        let x = 50;
        let y = 50;
        if (loc.lat && loc.lng) {
          // Normalize lat/lng to 10% - 90% margin padding
          x = 12 + ((loc.lng - minLng) / lngDiff) * 76;
          // Invert y because SVG y goes down
          y = 88 - ((loc.lat - minLat) / latDiff) * 76;
        }
        return { ...loc, x, y };
      });
    } else {
      // Deterministically space locations on a natural spatial grid layout
      const count = locations.length;
      const cols = Math.ceil(Math.sqrt(count * 1.5));
      const rows = Math.ceil(count / cols);

      return locations.map((loc, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);

        // Add small deterministic jitter using char codes so nodes don't look rigid
        let charHash = 0;
        for (let i = 0; i < loc.name.length; i++) {
          charHash += loc.name.charCodeAt(i);
        }
        const jitterX = ((charHash % 17) - 8) * 0.8;
        const jitterY = (((charHash * 3) % 19) - 9) * 0.8;

        const x = 15 + (col / (Math.max(cols - 1, 1))) * 70 + jitterX;
        const y = 18 + (row / (Math.max(rows - 1, 1))) * 64 + jitterY;

        return { ...loc, x: Math.min(Math.max(x, 8), 92), y: Math.min(Math.max(y, 10), 90) };
      });
    }
  }, [locations, hasCoordinates]);

  // Active highlighted card (either hovered or selected)
  const activeTooltip = hoveredLocation || locations.find(l => l.name === selectedLocation);

  return (
    <div className="relative w-full h-[450px] md:h-[520px] rounded-3xl bg-slate-950 border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between group">
      
      {/* Map Header & Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-slate-900/90 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
            {hasCoordinates ? "GPS Coordinate Plot" : "Dynamic Spatial Topology Map"}
          </span>
          <span className="text-[10px] text-slate-400 border-l border-white/10 pl-2 font-mono">
            {locations.length} Dataset Zones
          </span>
        </div>

        {/* Legend Indicator */}
        <div className="hidden sm:flex items-center gap-4 bg-slate-900/90 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md pointer-events-auto text-[10px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span>High Rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span>Avg Rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Lower Rate</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map Surface */}
      <div 
        className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Dynamic Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Dynamic Topological Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {mappedNodes.map((node, i) => {
            // Draw faint lines to 2 nearest spatial neighbors
            const neighbors = mappedNodes
              .map((n, idx) => ({ idx, dist: Math.hypot(n.x - node.x, n.y - node.y) }))
              .filter(n => n.idx !== i)
              .sort((a, b) => a.dist - b.dist)
              .slice(0, 2);

            return neighbors.map(n => {
              const target = mappedNodes[n.idx];
              return (
                <line
                  key={`${i}-${n.idx}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke="rgba(99, 102, 241, 0.12)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              );
            });
          })}
        </svg>

        {/* Location Markers */}
        {mappedNodes.map((node) => {
          const isSelected = node.name === selectedLocation;
          const isHovered = hoveredLocation?.name === node.name;

          // Compute size and intensity based on price level
          // diffPercent >= +15%: High Intensity (Large, Glowing Pulsing Emerald)
          // diffPercent <= -15%: Low Intensity (Small Slate/Tea Node)
          // Otherwise Medium (Cyan/Indigo)
          let sizeClasses = "w-4 h-4";
          let colorClasses = "bg-indigo-500 border-indigo-300 shadow-indigo-500/50";
          let pulseColor = "bg-indigo-400";
          let ringScale = "w-8 h-8";

          if (node.impactClass === 'High') {
            sizeClasses = "w-6 h-6";
            colorClasses = "bg-emerald-400 border-white shadow-[0_0_20px_#10b981]";
            pulseColor = "bg-emerald-400";
            ringScale = "w-12 h-12";
          } else if (node.impactClass === 'Low') {
            sizeClasses = "w-3.5 h-3.5";
            colorClasses = "bg-slate-500 border-slate-300 shadow-slate-500/30";
            pulseColor = "bg-slate-400";
            ringScale = "w-6 h-6";
          }

          if (isSelected) {
            colorClasses += " ring-4 ring-amber-400/80 scale-125 z-30";
          }

          return (
            <div
              key={node.name}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setHoveredLocation(node)}
              onMouseLeave={() => setHoveredLocation(null)}
              onClick={() => onSelectLocation(node.name)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform duration-200 hover:scale-130 ${
                isSelected ? 'z-30' : ''
              }`}
            >
              {/* Outer Pulsing Intensity Ring */}
              <span className={`absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full animate-ping opacity-40 ${ringScale} ${pulseColor}`} />

              {/* Marker Core */}
              <span className={`block rounded-full border-2 transition-all ${sizeClasses} ${colorClasses}`} />

              {/* Marker Label */}
              <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-md transition-all ${
                isSelected 
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-lg z-30' 
                  : 'bg-slate-950/80 text-slate-300 border border-white/10 group-hover:opacity-100'
              }`}>
                {node.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating Interactive Tooltip / Card (Requirement 8) */}
      {activeTooltip && (
        <div className="absolute bottom-4 left-4 z-30 bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl max-w-xs w-full animate-fade-in pointer-events-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-white truncate">{activeTooltip.name}</span>
            </div>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
              activeTooltip.impactClass === 'High' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              activeTooltip.impactClass === 'Low' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}>
              {activeTooltip.impactClass} Impact
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <div className="text-[9px] text-slate-400 font-sans uppercase">Avg Price/sqft</div>
              <div className="text-emerald-400 font-bold mt-0.5">
                ₹{activeTooltip.avgRate.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <div className="text-[9px] text-slate-400 font-sans uppercase">Median / sqft</div>
              <div className="text-slate-200 font-bold mt-0.5">
                ₹{activeTooltip.medianRate.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5 text-[10px] font-mono">
            <span className="text-slate-400">{activeTooltip.count} properties in dataset</span>
            <span className={`font-bold ${activeTooltip.diffPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              vs Avg: {activeTooltip.diffPercent >= 0 ? `+${activeTooltip.diffPercent.toFixed(1)}%` : `${activeTooltip.diffPercent.toFixed(1)}%`}
            </span>
          </div>
        </div>
      )}

      {/* Map Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2))}
          className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-lg"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-lg"
          title="Reset Zoom"
        >
          <Maximize2 size={13} />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
          className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
      </div>

    </div>
  );
}
