import React, { useState, useRef, useMemo } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  MapPin, 
  Building, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  Home as HomeIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

// Default Location City Profiles
const LOCATION_DATA = {
  "Bengaluru": {
    askingPrice: "6.8",
    listingsCount: 1420,
    trendData: [
      { quarter: "Dec 2025", price: 6.2 },
      { quarter: "Mar 2026", price: 6.4 },
      { quarter: "Jun 2026", price: 6.8 },
      { quarter: "Sep 2026", price: 7.1 }
    ],
    histogramData: [
      { range: "1K - 3K", count: 85 },
      { range: "3K - 4.5K", count: 280 },
      { range: "4.5K - 6K", count: 420, highlight: true },
      { range: "6K - 8K", count: 350 },
      { range: "8K - 9.5K", count: 180 },
      { range: "9.5K Above", count: 105 }
    ],
    micromarkets: [
      { name: "Indiranagar (East)", rate: 11850, percent: 90 },
      { name: "Koramangala (South)", rate: 10900, percent: 80 },
      { name: "HSR Layout (South)", rate: 9700, percent: 70 },
      { name: "Whitefield (Tech)", rate: 7250, percent: 55 }
    ],
    rentalData: [
      { config: "STUDIO", rent: "14.5 K" },
      { config: "1 BHK", rent: "18.2 K" },
      { config: "2 BHK", rent: "26.5 K" },
      { config: "3 BHK", rent: "45.0 K" }
    ]
  },
  "Indiranagar": {
    askingPrice: "11.8",
    listingsCount: 340,
    trendData: [
      { quarter: "Dec 2025", price: 10.9 },
      { quarter: "Mar 2026", price: 11.2 },
      { quarter: "Jun 2026", price: 11.8 },
      { quarter: "Sep 2026", price: 12.4 }
    ],
    histogramData: [
      { range: "4K - 6K", count: 20 },
      { range: "6K - 8K", count: 65 },
      { range: "8K - 10K", count: 110 },
      { range: "10K - 13K", count: 210, highlight: true },
      { range: "13K - 15K", count: 95 },
      { range: "15K Above", count: 50 }
    ],
    micromarkets: [
      { name: "100ft Road Prime", rate: 14200, percent: 95 },
      { name: "Defence Colony", rate: 12800, percent: 85 },
      { name: "HAL 2nd Stage", rate: 11400, percent: 75 },
      { name: "CMH Road", rate: 10200, percent: 65 }
    ],
    rentalData: [
      { config: "STUDIO", rent: "18.0 K" },
      { config: "1 BHK", rent: "24.5 K" },
      { config: "2 BHK", rent: "38.0 K" },
      { config: "3 BHK", rent: "65.0 K" }
    ]
  },
  "Koramangala": {
    askingPrice: "10.9",
    listingsCount: 290,
    trendData: [
      { quarter: "Dec 2025", price: 10.1 },
      { quarter: "Mar 2026", price: 10.4 },
      { quarter: "Jun 2026", price: 10.9 },
      { quarter: "Sep 2026", price: 11.5 }
    ],
    histogramData: [
      { range: "4K - 6K", count: 30 },
      { range: "6K - 8K", count: 70 },
      { range: "8K - 10K", count: 140, highlight: true },
      { range: "10K - 12K", count: 180 },
      { range: "12K - 15K", count: 80 },
      { range: "15K Above", count: 40 }
    ],
    micromarkets: [
      { name: "Koramangala 3rd Block", rate: 13500, percent: 92 },
      { name: "Koramangala 4th Block", rate: 11900, percent: 82 },
      { name: "Koramangala 5th Block", rate: 10500, percent: 72 },
      { name: "Koramangala 1st Block", rate: 9400, percent: 60 }
    ],
    rentalData: [
      { config: "STUDIO", rent: "16.5 K" },
      { config: "1 BHK", rent: "22.0 K" },
      { config: "2 BHK", rent: "35.0 K" },
      { config: "3 BHK", rent: "58.0 K" }
    ]
  },
  "Whitefield": {
    askingPrice: "7.2",
    listingsCount: 510,
    trendData: [
      { quarter: "Dec 2025", price: 6.6 },
      { quarter: "Mar 2026", price: 6.9 },
      { quarter: "Jun 2026", price: 7.2 },
      { quarter: "Sep 2026", price: 7.7 }
    ],
    histogramData: [
      { range: "3K - 4.5K", count: 60 },
      { range: "4.5K - 6K", count: 140 },
      { range: "6K - 8K", count: 260, highlight: true },
      { range: "8K - 9.5K", count: 120 },
      { range: "9.5K - 11K", count: 70 },
      { range: "11K Above", count: 30 }
    ],
    micromarkets: [
      { name: "ITPL Main Road", rate: 8400, percent: 88 },
      { name: "EPIP Zone", rate: 7600, percent: 78 },
      { name: "Hoodi Circle", rate: 6800, percent: 68 },
      { name: "Kadugodi", rate: 5900, percent: 52 }
    ],
    rentalData: [
      { config: "STUDIO", rent: "12.0 K" },
      { config: "1 BHK", rent: "15.5 K" },
      { config: "2 BHK", rent: "24.0 K" },
      { config: "3 BHK", rent: "39.0 K" }
    ]
  },
  "HSR Layout": {
    askingPrice: "9.7",
    listingsCount: 380,
    trendData: [
      { quarter: "Dec 2025", price: 8.9 },
      { quarter: "Mar 2026", price: 9.3 },
      { quarter: "Jun 2026", price: 9.7 },
      { quarter: "Sep 2026", price: 10.2 }
    ],
    histogramData: [
      { range: "3K - 5K", count: 40 },
      { range: "5K - 7K", count: 90 },
      { range: "7K - 9K", count: 130 },
      { range: "9K - 11K", count: 220, highlight: true },
      { range: "11K - 13K", count: 85 },
      { range: "13K Above", count: 45 }
    ],
    micromarkets: [
      { name: "HSR Sector 1", rate: 10800, percent: 90 },
      { name: "HSR Sector 2", rate: 10100, percent: 82 },
      { name: "HSR Sector 3", rate: 9400, percent: 74 },
      { name: "HSR Sector 6 & 7", rate: 8600, percent: 64 }
    ],
    rentalData: [
      { config: "STUDIO", rent: "15.0 K" },
      { config: "1 BHK", rent: "19.5 K" },
      { config: "2 BHK", rent: "31.0 K" },
      { config: "3 BHK", rent: "52.0 K" }
    ]
  }
};

export default function PropertyPriceInsights({ uploadedDataset = [] }) {
  const scrollContainerRef = useRef(null);

  // Compute available locations including custom dataset locations if provided
  const availableLocations = useMemo(() => {
    const keys = Object.keys(LOCATION_DATA);
    if (Array.isArray(uploadedDataset) && uploadedDataset.length > 0) {
      const customLocs = new Set();
      uploadedDataset.forEach(item => {
        if (item.location && typeof item.location === 'string') {
          customLocs.add(item.location);
        }
      });
      const customArray = Array.from(customLocs);
      return Array.from(new Set([...customArray, ...keys]));
    }
    return keys;
  }, [uploadedDataset]);

  const [selectedCity, setSelectedCity] = useState(availableLocations[0] || "Bengaluru");

  // Retrieve current active data profile
  const activeData = useMemo(() => {
    if (LOCATION_DATA[selectedCity]) {
      return LOCATION_DATA[selectedCity];
    }
    // Fallback computed profile for custom uploaded locations
    const customItems = uploadedDataset.filter(d => d.location === selectedCity);
    if (customItems.length > 0) {
      const avgAreaPrice = customItems.reduce((acc, cur) => acc + ((cur.price * 100000) / (cur.area || 1000)), 0) / customItems.length;
      const kRate = (avgAreaPrice / 1000).toFixed(1);
      return {
        askingPrice: kRate,
        listingsCount: customItems.length,
        trendData: [
          { quarter: "Dec 2025", price: (parseFloat(kRate) * 0.92).toFixed(1) },
          { quarter: "Mar 2026", price: (parseFloat(kRate) * 0.96).toFixed(1) },
          { quarter: "Jun 2026", price: parseFloat(kRate).toFixed(1) },
          { quarter: "Sep 2026", price: (parseFloat(kRate) * 1.05).toFixed(1) }
        ],
        histogramData: [
          { range: "1K - 3K", count: Math.round(customItems.length * 0.1) },
          { range: "3K - 4.5K", count: Math.round(customItems.length * 0.25) },
          { range: "4.5K - 6K", count: Math.round(customItems.length * 0.4), highlight: true },
          { range: "6K - 8K", count: Math.round(customItems.length * 0.15) },
          { range: "8K - 9.5K", count: Math.round(customItems.length * 0.07) },
          { range: "9.5K Above", count: Math.round(customItems.length * 0.03) }
        ],
        micromarkets: [
          { name: `${selectedCity} North`, rate: Math.round(avgAreaPrice * 1.1), percent: 85 },
          { name: `${selectedCity} Central`, rate: Math.round(avgAreaPrice), percent: 75 },
          { name: `${selectedCity} South`, rate: Math.round(avgAreaPrice * 0.9), percent: 65 },
          { name: `${selectedCity} West`, rate: Math.round(avgAreaPrice * 0.75), percent: 50 }
        ],
        rentalData: [
          { config: "STUDIO", rent: `${(parseFloat(kRate) * 2.1).toFixed(1)} K` },
          { config: "1 BHK", rent: `${(parseFloat(kRate) * 2.8).toFixed(1)} K` },
          { config: "2 BHK", rent: `${(parseFloat(kRate) * 4.2).toFixed(1)} K` },
          { config: "3 BHK", rent: `${(parseFloat(kRate) * 6.5).toFixed(1)} K` }
        ]
      };
    }
    return LOCATION_DATA["Bengaluru"];
  }, [selectedCity, uploadedDataset]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full space-y-6 select-none my-6">
      
      {/* Header Section with Title & Location Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse" />
              <span>Real Estate Intelligence</span>
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Property Price Insights in</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              {selectedCity}
            </span>
          </h2>
          
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-light">
            Discover key property price insights in <strong className="text-slate-200 font-semibold">{selectedCity}</strong>, such as market trends, rental benchmarks, and government rates. Enhance your investment decisions with comparisons of leading projects and neighbourhoods.
          </p>
        </div>

        {/* City Location Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-white/10 p-1 rounded-xl">
            <MapPin size={13} className="text-emerald-400 ml-2" />
            {availableLocations.slice(0, 5).map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedCity(loc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCity === loc
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Container with Navigation Arrows */}
      <div className="relative group">
        
        {/* Left Scroll Arrow */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/90 hover:bg-emerald-600 text-white border border-white/10 hover:border-emerald-400 flex items-center justify-center shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          aria-label="Scroll Left"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/90 hover:bg-emerald-600 text-white border border-white/10 hover:border-emerald-400 flex items-center justify-center shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          aria-label="Scroll Right"
        >
          <ChevronRight size={20} />
        </button>

        {/* Scrollable Horizontal Cards Grid */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory custom-scrollbar scroll-smooth"
        >
          
          {/* ================= CARD 1: PRICE TREND ================= */}
          <div className="min-w-[310px] max-w-[330px] flex-1 snap-start glass-panel rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-sky-500/30 transition-all shadow-xl">
            <div>
              {/* Header Info */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Price Trend</h3>
                  <p className="text-[11px] text-slate-400">in {selectedCity}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <TrendingUp size={16} />
                </div>
              </div>

              {/* Cyan Tint Banner Box with Lightbulb */}
              <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-3 mb-4 flex items-start gap-2.5">
                <div className="p-1 rounded-full bg-sky-500/20 text-sky-400 shrink-0 mt-0.5">
                  <Lightbulb size={14} />
                </div>
                <p className="text-xs text-sky-200 font-medium leading-snug">
                  {selectedCity}'s average asking price is rising quarter-on-quarter.
                </p>
              </div>

              {/* Line Chart */}
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeData.trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="quarter" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `₹${val}K`}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(56, 189, 248, 0.3)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#38bdf8', fontSize: '11px' }}
                      formatter={(val) => [`₹ ${val} K / Sq.Ft.`, 'Asking Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#f97316" 
                      strokeWidth={2.5}
                      dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#020617' }}
                      activeDot={{ r: 6, fill: '#ea580c' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
              <span className="text-[11px] text-slate-300 font-medium">{selectedCity}</span>
            </div>
          </div>

          {/* ================= CARD 2: ASKING PRICE ================= */}
          <div className="min-w-[310px] max-w-[330px] flex-1 snap-start glass-panel rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-amber-500/30 transition-all shadow-xl">
            <div>
              {/* Header Info */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Asking Price</h3>
                  <p className="text-[11px] text-slate-400">in {selectedCity}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <BarChart3 size={16} />
                </div>
              </div>

              {/* Peach/Orange Tint Banner Box with Lightbulb */}
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-4 flex items-start gap-2.5">
                <div className="p-1 rounded-full bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Lightbulb size={14} />
                </div>
                <p className="text-xs text-amber-200 font-medium leading-snug">
                  {selectedCity} has {activeData.listingsCount} Listings on Marketplaces with Median Price of ₹ {activeData.askingPrice} k/Sq.Ft.
                </p>
              </div>

              {/* Histogram Bar Chart */}
              <div className="h-44 w-full relative">
                {/* Highlighted Median Badge Callout */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white text-slate-900 border border-slate-300 shadow-md text-[10px] font-bold px-2 py-0.5 rounded z-10 font-mono flex items-center gap-1">
                  <span>₹ {activeData.askingPrice} K/Sq.Ft.</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeData.histogramData} margin={{ top: 24, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="range" stroke="#64748b" fontSize={8} tickLine={false} interval={0} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(245, 158, 11, 0.3)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#f59e0b', fontSize: '11px' }}
                      formatter={(val) => [`${val} Listings`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                      {activeData.histogramData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.highlight ? '#d97706' : '#ea580c'} 
                          opacity={entry.highlight ? 1 : 0.75}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom X-Axis Label */}
            <div className="text-center pt-2 border-t border-white/5">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Price Range (Rs/Sqft)</span>
            </div>
          </div>

          {/* ================= CARD 3: MICROMARKET PRICE COMPARISON ================= */}
          <div className="min-w-[310px] max-w-[330px] flex-1 snap-start glass-panel rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-purple-500/30 transition-all shadow-xl">
            <div>
              {/* Header Info */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Micromarket Price</h3>
                  <p className="text-[11px] text-slate-400">Comparison in {selectedCity}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Building size={16} />
                </div>
              </div>

              {/* Purple Tint Banner Box with Lightbulb */}
              <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 mb-4 flex items-start gap-2.5">
                <div className="p-1 rounded-full bg-purple-500/20 text-purple-400 shrink-0 mt-0.5">
                  <Lightbulb size={14} />
                </div>
                <p className="text-xs text-purple-200 font-medium leading-snug">
                  {selectedCity} avg. price is ₹ {activeData.askingPrice} k/Sq.Ft.
                </p>
              </div>

              {/* Micromarkets List */}
              <div className="space-y-3.5 my-2">
                {activeData.micromarkets.map((micro) => (
                  <div key={micro.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-white font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                        ₹ {micro.rate.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-300 font-medium truncate ml-2 text-right">
                        {micro.name}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${micro.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-500 text-center border-t border-white/5">
              Comparative benchmark rates per sq.ft.
            </div>
          </div>

          {/* ================= CARD 4: RENTAL SUPPLY ================= */}
          <div className="min-w-[310px] max-w-[330px] flex-1 snap-start glass-panel rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-xl">
            <div>
              {/* Header Info */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Rental Supply</h3>
                  <p className="text-[11px] text-slate-400">in {selectedCity}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <HomeIcon size={16} />
                </div>
              </div>

              {/* Mint Green Tint Banner Box with Lightbulb */}
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mb-4 flex items-start gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Lightbulb size={14} />
                </div>
                <p className="text-xs text-emerald-200 font-medium leading-snug">
                  Monthly Rent in {selectedCity} ranges from ₹ {activeData.rentalData[0]?.rent} to ₹ {activeData.rentalData[3]?.rent} with options available for...
                </p>
              </div>

              {/* Rental Supply Table */}
              <div className="rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden text-xs my-2">
                <div className="grid grid-cols-2 p-2.5 border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white/5">
                  <span>Configurations</span>
                  <span className="text-right">In {selectedCity}</span>
                </div>

                <div className="divide-y divide-white/5">
                  {activeData.rentalData.map((row) => (
                    <div key={row.config} className="grid grid-cols-2 p-2.5 text-slate-300 font-medium hover:bg-white/5 transition-colors">
                      <span className="font-semibold text-white">{row.config}</span>
                      <span className="text-right font-mono text-emerald-400 font-bold">₹ {row.rent}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-500 text-center border-t border-white/5">
              Verified Marketplace Rental Benchmarks
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
