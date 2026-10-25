import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, Check } from 'lucide-react';

export default function LocationSelector({ locations = [], selectedLocation, onSelectLocation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedData = locations.find(loc => loc.name === selectedLocation);

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <MapPin size={13} className="text-emerald-400" />
        <span>Select Location from Dataset</span>
      </label>

      {/* Main Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900/90 hover:bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl px-4 py-3 text-left flex items-center justify-between text-slate-200 transition-all shadow-lg group cursor-pointer"
      >
        <div className="flex items-center gap-3 truncate">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            📍
          </div>
          <div className="truncate">
            <div className="text-sm font-bold text-white truncate">
              {selectedLocation || 'Choose a location...'}
            </div>
            {selectedData && (
              <div className="text-[10px] text-slate-400 font-mono">
                {selectedData.count} properties • ₹{selectedData.avgRate.toLocaleString('en-IN')}/sq.ft.
              </div>
            )}
          </div>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-fade-in max-h-80 flex flex-col">
          {/* Search Header */}
          <div className="p-3 border-b border-white/10 bg-slate-900/50">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
          </div>

          {/* Location List */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => {
                const isSelected = loc.name === selectedLocation;
                return (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => {
                      onSelectLocation(loc.name);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                        : 'hover:bg-white/5 text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-semibold truncate">{loc.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ₹{loc.avgRate.toLocaleString('en-IN')}/sq.ft. • {loc.count} listings
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        loc.diffPercent >= 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {loc.diffPercent >= 0 ? `+${loc.diffPercent.toFixed(1)}%` : `${loc.diffPercent.toFixed(1)}%`}
                      </span>
                      {isSelected && <Check size={14} className="text-emerald-400" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching locations found in dataset.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
