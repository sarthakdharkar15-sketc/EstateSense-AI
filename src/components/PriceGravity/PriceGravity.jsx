import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, 
  Upload, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Layers, 
  BarChart2, 
  Zap,
  Building2,
  Sliders
} from 'lucide-react';
import LocationSelector from './LocationSelector';
import PriceGravityMap from './PriceGravityMap';
import LocationInsightCard from './LocationInsightCard';

export default function PriceGravity({ uploadedDataset = [], onNavigate = () => {} }) {
  const [selectedLocation, setSelectedLocation] = useState('');

  // 1. Process and aggregate dataset dynamically by location
  const datasetAnalysis = useMemo(() => {
    if (!Array.isArray(uploadedDataset) || uploadedDataset.length === 0) {
      return { locations: [], overallAvgRate: 0, isEmpty: true };
    }

    const locationGroupMap = new Map();
    let totalRateSum = 0;
    let totalRateCount = 0;

    uploadedDataset.forEach((item) => {
      // Flexibly extract location field name
      const rawLoc = item.location || item.Location || item.area || item.Area || item.locality || item.Locality || item.city || item.City || item.neighbourhood;
      if (!rawLoc) return;

      const locName = String(rawLoc).trim();
      if (!locName) return;

      // Extract price & area
      const rawPrice = parseFloat(item.price || item.Price || item.price_lakhs || item.amount || 0);
      const areaSqft = parseFloat(item.area || item.Area || item.total_sqft || item.sqft || item.size_sqft || 1000);

      if (isNaN(rawPrice) || rawPrice <= 0 || isNaN(areaSqft) || areaSqft <= 0) return;

      // Price normalization: if price > 10000 assume Rupees, else Lakhs
      const priceLakhs = rawPrice > 10000 ? rawPrice / 100000 : rawPrice;
      const priceRupees = priceLakhs * 100000;
      const ratePerSqft = Math.round(priceRupees / areaSqft);

      // Lat/Lng extraction if present
      const lat = parseFloat(item.latitude || item.lat || item.Lat || item.Latitude || 0);
      const lng = parseFloat(item.longitude || item.lng || item.long || item.Lon || item.Longitude || 0);

      if (!locationGroupMap.has(locName)) {
        locationGroupMap.set(locName, {
          name: locName,
          rates: [],
          prices: [],
          lats: [],
          lngs: [],
        });
      }

      const entry = locationGroupMap.get(locName);
      entry.rates.push(ratePerSqft);
      entry.prices.push(priceLakhs);
      if (!isNaN(lat) && lat !== 0) entry.lats.push(lat);
      if (!isNaN(lng) && lng !== 0) entry.lngs.push(lng);

      totalRateSum += ratePerSqft;
      totalRateCount += 1;
    });

    if (totalRateCount === 0) {
      return { locations: [], overallAvgRate: 0, isEmpty: true };
    }

    const overallAvgRate = Math.round(totalRateSum / totalRateCount);

    // Compute aggregated per-location metrics
    const locations = Array.from(locationGroupMap.values()).map(loc => {
      const count = loc.rates.length;
      const avgRate = Math.round(loc.rates.reduce((a, b) => a + b, 0) / count);
      
      // Median rate
      const sortedRates = [...loc.rates].sort((a, b) => a - b);
      const mid = Math.floor(sortedRates.length / 2);
      const medianRate = sortedRates.length % 2 !== 0 
        ? sortedRates[mid] 
        : Math.round((sortedRates[mid - 1] + sortedRates[mid]) / 2);

      const avgPriceLakhs = loc.prices.reduce((a, b) => a + b, 0) / count;
      const minPriceLakhs = Math.min(...loc.prices);
      const maxPriceLakhs = Math.max(...loc.prices);

      // Average Lat/Lng if present
      const lat = loc.lats.length > 0 ? loc.lats.reduce((a, b) => a + b, 0) / loc.lats.length : null;
      const lng = loc.lngs.length > 0 ? loc.lngs.reduce((a, b) => a + b, 0) / loc.lngs.length : null;

      // Percentage difference vs overall average
      const diffPercent = ((avgRate - overallAvgRate) / overallAvgRate) * 100;

      // Impact Classification
      let impactClass = 'Medium';
      if (diffPercent >= 15) impactClass = 'High';
      else if (diffPercent <= -15) impactClass = 'Low';

      return {
        name: loc.name,
        avgRate,
        medianRate,
        count,
        avgPriceLakhs,
        minPriceLakhs,
        maxPriceLakhs,
        lat,
        lng,
        diffPercent,
        impactClass
      };
    });

    // Sort locations by count descending
    locations.sort((a, b) => b.count - a.count);

    return { locations, overallAvgRate, isEmpty: false };
  }, [uploadedDataset]);

  // Set default selected location when locations load
  useEffect(() => {
    if (datasetAnalysis.locations.length > 0 && !selectedLocation) {
      setSelectedLocation(datasetAnalysis.locations[0].name);
    }
  }, [datasetAnalysis.locations, selectedLocation]);

  const activeLocationData = useMemo(() => {
    return datasetAnalysis.locations.find(l => l.name === selectedLocation) || datasetAnalysis.locations[0] || null;
  }, [datasetAnalysis.locations, selectedLocation]);

  // REQUIREMENT 9: EMPTY DATASET STATE
  if (datasetAnalysis.isEmpty) {
    return (
      <section className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl relative overflow-hidden my-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-2xl">
          📍
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} className="text-emerald-400 animate-pulse" />
            <span>PRICE GRAVITY</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            How Location Affects Property Value
          </h2>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Upload your property dataset to explore how location influences value.
          </p>
        </div>

        <button
          onClick={() => onNavigate('dataset')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-300 inline-flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
        >
          <Upload size={14} />
          <span>Upload Dataset →</span>
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-8 my-12 pt-4">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <MapPin size={13} className="animate-pulse" />
            <span>Dataset Analytics • PRICE GRAVITY</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            📍 PRICE GRAVITY
          </h2>
          <p className="text-slate-400 text-xs md:text-sm italic">
            “How location affects property value”
          </p>
        </div>

        {/* Location Selector Dropdown Component */}
        <LocationSelector
          locations={datasetAnalysis.locations}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
        />
      </div>

      {/* Main Grid: Desktop 60-65% Map / 35-40% Insight Panel (Requirement 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Interactive Map (Desktop 7 cols = ~58-60%) */}
        <div className="lg:col-span-7">
          <PriceGravityMap
            locations={datasetAnalysis.locations}
            overallAvgRate={datasetAnalysis.overallAvgRate}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
          />
        </div>

        {/* Right Column: Location Insight Card (Desktop 5 cols = ~40-42%) */}
        <div className="lg:col-span-5">
          <LocationInsightCard
            locationData={activeLocationData}
            overallAvgRate={datasetAnalysis.overallAvgRate}
          />
        </div>

      </div>

      {/* Bottom CTA Section (Requirement 13) */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-base md:text-lg font-bold text-white tracking-tight">
            Know how location shapes value. Now discover YOUR property value.
          </h4>
          <p className="text-xs text-slate-400">
            Get an instant AI valuation tailored to your property's specific attributes and location.
          </p>
        </div>

        <button
          onClick={() => onNavigate('predict')}
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 shrink-0 cursor-pointer"
        >
          <Zap size={14} className="fill-slate-950" />
          <span>Predict My Property →</span>
        </button>
      </div>

    </section>
  );
}
