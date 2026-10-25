import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { apiService } from '../services/api';
import { NEIGHBORHOOD_CONFIGS } from '../services/mockData';
import { MapPin, SlidersHorizontal, Info, Compass } from 'lucide-react';
import PropertyPriceInsights from '../components/PropertyPriceInsights';

// Fix default leaflet marker icon resolution in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function SpatialAnalysis({ uploadedDataset }) {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: 'any',
    type: 'any',
    location: 'any'
  });
  const [loading, setLoading] = useState(true);

  const dataset = Array.isArray(uploadedDataset) ? uploadedDataset : [];
  const isCustomModel = dataset.length > 0;

  const options = useMemo(() => {
    if (!isCustomModel) {
      return {
        bedrooms: [1, 2, 3, 4],
        types: ["Apartment", "Villa", "Penthouse", "Independent House"],
        locations: Object.keys(NEIGHBORHOOD_CONFIGS),
        neighborhoodConfigs: NEIGHBORHOOD_CONFIGS
      };
    }

    const bedroomsSet = new Set();
    const typesSet = new Set();
    const locationsSet = new Set();
    const neighborhoodConfigs = {};

    for (let i = 0; i < dataset.length; i++) {
      const row = dataset[i];
      if (typeof row.bedrooms === 'number' && !isNaN(row.bedrooms)) {
        bedroomsSet.add(row.bedrooms);
      }
      if (typeof row.type === 'string' && row.type.trim() !== '') {
        typesSet.add(row.type);
      }
      const loc = row.location;
      if (typeof loc === 'string' && loc.trim() !== '') {
        locationsSet.add(loc);
        if (!neighborhoodConfigs[loc]) {
          neighborhoodConfigs[loc] = { latSum: 0, latCount: 0, lngSum: 0, lngCount: 0, distSum: 0, distCount: 0 };
        }
        const cfg = neighborhoodConfigs[loc];
        if (row.latitude) {
          cfg.latSum += row.latitude;
          cfg.latCount++;
        }
        if (row.longitude) {
          cfg.lngSum += row.longitude;
          cfg.lngCount++;
        }
        if (row.distanceFromCenter) {
          cfg.distSum += row.distanceFromCenter;
          cfg.distCount++;
        }
      }
    }

    const bedrooms = Array.from(bedroomsSet).sort((a, b) => a - b);
    const types = Array.from(typesSet).sort();
    const locations = Array.from(locationsSet).sort();

    Object.keys(neighborhoodConfigs).forEach(loc => {
      const cfg = neighborhoodConfigs[loc];
      const avgLat = cfg.latCount ? (cfg.latSum / cfg.latCount) : 12.9784;
      const avgLng = cfg.lngCount ? (cfg.lngSum / cfg.lngCount) : 77.6408;
      const avgDist = cfg.distCount ? (cfg.distSum / cfg.distCount) : 5.0;
      neighborhoodConfigs[loc] = {
        lat: parseFloat(avgLat.toFixed(5)),
        lng: parseFloat(avgLng.toFixed(5)),
        distance: parseFloat(avgDist.toFixed(2))
      };
    });

    return {
      bedrooms,
      types,
      locations,
      neighborhoodConfigs
    };
  }, [dataset, isCustomModel]);

  const fetchSpatialData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSpatialData(filters, uploadedDataset);
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpatialData();
  }, [filters, uploadedDataset]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Color picker helper representing price intensity
  const getMarkerColor = (price) => {
    if (price > 120) return '#ec4899'; // Hot pink for luxury
    if (price > 90) return '#d946ef';  // Fuchsia
    if (price > 60) return '#10b981';  // Emerald
    if (price > 45) return '#06b6d4';  // Cyan
    return '#22c55e';                  // Green for affordable
  };

  // Compute location statistics from current properties list (Memoized)
  const { totalCount, avgPrice, avgPricePerSqFt, locationStats } = useMemo(() => {
    const count = properties.length;
    if (count === 0) {
      return {
        totalCount: 0,
        avgPrice: 0,
        avgPricePerSqFt: 0,
        locationStats: { highest: "N/A", lowest: "N/A" }
      };
    }

    const priceSum = properties.reduce((sum, p) => sum + p.price, 0);
    const sqFtPriceSum = properties.reduce((sum, p) => sum + (p.price * 100000) / p.area, 0);
    const avgPriceVal = parseFloat((priceSum / count).toFixed(2));
    const avgPricePerSqFtVal = Math.round(sqFtPriceSum / count);

    const locSum = {};
    const locCount = {};
    properties.forEach(p => {
      if (!p.location) return;
      if (!locSum[p.location]) {
        locSum[p.location] = 0;
        locCount[p.location] = 0;
      }
      locSum[p.location] += p.price;
      locCount[p.location]++;
    });

    let highestLoc = "N/A";
    let highestAvg = -1;
    let lowestLoc = "N/A";
    let lowestAvg = Infinity;

    Object.keys(locSum).forEach(loc => {
      const avg = locSum[loc] / locCount[loc];
      if (avg > highestAvg) { highestAvg = avg; highestLoc = loc; }
      if (avg < lowestAvg) { lowestAvg = avg; lowestLoc = loc; }
    });

    return {
      totalCount: count,
      avgPrice: avgPriceVal,
      avgPricePerSqFt: avgPricePerSqFtVal,
      locationStats: { highest: highestLoc, lowest: lowestLoc }
    };
  }, [properties]);

  const mapCenter = useMemo(() => {
    const coords = properties.filter(p => p.latitude && p.longitude);
    if (coords.length > 0) {
      const avgLat = coords.reduce((sum, p) => sum + p.latitude, 0) / coords.length;
      const avgLng = coords.reduce((sum, p) => sum + p.longitude, 0) / coords.length;
      return [avgLat, avgLng];
    }
    return [12.9716, 77.5946];
  }, [properties]);

  // Chart data: Price vs Distance (Memoized & capped at 1000 items to prevent scatter lag)
  const distanceChartData = useMemo(() => {
    return properties.slice(0, 1000).map(p => ({
      distance: p.distanceFromCenter,
      price: p.price,
      location: p.location
    }));
  }, [properties]);

  // Chart data: Average Price by location (Memoized)
  const avgPriceByLoc = useMemo(() => {
    const locSum = {};
    const locCount = {};
    properties.forEach(p => {
      if (!p.location) return;
      if (!locSum[p.location]) {
        locSum[p.location] = 0;
        locCount[p.location] = 0;
      }
      locSum[p.location] += p.price;
      locCount[p.location]++;
    });
    
    return Object.keys(locSum).map(loc => ({
      location: loc,
      avgPrice: parseFloat((locSum[loc] / locCount[loc]).toFixed(2))
    })).filter(item => item.avgPrice > 0);
  }, [properties]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-white tracking-tight">Spatial Intelligence</h2>
        <p className="text-slate-400 text-sm mt-1">
          Understanding how geographical location, spatial features, and city distance influence property prices.
        </p>
      </div>

      {/* Filters bar */}
      <div className="glass-panel p-5 rounded-xl border border-white/5 bg-slate-950/20">
        <div className="flex items-center gap-2 mb-3.5">
          <SlidersHorizontal size={14} className="text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Map Query Filters</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Min Price */}
          <div>
            <label className="block text-[10px] text-slate-400 font-semibold uppercase mb-1">Min Price (₹ Lakhs)</label>
            <input
              type="number"
              name="minPrice"
              placeholder="e.g. 30"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full px-2.5 py-1.5 text-xs font-semibold glass-input"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-[10px] text-slate-400 font-semibold uppercase mb-1">Max Price (₹ Lakhs)</label>
            <input
              type="number"
              name="maxPrice"
              placeholder="e.g. 150"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full px-2.5 py-1.5 text-xs font-semibold glass-input"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-[10px] text-slate-400 font-semibold uppercase mb-1">Bedrooms</label>
            <select
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange}
              className="w-full px-2.5 py-1.5 text-xs font-semibold glass-input"
            >
              <option value="any">Any Layout</option>
              {options.bedrooms.map(b => (
                <option key={b} value={b}>{b} BHK</option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-[10px] text-slate-400 font-semibold uppercase mb-1">Property Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-2.5 py-1.5 text-xs font-semibold glass-input"
            >
              <option value="any">Any Type</option>
              {options.types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] text-slate-400 font-semibold uppercase mb-1">Neighborhood</label>
            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full px-2.5 py-1.5 text-xs font-semibold glass-input"
            >
              <option value="any">All Areas</option>
              {options.locations.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Leaflet Map Panel (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-2 rounded-xl border border-white/5 h-[450px] relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                <p className="text-xs text-slate-400">Filtering spatial points...</p>
              </div>
            </div>
          )}
          
          <MapContainer 
            center={mapCenter} // Bengaluru center
            zoom={11} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '10px' }}
          >
            <ChangeView center={mapCenter} />
            {/* Price Gravity Map Header Overlay */}
            <div className="absolute top-4 left-4 z-[400] bg-slate-950/85 border border-white/10 rounded-xl p-3 backdrop-blur-md space-y-1 font-mono">
              <div className="flex items-center gap-2">
                <Compass className="text-indigo-400 animate-spin-slow" size={15} />
                <span className="text-xs font-bold text-white uppercase tracking-wider">PRICE GRAVITY MAP</span>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">LIVE NODES</span>
              </div>
              <p className="text-[9px] text-slate-400 font-sans">
                Spatial price density concentration map representing localized valuation gravity zones.
              </p>
              
              {/* Legend */}
              <div className="flex items-center gap-3 pt-1 text-[9px] font-sans">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                  <span className="text-slate-300">Low Value</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="text-slate-300">Medium Value</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#ec4899]" />
                  <span className="text-slate-300">High Value</span>
                </div>
              </div>
            </div>

            {/* Dark themed map tiles (CartoDB Dark Matter) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Property Marker Circles (Capped at 500 to keep Leaflet rendering fast) */}
            {properties.slice(0, 500).map(p => (
              <CircleMarker
                key={p.id}
                center={[p.latitude, p.longitude]}
                radius={Math.max(5, Math.min(18, p.price / 8))} // Scaled radius
                fillColor={getMarkerColor(p.price)}
                color="#08080a"
                weight={1.5}
                fillOpacity={0.75}
              >
                <Popup>
                  <div className="text-xs leading-normal">
                    <p className="font-bold text-slate-200">{p.type} in {p.location}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Area: <span className="text-slate-200">{p.area} sq.ft.</span></p>
                    <p className="text-[10px] text-slate-400">Layout: <span className="text-slate-200">{p.bedrooms} BHK | {p.bathrooms} Bath</span></p>
                    <p className="text-[10px] text-slate-400">Age: <span className="text-slate-200">{p.age} years</span></p>
                    <p className="text-[10px] text-slate-400">Distance: <span className="text-slate-200">{p.distanceFromCenter} km</span></p>
                    <p className="font-semibold text-indigo-400 mt-1.5">Value: ₹{p.price} Lakhs</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Spatial Stats panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-xl border border-white/5 bg-slate-950/20">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Location Statistics</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Highest Avg Price Area</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{locationStats.highest}</p>
                </div>
                <MapPin size={18} className="text-pink-500" />
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Lowest Avg Price Area</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{locationStats.lowest}</p>
                </div>
                <MapPin size={18} className="text-emerald-500" />
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <p className="text-[9px] text-slate-500 font-bold uppercase">Average Price / Sq.Ft.</p>
                <p className="text-sm font-bold text-white mt-0.5">₹{avgPricePerSqFt.toLocaleString()} / sq.ft.</p>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex justify-between items-baseline">
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Current Properties Filtered</p>
                  <p className="text-sm font-bold text-white mt-0.5">{totalCount} properties</p>
                </div>
                <span className="text-[10px] text-indigo-400 font-semibold">Avg: ₹{avgPrice}L</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-indigo-950/10 p-4 flex gap-2">
            <Info size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-normal">
              Map circle sizes represent property value relative to size. Pink indicates premium luxury pricing, while green maps affordable suburban spaces.
            </p>
          </div>
        </div>

      </div>

      {/* Sub charts: Price vs Distance and Locality Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Scatter: Price vs Distance */}
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Property Price vs Distance from City Center</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis type="number" dataKey="distance" name="Distance" unit=" km" stroke="#666" fontSize={11} />
                <YAxis type="number" dataKey="price" name="Price" unit="L" stroke="#666" fontSize={11} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f0f13', borderColor: 'rgba(255,255,255,0.08)' }}
                  itemStyle={{ fontSize: '11px' }}
                  formatter={(value, name) => [value, name === 'price' ? 'Price (₹ Lakhs)' : 'Distance (km)']}
                />
                <Scatter name="Properties" data={distanceChartData} fill="#d946ef" shape="circle" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar: Avg Price by Neighborhood */}
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Average Price by Location</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={avgPriceByLoc} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="location" stroke="#666" fontSize={9} interval={0} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f13', borderColor: 'rgba(255,255,255,0.08)' }}
                  labelStyle={{ color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#f0abfc', fontSize: '11px' }}
                  formatter={(value) => [`₹${value} Lakhs`, 'Avg Price']}
                />
                <Bar dataKey="avgPrice" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Property Price Insights Section */}
      <PropertyPriceInsights uploadedDataset={uploadedDataset} />

    </div>
  );
}
