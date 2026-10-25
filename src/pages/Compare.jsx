import React, { useState, useMemo } from 'react';
import { MOCK_PROPERTIES } from '../services/mockData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Scale, Plus, Minus, Info, ArrowLeftRight, HelpCircle, Sparkles, Home, MapPin, IndianRupee, Trash2
} from 'lucide-react';

export default function Compare({ uploadedDataset = [], onNavigate }) {
  const customDataset = Array.isArray(uploadedDataset) ? uploadedDataset : [];
  
  // Combine custom uploads and default mock properties for comparison pool
  const allProperties = useMemo(() => {
    const customWithLabels = customDataset.map(p => ({
      ...p,
      displayName: `[Upload] Prop ${p.id} — ${p.area} sqft, ${p.location}`,
      isCustom: true
    }));
    const mockWithLabels = MOCK_PROPERTIES.map(p => ({
      ...p,
      displayName: `[Database] Prop ${p.id} — ${p.area} sqft, ${p.location}`,
      isCustom: false
    }));
    return [...customWithLabels, ...mockWithLabels];
  }, [customDataset]);

  // Selected properties indices or items state (up to 3 slots)
  const [selectedSlots, setSelectedSlots] = useState([null, null, null]);

  const handleSelectProperty = (slotIdx, propId) => {
    if (!propId) {
      // Clear slot
      const next = [...selectedSlots];
      next[slotIdx] = null;
      setSelectedSlots(next);
      return;
    }
    const prop = allProperties.find(p => p.id.toString() === propId.toString());
    if (prop) {
      const next = [...selectedSlots];
      next[slotIdx] = prop;
      setSelectedSlots(next);
    }
  };

  const handleClearSlot = (slotIdx) => {
    const next = [...selectedSlots];
    next[slotIdx] = null;
    setSelectedSlots(next);
  };

  // Check if we have at least one property selected
  const activeSelections = selectedSlots.filter(s => s !== null);

  // Chart data comparing selected properties
  const chartData = useMemo(() => {
    return activeSelections.map(p => ({
      name: `Prop ${p.id}`,
      Price: p.price,
      Area: p.area,
      Rate: Math.round((p.price * 100000) / p.area)
    }));
  }, [activeSelections]);

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Scale className="text-indigo-400" size={24} />
            <span>Compare Properties</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Select and compare specs, values, and features of up to 3 properties side-by-side.
          </p>
        </div>
        {onNavigate && (
          <button 
            onClick={() => onNavigate('predict')}
            className="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles size={13} />
            Evaluate New Property
          </button>
        )}
      </div>

      {/* Selector Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((slotIdx) => {
          const selected = selectedSlots[slotIdx];
          return (
            <div 
              key={slotIdx} 
              className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[160px] ${
                selected 
                  ? 'border-indigo-500/30 bg-indigo-950/5' 
                  : 'border-white/5 bg-slate-950/10 hover:border-white/10'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Property Slot {slotIdx + 1}</span>
                  {selected && (
                    <button 
                      onClick={() => handleClearSlot(slotIdx)}
                      className="p-1 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Clear slot"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <select
                  value={selected ? selected.id.toString() : ""}
                  onChange={(e) => handleSelectProperty(slotIdx, e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold glass-input focus:outline-none"
                >
                  <option value="">-- Choose Property --</option>
                  
                  {customDataset.length > 0 && (
                    <optgroup label="Uploaded Custom Properties">
                      {customDataset.map(p => (
                        <option key={`c-${p.id}`} value={p.id.toString()}>
                          U-{p.id} — {p.area} sqft, {p.location} ({p.type})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  <optgroup label="Database Mock Registry">
                    {MOCK_PROPERTIES.slice(0, 40).map(p => (
                      <option key={`m-${p.id}`} value={p.id.toString()}>
                        DB-{p.id} — {p.area} sqft, {p.location} ({p.type})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {selected ? (
                <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Est. Price:</span>
                    <span className="font-mono font-bold text-emerald-400">₹{selected.price} Lakhs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span className="font-mono font-medium text-slate-300">₹{Math.round((selected.price * 100000) / selected.area).toLocaleString()}/sqft</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="text-slate-300">{selected.type}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 text-center border-t border-white/5 border-dashed">
                  <p className="text-[11px] text-slate-500 italic">Slot empty. Select a property above to compare metrics.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeSelections.length > 0 ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Specs Table */}
          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2 bg-slate-950/15">
              <ArrowLeftRight size={16} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Specifications Checklist</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 text-slate-400 font-bold uppercase border-b border-white/5">
                    <th className="px-6 py-3.5">Parameter</th>
                    {selectedSlots.map((selected, slotIdx) => (
                      <th key={slotIdx} className="px-6 py-3.5 w-1/4">
                        {selected ? (
                          <div className="flex flex-col">
                            <span className="text-white font-bold">{selected.isCustom ? 'Uploaded' : 'Database'} Prop {selected.id}</span>
                            <span className="text-[10px] text-slate-500 font-medium tracking-normal mt-0.5 normal-case">{selected.location}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-medium">Slot {slotIdx + 1} Empty</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {/* Estimated Price */}
                  <tr className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-400">Estimated Price</td>
                    {selectedSlots.map((s, idx) => (
                      <td key={idx} className="px-6 py-3 font-mono font-bold text-emerald-400">
                        {s ? `₹${s.price} Lakhs` : '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Price per Sq.Ft. */}
                  <tr className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-400">Price / Sq.Ft.</td>
                    {selectedSlots.map((s, idx) => (
                      <td key={idx} className="px-6 py-3 font-mono">
                        {s ? `₹${Math.round((s.price * 100000) / s.area).toLocaleString()}` : '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Total Area */}
                  <tr className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-400">Property Area</td>
                    {selectedSlots.map((s, idx) => (
                      <td key={idx} className="px-6 py-3 font-mono">
                        {s ? `${s.area} sqft` : '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Bedrooms */}
                  <tr className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-400">Bedrooms Configuration</td>
                    {selectedSlots.map((s, idx) => (
                      <td key={idx} className="px-6 py-3">
                        {s ? `${s.bedrooms} BHK` : '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Bathrooms */}
                  <tr className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-400">Bathrooms</td>
                    {selectedSlots.map((s, idx) => (
                      <td key={idx} className="px-6 py-3">
                        {s ? `${s.bathrooms} Bath` : '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Age */}
                  <tr className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-400">Property Age</td>
                    {selectedSlots.map((s, idx) => (
                      <td key={idx} className="px-6 py-3">
                        {s ? `${s.age} Years` : '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Property Type */}
                  <tr className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-400">Property Type</td>
                    {selectedSlots.map((s, idx) => (
                      <td key={idx} className="px-6 py-3">
                        {s ? s.type : '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Furnishing */}
                  <tr className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-400">Furnishing</td>
                    {selectedSlots.map((s, idx) => (
                      <td key={idx} className="px-6 py-3">
                        {s ? s.furnishing : '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Floor Level */}
                  <tr className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-400">Floor Index</td>
                    {selectedSlots.map((s, idx) => (
                      <td key={idx} className="px-6 py-3">
                        {s ? `${s.floors}th Floor` : '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Distance from Center */}
                  <tr className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-400">Distance to MG Road</td>
                    {selectedSlots.map((s, idx) => (
                      <td key={idx} className="px-6 py-3">
                        {s ? `${s.distanceFromCenter} km` : '-'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Panel */}
          {activeSelections.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {/* Price comparison */}
              <div className="glass-panel p-5 rounded-xl border border-white/5">
                <h3 className="text-xs font-bold text-slate-200 mb-4 uppercase tracking-wider">Price Comparison (₹ Lakhs)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="name" stroke="#666" fontSize={11} />
                      <YAxis stroke="#666" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f0f13', borderColor: 'rgba(255,255,255,0.08)' }}
                        itemStyle={{ color: '#10b981', fontSize: '12px' }}
                      />
                      <Bar dataKey="Price" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Area comparison */}
              <div className="glass-panel p-5 rounded-xl border border-white/5">
                <h3 className="text-xs font-bold text-slate-200 mb-4 uppercase tracking-wider">Built-up Area (Sq.Ft.)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="name" stroke="#666" fontSize={11} />
                      <YAxis stroke="#666" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f0f13', borderColor: 'rgba(255,255,255,0.08)' }}
                        itemStyle={{ color: '#6366f1', fontSize: '12px' }}
                      />
                      <Bar dataKey="Area" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center h-80 bg-slate-950/10">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
            <Scale size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-200">Awaiting Property Selection</h4>
          <p className="text-xs text-slate-500 max-w-[280px] mt-2 leading-relaxed">
            Select properties in the slots above to display the side-by-side specification table and comparison charts.
          </p>
        </div>
      )}

    </div>
  );
}
