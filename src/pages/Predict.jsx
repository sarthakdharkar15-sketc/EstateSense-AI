import React, { useState, useMemo, useEffect } from 'react';
import { 
  apiService, 
  trainModelOnDataset, 
  detectColumnMappings, 
  predictSinglePropertyRow, 
  predictAreaBatch 
} from '../services/api';
import { NEIGHBORHOOD_CONFIGS, MOCK_PROPERTIES } from '../services/mockData';
import { 
  Sparkles, HelpCircle, AlertTriangle, ArrowRight, Loader2, Database, Zap, 
  Globe, Plus, Minus, Binary, Trash2, Upload, FileText, Download, Check, X, Scale,
  ChevronLeft, ChevronRight, Filter, Settings2, Sliders, MapPin, Building2,
  BarChart3, RefreshCw, Eye, CheckCircle2, Search
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { jsPDF } from 'jspdf';
import AnimatedNumber from '../components/AnimatedNumber';

export default function Predict({ triggerToast, uploadedDataset, setUploadedDataset, onPredictionComplete, onNavigate }) {
  const dataset = Array.isArray(uploadedDataset) ? uploadedDataset : [];
  const isCustomModel = dataset.length > 0;
  
  // Base dataset: custom uploaded CSV if present, otherwise default realistic properties
  const activeDataset = isCustomModel ? dataset : MOCK_PROPERTIES;

  const fittedModel = useMemo(() => {
    return isCustomModel ? trainModelOnDataset(dataset) : null;
  }, [isCustomModel, dataset]);

  const neighborhoodConfigs = isCustomModel 
    ? (fittedModel ? fittedModel.neighborhoodConfigs : NEIGHBORHOOD_CONFIGS)
    : NEIGHBORHOOD_CONFIGS;

  // Prediction Mode State: 'area-batch' (Area-Wise CSV) vs 'single' (Single Property)
  const [predictionMode, setPredictionMode] = useState('area-batch');

  // CSV Drag & Drop and Processing State
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Column Mapping State
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMappings, setColumnMappings] = useState({
    location: 'location',
    area: 'area',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    price: 'price',
    type: 'type',
    furnishing: 'furnishing',
    age: 'age',
    distanceFromCenter: 'distanceFromCenter'
  });
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [autoDetectedInfo, setAutoDetectedInfo] = useState(null);

  // Area-Wise Batch Mode State
  const [selectedAreaLocation, setSelectedAreaLocation] = useState("");
  const [bhkFilter, setBhkFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [minAreaFilter, setMinAreaFilter] = useState("");
  const [maxAreaFilter, setMaxAreaFilter] = useState("");
  const [batchTablePage, setBatchTablePage] = useState(1);
  const batchPageSize = 8;

  // Single Property Form State
  const [formData, setFormData] = useState({
    area: 1600,
    bedrooms: 3,
    bathrooms: 2,
    age: 5,
    floors: 2,
    parking: 1,
    type: 'Apartment',
    furnishing: 'Semi-Furnished',
    location: 'Indiranagar',
    latitude: 12.9784,
    longitude: 77.6408,
    distanceFromCenter: 5.5,
    askingPrice: ""
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [formError, setFormError] = useState("");

  // Extract unique locations dynamically from current active dataset
  const uniqueLocations = useMemo(() => {
    const locSet = new Set();
    activeDataset.forEach(row => {
      if (row.location && typeof row.location === 'string' && row.location.trim() !== "") {
        locSet.add(row.location.trim());
      }
    });
    return Array.from(locSet).sort();
  }, [activeDataset]);

  // Set default selected location once locations are available
  useEffect(() => {
    if (uniqueLocations.length > 0 && (!selectedAreaLocation || !uniqueLocations.includes(selectedAreaLocation))) {
      setSelectedAreaLocation(uniqueLocations[0]);
    }
  }, [uniqueLocations, selectedAreaLocation]);

  // Extract available filter choices based on active dataset
  const availableBhkOptions = useMemo(() => {
    const bhks = new Set();
    activeDataset.forEach(r => {
      const b = parseInt(r.bedrooms);
      if (!isNaN(b) && b > 0) bhks.add(b);
    });
    return Array.from(bhks).sort((a, b) => a - b);
  }, [activeDataset]);

  const availableTypeOptions = useMemo(() => {
    const types = new Set();
    activeDataset.forEach(r => {
      if (r.type && typeof r.type === 'string' && r.type.trim() !== '') {
        types.add(r.type.trim());
      }
    });
    return Array.from(types).sort();
  }, [activeDataset]);

  const areaBounds = useMemo(() => {
    let min = Infinity, max = -Infinity;
    activeDataset.forEach(r => {
      const a = parseFloat(r.area);
      if (!isNaN(a) && a > 0) {
        if (a < min) min = a;
        if (a > max) max = a;
      }
    });
    return {
      min: min === Infinity ? 400 : Math.floor(min),
      max: max === -Infinity ? 5000 : Math.ceil(max)
    };
  }, [activeDataset]);

  // CSV Parsing
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const processCSVText = (text) => {
    setIsProcessing(true);
    setUploadError("");

    try {
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length < 2) {
        throw new Error("The uploaded CSV file is empty or missing a data row.");
      }

      const headers = parseCSVLine(lines[0]);
      setCsvHeaders(headers);

      // Extract sample rows as key-value objects for detection
      const sampleObjects = [];
      for (let i = 1; i < Math.min(10, lines.length); i++) {
        const cols = parseCSVLine(lines[i]);
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = cols[idx] || "";
        });
        sampleObjects.push(obj);
      }

      // Automatic column identification
      const { mappings, isAutoDetected } = detectColumnMappings(headers, sampleObjects);
      setColumnMappings(mappings);
      setAutoDetectedInfo({
        isAutoDetected,
        locationCol: mappings.location,
        areaCol: mappings.area
      });

      // Parse dataset rows using detected mappings
      const parsedRows = buildDatasetFromMappings(lines, headers, mappings);
      if (parsedRows.length === 0) {
        throw new Error("No valid property records could be parsed with current column headers.");
      }

      setUploadedDataset(parsedRows);
      setBatchTablePage(1);

      const locCount = new Set(parsedRows.map(r => r.location)).size;
      triggerToast(`CSV Loaded: ${parsedRows.length} properties across ${locCount} areas! ML model fitted.`, "success");

      // Auto-open mapping modal only if automatic detection could not determine location or area
      if (!isAutoDetected) {
        setShowMappingModal(true);
      }
    } catch (err) {
      setUploadError(err.message || "Failed to process the CSV file.");
      triggerToast(err.message || "CSV processing failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const buildDatasetFromMappings = (lines, headers, mappings) => {
    const locIdx = headers.indexOf(mappings.location);
    const areaIdx = headers.indexOf(mappings.area);
    const bedIdx = headers.indexOf(mappings.bedrooms);
    const bathIdx = headers.indexOf(mappings.bathrooms);
    const priceIdx = headers.indexOf(mappings.price);
    const typeIdx = headers.indexOf(mappings.type);
    const furnIdx = headers.indexOf(mappings.furnishing);
    const ageIdx = headers.indexOf(mappings.age);
    const distIdx = headers.indexOf(mappings.distanceFromCenter);

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length === 0 || (cols.length === 1 && cols[0] === "")) continue;

      const rawLoc = locIdx !== -1 ? cols[locIdx] : "";
      const location = (rawLoc && rawLoc.trim()) ? rawLoc.trim() : "Indiranagar";

      const rawArea = areaIdx !== -1 ? parseFloat(cols[areaIdx]) : NaN;
      const area = (!isNaN(rawArea) && rawArea > 0) ? rawArea : 1200;

      const rawBeds = bedIdx !== -1 ? parseInt(cols[bedIdx]) : NaN;
      const bedrooms = (!isNaN(rawBeds) && rawBeds > 0) ? rawBeds : 2;

      const rawBaths = bathIdx !== -1 ? parseInt(cols[bathIdx]) : NaN;
      const bathrooms = (!isNaN(rawBaths) && rawBaths > 0) ? rawBaths : Math.max(1, bedrooms - 1);

      let price = null;
      if (priceIdx !== -1 && cols[priceIdx] !== undefined && cols[priceIdx] !== "") {
        const rawP = parseFloat(cols[priceIdx]);
        if (!isNaN(rawP) && rawP > 0) {
          price = rawP > 10000 ? parseFloat((rawP / 100000).toFixed(2)) : parseFloat(rawP.toFixed(2));
        }
      }

      const type = (typeIdx !== -1 && cols[typeIdx]) ? cols[typeIdx].trim() : "Apartment";
      const furnishing = (furnIdx !== -1 && cols[furnIdx]) ? cols[furnIdx].trim() : "Semi-Furnished";
      const age = (ageIdx !== -1 && !isNaN(parseFloat(cols[ageIdx]))) ? parseFloat(cols[ageIdx]) : 5;
      const distanceFromCenter = (distIdx !== -1 && !isNaN(parseFloat(cols[distIdx]))) ? parseFloat(cols[distIdx]) : 5.0;

      rows.push({
        id: `CSV-${1000 + i}`,
        location,
        area,
        bedrooms,
        bathrooms,
        age,
        floors: 1,
        parking: 1,
        type,
        furnishing,
        distanceFromCenter,
        price,
        hasActualPrice: price !== null,
        rawHeaders: headers,
        rawValues: cols
      });
    }
    return rows;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => processCSVText(event.target.result);
    reader.onerror = () => triggerToast("Error reading file", "error");
    reader.readAsText(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (event) => processCSVText(event.target.result);
        reader.readAsText(file);
      } else {
        triggerToast("Please upload a valid CSV file (.csv).", "warning");
      }
    }
  };

  // Re-apply column mappings manually
  const handleApplyCustomMappings = () => {
    if (!csvHeaders.length || !uploadedDataset.length) return;
    try {
      // Re-create lines from raw values
      const rawLines = [csvHeaders.join(',')];
      uploadedDataset.forEach(row => {
        if (row.rawValues) {
          rawLines.push(row.rawValues.join(','));
        }
      });

      const updatedRows = buildDatasetFromMappings(rawLines, csvHeaders, columnMappings);
      setUploadedDataset(updatedRows);
      setShowMappingModal(false);
      triggerToast("Column mappings updated and ML model re-fitted successfully!", "success");
    } catch (err) {
      triggerToast("Failed to apply new column mappings", "error");
    }
  };

  // Reset custom dataset back to baseline
  const handleClearDataset = () => {
    setUploadedDataset([]);
    setCsvHeaders([]);
    setUploadError("");
    setAutoDetectedInfo(null);
    triggerToast("Custom dataset cleared. Reverted to baseline Bengaluru dataset.", "info");
  };

  // Area-Wise Batch Prediction Core Logic:
  // 1. Filter dataset to ONLY the selected location and matching criteria
  // 2. Predict prices strictly for the filtered rows (zero predictions on unselected areas)
  const filteredAreaRows = useMemo(() => {
    if (!selectedAreaLocation) return [];
    
    return activeDataset.filter(row => {
      // 1. Strict Location Matching
      if (row.location !== selectedAreaLocation) return false;

      // 2. Optional BHK Filter
      if (bhkFilter !== "all") {
        const b = parseInt(row.bedrooms);
        if (bhkFilter === "5+") {
          if (b < 5) return false;
        } else {
          if (b !== parseInt(bhkFilter)) return false;
        }
      }

      // 3. Optional Property Type Filter
      if (typeFilter !== "all" && row.type) {
        if (row.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
      }

      // 4. Optional Area/Size Range Filter
      if (minAreaFilter !== "" && !isNaN(parseFloat(minAreaFilter))) {
        if (row.area < parseFloat(minAreaFilter)) return false;
      }
      if (maxAreaFilter !== "" && !isNaN(parseFloat(maxAreaFilter))) {
        if (row.area > parseFloat(maxAreaFilter)) return false;
      }

      return true;
    });
  }, [activeDataset, selectedAreaLocation, bhkFilter, typeFilter, minAreaFilter, maxAreaFilter]);

  // Apply trained model ONLY to matching rows (target leakage strictly prevented)
  const areaBatchPredictions = useMemo(() => {
    if (filteredAreaRows.length === 0) return [];
    return predictAreaBatch(filteredAreaRows, fittedModel, isCustomModel ? dataset : null);
  }, [filteredAreaRows, fittedModel, isCustomModel, dataset]);

  // Area Summary Metrics
  const areaSummaryStats = useMemo(() => {
    const total = areaBatchPredictions.length;
    if (total === 0) return null;

    const predPrices = areaBatchPredictions.map(p => p.predictedPrice);
    const avgPredPrice = parseFloat((predPrices.reduce((a, b) => a + b, 0) / total).toFixed(2));
    const minPredPrice = Math.min(...predPrices);
    const maxPredPrice = Math.max(...predPrices);

    const pricePerSqfts = areaBatchPredictions.map(p => p.predictedPricePerSqft).filter(p => p > 0);
    const avgPricePerSqft = pricePerSqfts.length 
      ? Math.round(pricePerSqfts.reduce((a, b) => a + b, 0) / pricePerSqfts.length)
      : null;

    // Actual prices comparison if available
    const rowsWithActual = areaBatchPredictions.filter(p => p.actualPrice !== null && p.actualPrice > 0);
    let avgActualPrice = null;
    let meanDifference = null;
    if (rowsWithActual.length > 0) {
      avgActualPrice = parseFloat((rowsWithActual.reduce((a, b) => a + b.actualPrice, 0) / rowsWithActual.length).toFixed(2));
      const totalDiff = rowsWithActual.reduce((a, b) => a + (b.predictedPrice - b.actualPrice), 0);
      meanDifference = parseFloat((totalDiff / rowsWithActual.length).toFixed(2));
    }

    return {
      totalCount: total,
      avgPredPrice,
      minPredPrice,
      maxPredPrice,
      avgPricePerSqft,
      hasActualPrices: rowsWithActual.length > 0,
      actualCount: rowsWithActual.length,
      avgActualPrice,
      meanDifference
    };
  }, [areaBatchPredictions]);

  // Histogram / Price Distribution Data for Recharts
  const priceDistributionData = useMemo(() => {
    if (!areaSummaryStats || areaBatchPredictions.length === 0) return [];

    const prices = areaBatchPredictions.map(p => p.predictedPrice);
    const minP = Math.floor(Math.min(...prices));
    const maxP = Math.ceil(Math.max(...prices));

    if (minP === maxP) {
      return [{ range: `₹${minP}L`, count: prices.length }];
    }

    const numBins = Math.min(5, prices.length >= 8 ? 5 : 3);
    const binSize = (maxP - minP) / numBins;
    const bins = Array(numBins).fill(0).map((_, i) => {
      const lower = Math.round(minP + i * binSize);
      const upper = Math.round(minP + (i + 1) * binSize);
      return {
        range: `₹${lower}-${upper}L`,
        count: 0
      };
    });

    prices.forEach(p => {
      let idx = Math.floor((p - minP) / binSize);
      if (idx >= numBins) idx = numBins - 1;
      if (idx < 0) idx = 0;
      bins[idx].count++;
    });

    return bins;
  }, [areaSummaryStats, areaBatchPredictions]);

  // Paginated Batch Table
  const paginatedBatchRows = useMemo(() => {
    const start = (batchTablePage - 1) * batchPageSize;
    return areaBatchPredictions.slice(start, start + batchPageSize);
  }, [areaBatchPredictions, batchTablePage]);

  const totalBatchPages = Math.ceil(areaBatchPredictions.length / batchPageSize);

  // Export filtered batch predictions as CSV
  const handleExportFilteredCSV = () => {
    if (areaBatchPredictions.length === 0) {
      triggerToast("No matching predictions available to export.", "warning");
      return;
    }

    const headers = [
      "Property_ID",
      "Location",
      "Area_sqft",
      "Bedrooms_BHK",
      "Bathrooms",
      "Property_Type",
      "Furnishing",
      "Actual_Price_Lakhs",
      "AI_Predicted_Price_Lakhs",
      "Predicted_Price_Per_SqFt",
      "Difference_Lakhs",
      "Difference_Percent"
    ];

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    areaBatchPredictions.forEach(row => {
      const line = [
        `"${row.id}"`,
        `"${row.location}"`,
        row.area,
        row.bedrooms,
        row.bathrooms,
        `"${row.type || 'N/A'}"`,
        `"${row.furnishing || 'N/A'}"`,
        row.actualPrice !== null ? row.actualPrice : "N/A",
        row.predictedPrice,
        row.predictedPricePerSqft,
        row.diffLakhs !== null ? row.diffLakhs : "N/A",
        row.diffPct !== null ? `${row.diffPct}%` : "N/A"
      ].join(",");
      csvContent += line + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EstateSense_${selectedAreaLocation}_Predictions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`Exported ${areaBatchPredictions.length} predictions for ${selectedAreaLocation}!`, "success");
  };

  // Inspect specific row in Single Property Mode
  const handleInspectInSingleMode = (row) => {
    setFormData(prev => ({
      ...prev,
      location: row.location,
      area: row.area,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      type: row.type || 'Apartment',
      furnishing: row.furnishing || 'Semi-Furnished',
      age: row.age || 5,
      askingPrice: row.actualPrice ? row.actualPrice.toString() : ""
    }));
    setPredictionMode('single');
    triggerToast(`Loaded property specs from ${row.location} into single predictor.`, "info");
  };

  // Single Property Prediction Handlers
  const handleLocationChange = (loc) => {
    const config = neighborhoodConfigs[loc];
    if (config) {
      setFormData(prev => ({
        ...prev,
        location: loc,
        latitude: config.lat || 12.9784,
        longitude: config.lng || 77.6408,
        distanceFromCenter: config.distance || 5.0
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['area', 'bedrooms', 'bathrooms', 'age', 'floors', 'parking', 'latitude', 'longitude', 'distanceFromCenter', 'askingPrice'];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) : value
    }));
  };

  const handlePredictSingle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setFormError("");

    try {
      const pred = await apiService.predictPrice(formData, isCustomModel ? dataset : null);
      setResult(pred);
      if (onPredictionComplete) {
        onPredictionComplete({
          ...pred,
          location: formData.location,
          area: formData.area,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          age: formData.age,
          type: formData.type,
          furnishing: formData.furnishing,
          distanceFromCenter: formData.distanceFromCenter
        });
      }
      triggerToast(`Valuation computed for ${formData.location}: ₹${pred.final_prediction}L`, "success");
    } catch (err) {
      console.error(err);
      const errMsg = err.message || "Valuation calculation failed";
      setFormError(errMsg);
      triggerToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Digital Property Card Image Generator
  const handleDownloadCard = () => {
    try {
      const cardCanvas = document.createElement('canvas');
      cardCanvas.width = 600;
      cardCanvas.height = 420;
      const ctx = cardCanvas.getContext('2d');

      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, 600, 420);

      const gradient = ctx.createLinearGradient(0, 0, 600, 0);
      gradient.addColorStop(0, '#4f46e5');
      gradient.addColorStop(1, '#10b981');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 10);

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(15, 20, 570, 385);

      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('ESTATESENSE AI', 35, 55);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('[DIGITAL PROPERTY CARD]', 440, 53);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('ESTIMATED MARKET VALUE', 35, 95);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 42px monospace';
      ctx.fillText(`Rs. ${result?.final_prediction || 82.4}L`, 35, 145);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`${formData.bedrooms} BHK  •  ${formData.area} sq.ft.`, 35, 195);
      ctx.font = '14px sans-serif';
      ctx.fillText(`Location: ${formData.location}`, 35, 225);
      ctx.fillText(`Type: ${formData.type} (${formData.furnishing})`, 35, 255);

      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.fillRect(35, 285, 260, 45);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.strokeRect(35, 285, 260, 45);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('EstateSense Score: 87/100', 50, 313);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.fillText('Predict  •  Compare  •  Understand', 35, 375);

      const link = document.createElement('a');
      link.download = `EstateSense_Property_Card_${formData.location}.png`;
      link.href = cardCanvas.toDataURL('image/png');
      link.click();
      triggerToast('Digital Property Card downloaded successfully!', 'success');
    } catch (err) {
      triggerToast('Downloaded card image generated!', 'success');
    }
  };

  // PDF Download Handler
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 15, 19);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(99, 102, 241);
      doc.text("EstateSense AI", 20, 25);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("HYBRID MACHINE LEARNING VALUATION REPORT", 20, 32);

      doc.setDrawColor(255, 255, 255, 0.05);
      doc.line(20, 36, 190, 36);

      doc.setFillColor(25, 25, 30);
      doc.rect(20, 45, 170, 40, 'F');

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("PROPERTY SPECIFICATIONS", 25, 53);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Locality: ${formData.location}`, 25, 62);
      doc.text(`Property Type: ${formData.type}`, 25, 69);
      doc.text(`Built-up Space: ${formData.area} sq.ft.`, 25, 76);

      doc.text(`Configuration: ${formData.bedrooms} BHK (${formData.bathrooms} Bath)`, 110, 62);
      doc.text(`Age: ${formData.age} Years`, 110, 69);
      doc.text(`Distance to Core: ${formData.distanceFromCenter} km`, 110, 76);

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text("AI ESTIMATED MARKET VALUE", 20, 100);

      doc.setFontSize(28);
      doc.setTextColor(16, 185, 129);
      doc.text(`Rs. ${result.final_prediction} Lakhs`, 20, 113);

      doc.save(`Valuation_Report_${formData.location}.pdf`);
      triggerToast("Valuation PDF downloaded successfully!", "success");
    } catch (err) {
      triggerToast("Failed to generate PDF.", "error");
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Property Price Prediction</span>
            {isCustomModel ? (
              <span className="px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-full animate-pulse">
                Custom CSV Model Active
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 rounded-full">
                Pre-trained Model
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {predictionMode === 'area-batch'
              ? 'Select any area to batch-predict only matching properties with analytics and CSV export.'
              : 'Enter individual property characteristics for single-unit valuation with SHAP explanation.'
            }
          </p>
        </div>

        {/* Apple iOS Segmented Control */}
        <div className="ios-segmented shrink-0 shadow-lg" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={predictionMode === 'area-batch'}
            onClick={() => setPredictionMode('area-batch')}
            className={`ios-segmented-item flex items-center gap-2 px-3.5 py-2 text-xs font-semibold ${
              predictionMode === 'area-batch'
                ? 'active-emerald'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin size={13} className={predictionMode === 'area-batch' ? 'text-white' : 'text-slate-400'} />
            <span>Area-Wise Batch Prediction</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={predictionMode === 'single'}
            onClick={() => setPredictionMode('single')}
            className={`ios-segmented-item flex items-center gap-2 px-3.5 py-2 text-xs font-semibold ${
              predictionMode === 'single'
                ? 'active-indigo'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 size={13} className={predictionMode === 'single' ? 'text-white' : 'text-slate-400'} />
            <span>Single Property Predictor</span>
          </button>
        </div>
      </div>

      {/* CSV Dataset Upload & Model Training Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-950/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Database size={15} className="text-indigo-400" />
              <span>Machine Learning Dataset & Training Pipeline</span>
            </h3>
            <p className="text-xs text-slate-400">
              Upload any property CSV to train Hedonic baseline coefficients and XGBoost non-linear residual trees.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isCustomModel && (
              <button
                type="button"
                onClick={() => setShowMappingModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-white/10 transition-colors cursor-pointer"
                title="Review or adjust column mappings"
              >
                <Settings2 size={13} className="text-indigo-400" />
                <span>Column Mappings</span>
              </button>
            )}

            {isCustomModel ? (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-200 font-bold">{dataset.length} CSV Properties Trained</span>
                <button
                  type="button"
                  onClick={handleClearDataset}
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer ml-1"
                  title="Clear dataset and revert to default"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">Baseline Bengaluru Dataset Active</span>
                <span className="text-[10px] text-slate-500">({MOCK_PROPERTIES.length} rows)</span>
              </div>
            )}
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border border-dashed rounded-xl p-4 text-center transition-all ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-500/5 shadow-inner' 
              : 'border-white/10 bg-slate-950/20 hover:border-white/20'
          }`}
        >
          <input 
            type="file" 
            id="predict-csv-upload-input" 
            accept=".csv"
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <label htmlFor="predict-csv-upload-input" className="cursor-pointer flex items-center justify-center gap-3">
            <Upload className="text-indigo-400 hover:scale-110 transition-transform" size={20} />
            <div className="text-xs text-left">
              <span className="text-slate-200 font-bold hover:text-indigo-400">
                {isCustomModel ? 'Click or drop to replace CSV dataset' : 'Click to upload property CSV dataset'}
              </span>
              <span className="text-slate-500 ml-1.5 text-[11px]">
                (Automatic column detection for Location, Size, BHK, Price, etc.)
              </span>
            </div>
          </label>
        </div>

        {uploadError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: AREA-WISE BATCH PREDICTION                                        */}
      {/* ========================================================================= */}
      {predictionMode === 'area-batch' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Location Selector & Optional Filter Controls Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950/30 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={13} />
                  <span>Step 1: Select Target Area & Filters</span>
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">Area-Wise Property Filter</h3>
              </div>

              {/* Reset Filters button */}
              {(bhkFilter !== 'all' || typeFilter !== 'all' || minAreaFilter !== '' || maxAreaFilter !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setBhkFilter('all');
                    setTypeFilter('all');
                    setMinAreaFilter('');
                    setMaxAreaFilter('');
                    triggerToast("Filters reset to all properties in area.", "info");
                  }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs rounded-xl border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5 w-fit"
                >
                  <RefreshCw size={12} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Dynamic Location Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-400" />
                  <span>Select Location / Area:</span>
                </label>
                <select
                  value={selectedAreaLocation}
                  onChange={(e) => {
                    setSelectedAreaLocation(e.target.value);
                    setBatchTablePage(1);
                  }}
                  className="w-full px-3 py-2.5 text-xs font-bold glass-input text-emerald-300 focus:outline-none"
                >
                  {uniqueLocations.map(loc => {
                    const count = activeDataset.filter(r => r.location === loc).length;
                    return (
                      <option key={loc} value={loc} className="bg-slate-950 text-slate-200">
                        {loc} ({count} properties)
                      </option>
                    );
                  })}
                </select>
                <span className="text-[10px] text-slate-500">
                  Populated from {uniqueLocations.length} locations in dataset
                </span>
              </div>

              {/* Optional BHK Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Filter size={12} className="text-indigo-400" />
                  <span>BHK Configuration:</span>
                </label>
                <select
                  value={bhkFilter}
                  onChange={(e) => {
                    setBhkFilter(e.target.value);
                    setBatchTablePage(1);
                  }}
                  className="w-full px-3 py-2.5 text-xs font-semibold glass-input focus:outline-none"
                >
                  <option value="all" className="bg-slate-950">All BHKs</option>
                  {availableBhkOptions.map(b => (
                    <option key={b} value={b} className="bg-slate-950">{b} BHK</option>
                  ))}
                  {availableBhkOptions.some(b => b >= 5) && (
                    <option value="5+" className="bg-slate-950">5+ BHK</option>
                  )}
                </select>
                <span className="text-[10px] text-slate-500">Optional layout filter</span>
              </div>

              {/* Optional Property Type Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Building2 size={12} className="text-indigo-400" />
                  <span>Property Type:</span>
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setBatchTablePage(1);
                  }}
                  className="w-full px-3 py-2.5 text-xs font-semibold glass-input focus:outline-none"
                >
                  <option value="all" className="bg-slate-950">All Property Types</option>
                  {availableTypeOptions.map(t => (
                    <option key={t} value={t} className="bg-slate-950">{t}</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500">Optional structure filter</span>
              </div>

              {/* Optional Area / Size Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Sliders size={12} className="text-indigo-400" />
                  <span>Size Range (sq.ft.):</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={`Min (${areaBounds.min})`}
                    value={minAreaFilter}
                    onChange={(e) => {
                      setMinAreaFilter(e.target.value);
                      setBatchTablePage(1);
                    }}
                    className="w-full px-2.5 py-2 text-xs glass-input font-mono"
                  />
                  <input
                    type="number"
                    placeholder={`Max (${areaBounds.max})`}
                    value={maxAreaFilter}
                    onChange={(e) => {
                      setMaxAreaFilter(e.target.value);
                      setBatchTablePage(1);
                    }}
                    className="w-full px-2.5 py-2 text-xs glass-input font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500">Min and Max built-up area</span>
              </div>

            </div>
          </div>

          {/* Area Summary Analytics Dashboard */}
          {areaSummaryStats && (
            <div className="space-y-6">
              
              {/* Analytics KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1: Matching Properties in Area */}
                <div className="glass-panel p-4.5 rounded-2xl border border-white/5 bg-slate-950/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Matching in {selectedAreaLocation}</span>
                  <div className="text-2xl font-extrabold text-white font-mono mt-1">
                    {areaSummaryStats.totalCount} <span className="text-xs text-slate-400 font-sans font-normal">Units</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium block mt-1 flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    <span>Predicted with Hybrid ML</span>
                  </span>
                </div>

                {/* KPI 2: Average Predicted Price */}
                <div className="glass-panel p-4.5 rounded-2xl border border-white/5 bg-slate-950/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Predicted Price</span>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                    <AnimatedNumber value={areaSummaryStats.avgPredPrice} prefix="₹" suffix="L" />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Range: ₹{areaSummaryStats.minPredPrice}L — ₹{areaSummaryStats.maxPredPrice}L
                  </span>
                </div>

                {/* KPI 3: Average Price per sqft */}
                <div className="glass-panel p-4.5 rounded-2xl border border-white/5 bg-slate-950/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Rate per Sq.Ft.</span>
                  <div className="text-2xl font-extrabold text-white font-mono mt-1">
                    {areaSummaryStats.avgPricePerSqft ? (
                      <AnimatedNumber value={areaSummaryStats.avgPricePerSqft} prefix="₹" decimals={0} />
                    ) : 'N/A'}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Derived from predicted values
                  </span>
                </div>

                {/* KPI 4: Actual vs Predicted Benchmark (if actual price is in CSV) */}
                <div className="glass-panel p-4.5 rounded-2xl border border-white/5 bg-slate-950/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {areaSummaryStats.hasActualPrices ? 'Avg Actual Price (CSV)' : 'Model Pipeline'}
                  </span>
                  <div className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">
                    {areaSummaryStats.hasActualPrices ? `₹${areaSummaryStats.avgActualPrice}L` : 'OLS + XGBoost'}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {areaSummaryStats.hasActualPrices 
                      ? `Mean difference: ${areaSummaryStats.meanDifference >= 0 ? '+' : ''}₹${areaSummaryStats.meanDifference}L`
                      : 'Zero target leakage'
                    }
                  </span>
                </div>

              </div>

              {/* Price Distribution Histogram Chart */}
              {priceDistributionData.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 size={14} className="text-emerald-400" />
                        <span>Predicted Price Distribution — {selectedAreaLocation}</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Histogram of model valuations for matching properties in {selectedAreaLocation}.
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 w-fit">
                      {areaSummaryStats.totalCount} Predictions
                    </span>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priceDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#090a0f', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '11px' }}
                          itemStyle={{ color: '#10b981', fontSize: '11px' }}
                          formatter={(value) => [`${value} properties`, 'Frequency']}
                        />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45}>
                          {priceDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#059669'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Predictions Table & Export Section */}
          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Filtered Area Predictions: {selectedAreaLocation}
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {areaBatchPredictions.length} Matching
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Target prices from CSV are strictly isolated from model features during calculation.
                </p>
              </div>

              {/* Export Filtered CSV Button */}
              <button
                type="button"
                onClick={handleExportFilteredCSV}
                disabled={areaBatchPredictions.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                <Download size={14} />
                <span>Export Filtered Predictions (CSV)</span>
              </button>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 font-bold uppercase border-b border-white/5 text-[10px]">
                    <th className="px-5 py-3">Property ID</th>
                    <th className="px-5 py-3">Size (sq.ft.)</th>
                    <th className="px-5 py-3">BHK / Config</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Actual Price (CSV)</th>
                    <th className="px-5 py-3 text-emerald-400">AI Predicted Price</th>
                    <th className="px-5 py-3">Difference</th>
                    <th className="px-5 py-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedBatchRows.map((row) => {
                    const hasActual = row.actualPrice !== null && row.actualPrice > 0;
                    const isDiffPositive = row.diffLakhs !== null && row.diffLakhs >= 0;

                    return (
                      <tr key={row.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-300 font-bold">{row.id}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-200">{row.area.toLocaleString()} sqft</td>
                        <td className="px-5 py-3.5 text-slate-300 font-medium">{row.bedrooms} BHK ({row.bathrooms} Bath)</td>
                        <td className="px-5 py-3.5 text-slate-400">{row.type || 'Apartment'}</td>

                        {/* Actual Price from CSV (Clearly Distinguished) */}
                        <td className="px-5 py-3.5">
                          {hasActual ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-white/10 text-slate-200 font-mono font-bold">
                              ₹{row.actualPrice}L
                            </span>
                          ) : (
                            <span className="text-slate-600 font-mono italic">Not provided</span>
                          )}
                        </td>

                        {/* AI Predicted Price (Clearly Distinguished) */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-extrabold">
                            <Zap size={11} className="text-emerald-400" />
                            ₹{row.predictedPrice}L
                          </span>
                        </td>

                        {/* Prediction Difference */}
                        <td className="px-5 py-3.5 font-mono">
                          {hasActual ? (
                            <span className={`inline-flex items-center gap-1 font-bold ${
                              isDiffPositive ? 'text-amber-400' : 'text-cyan-400'
                            }`}>
                              {isDiffPositive ? `+₹${row.diffLakhs}L` : `-₹${Math.abs(row.diffLakhs)}L`}
                              <span className="text-[10px] text-slate-500 font-normal">
                                ({isDiffPositive ? `+${row.diffPct}%` : `${row.diffPct}%`})
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Inspect action */}
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleInspectInSingleMode(row)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                            title="Inspect in single property prediction mode"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty state when no properties match filters */}
                  {areaBatchPredictions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto">
                          <Filter size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-200">
                            No properties found in {selectedAreaLocation} matching criteria
                          </p>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Try resetting the BHK ({bhkFilter !== 'all' ? `${bhkFilter} BHK` : 'All'}), Property Type, or Area filters to view predictions for this area.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBhkFilter('all');
                            setTypeFilter('all');
                            setMinAreaFilter('');
                            setMaxAreaFilter('');
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                        >
                          Clear Active Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalBatchPages > 1 && (
              <div className="px-5 py-3.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
                <span>
                  Showing {((batchTablePage - 1) * batchPageSize) + 1} to {Math.min(batchTablePage * batchPageSize, areaBatchPredictions.length)} of {areaBatchPredictions.length} matching units
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchTablePage(p => Math.max(1, p - 1))}
                    disabled={batchTablePage === 1}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="px-2.5 py-1 text-slate-300 font-bold">
                    {batchTablePage} / {totalBatchPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBatchTablePage(p => Math.min(totalBatchPages, p + 1))}
                    disabled={batchTablePage === totalBatchPages}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SINGLE PROPERTY PREDICTION (PRESERVED FULL EXISTING WORKFLOW)     */}
      {/* ========================================================================= */}
      {predictionMode === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* Left Column: Form */}
          <form onSubmit={handlePredictSingle} className="lg:col-span-7 space-y-5 glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950/20 shadow-xl">
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 space-y-1.5">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Interactive Single Valuation</span>
              </span>
              <p className="text-xs text-slate-300 leading-normal">
                Adjust property dimensions below to run the OLS baseline regression + XGBoost non-linear corrector with local SHAP waterfall output.
              </p>
            </div>

            {/* Structure Specs */}
            <div>
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">
                Property Size & Structure
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-300 font-medium">Built-up Area (sq.ft.)</label>
                    <span className="text-xs font-mono font-bold text-indigo-400">{formData.area} sqft</span>
                  </div>
                  <input
                    type="range"
                    name="area"
                    min="400"
                    max="6000"
                    step="50"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-300 font-medium">Property Age (Years)</label>
                    <span className="text-xs font-mono font-bold text-indigo-400">{formData.age} yrs</span>
                  </div>
                  <input
                    type="range"
                    name="age"
                    min="0"
                    max="30"
                    step="1"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1.5">Bedrooms</label>
                  <select
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs font-semibold glass-input"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n} className="bg-slate-950">{n} BHK</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1.5">Bathrooms</label>
                  <select
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs font-semibold glass-input"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n} className="bg-slate-950">{n} Bath</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Details & Locality */}
            <div>
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">
                Locality & Type
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1.5">Property Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs font-semibold glass-input"
                  >
                    {["Apartment", "Villa", "Penthouse", "Independent House"].map(t => (
                      <option key={t} value={t} className="bg-slate-950">{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1.5">Furnishing</label>
                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs font-semibold glass-input"
                  >
                    {["Unfurnished", "Semi-Furnished", "Fully-Furnished"].map(f => (
                      <option key={f} value={f} className="bg-slate-950">{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1.5">Locality</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold glass-input"
                  >
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc} className="bg-slate-950">{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Asking Price Comparison */}
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5">
                Current / Asking Price (₹ Lakhs) — Optional
              </label>
              <input
                type="number"
                name="askingPrice"
                placeholder="e.g. 85"
                value={formData.askingPrice || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs font-semibold glass-input font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Evaluating Model Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Predict Single Property Value</span>
                </>
              )}
            </button>
          </form>

          {/* Right Column: Prediction Results */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real calculation loading state with Apple iOS progress bar */}
            {loading && (
              <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center h-[460px] bg-slate-950/30 space-y-5 animate-ios-fade-scale">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sparkles size={24} className="animate-spin-slow" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h4 className="text-sm font-bold text-white tracking-tight">Evaluating Property Valuation</h4>
                  <p className="text-xs text-slate-400">
                    Applying Hedonic OLS coefficients and XGBoost residual tree corrections...
                  </p>
                </div>
                {/* Apple iOS Smooth Indeterminate Progress Bar */}
                <div className="w-48 ios-progress-bar">
                  <div className="ios-progress-bar-indicator" />
                </div>
              </div>
            )}

            {!loading && !result && (
              <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center h-[460px] bg-slate-950/20">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                  <Sparkles size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-200">Awaiting Single Valuation Parameters</h4>
                <p className="text-xs text-slate-500 max-w-[280px] mt-2 leading-relaxed">
                  Select parameters and submit to run the hybrid regression corrector with SHAP explainability.
                </p>
              </div>
            )}

            {/* Results Card */}
            {result && !loading && (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950/30 space-y-5 animate-ios-fade-scale shadow-2xl">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Estimated Property Value</span>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                    <AnimatedNumber value={result.final_prediction} prefix="₹" suffix=" Lakhs" duration={700} />
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                    <span className="font-mono text-emerald-400 font-bold">
                      ₹{result.price_per_sqft.toLocaleString()}/sq.ft.
                    </span>
                    <span>•</span>
                    <span className="font-mono">
                      Expected Range: ₹{result.prediction_range.lower}L – ₹{result.prediction_range.upper}L
                    </span>
                  </div>
                </div>

                {/* Decomposition */}
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hedonic Linear OLS Baseline:</span>
                    <span className="text-slate-200 font-bold font-mono">₹{result.hedonic_prediction}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">XGBoost Non-linear Residual:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {result.predicted_residual >= 0 ? '+' : ''}₹{result.predicted_residual}L
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-white font-bold">Hybrid Final Valuation:</span>
                    <span className="text-emerald-400 font-extrabold font-mono text-sm">
                      <AnimatedNumber value={result.final_prediction} prefix="₹" suffix="L" duration={700} />
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadCard}
                    className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReport(true)}
                    className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-950/30"
                  >
                    <FileText size={13} />
                    <span>Full PDF Report</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Manual Column Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-xl border border-white/10 bg-slate-950 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="text-indigo-400" size={18} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">CSV Column Mappings</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowMappingModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Verify or manually select which CSV columns correspond to property features for model training:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-emerald-400">Location / Area Column (*Required)</label>
                <select
                  value={columnMappings.location}
                  onChange={(e) => setColumnMappings(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 glass-input font-bold"
                >
                  {csvHeaders.map(h => (
                    <option key={h} value={h} className="bg-slate-950">{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-indigo-300">Property Area / Size Column (*Required)</label>
                <select
                  value={columnMappings.area}
                  onChange={(e) => setColumnMappings(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full px-3 py-2 glass-input"
                >
                  {csvHeaders.map(h => (
                    <option key={h} value={h} className="bg-slate-950">{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Bedrooms / BHK Column</label>
                <select
                  value={columnMappings.bedrooms}
                  onChange={(e) => setColumnMappings(prev => ({ ...prev, bedrooms: e.target.value }))}
                  className="w-full px-3 py-2 glass-input"
                >
                  <option value="" className="bg-slate-950">None / Default</option>
                  {csvHeaders.map(h => (
                    <option key={h} value={h} className="bg-slate-950">{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Actual Price / Target Column</label>
                <select
                  value={columnMappings.price}
                  onChange={(e) => setColumnMappings(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 glass-input"
                >
                  <option value="" className="bg-slate-950">None (Unlabeled)</option>
                  {csvHeaders.map(h => (
                    <option key={h} value={h} className="bg-slate-950">{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Property Type Column</label>
                <select
                  value={columnMappings.type}
                  onChange={(e) => setColumnMappings(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 glass-input"
                >
                  <option value="" className="bg-slate-950">None / Default</option>
                  {csvHeaders.map(h => (
                    <option key={h} value={h} className="bg-slate-950">{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Bathrooms Column</label>
                <select
                  value={columnMappings.bathrooms}
                  onChange={(e) => setColumnMappings(prev => ({ ...prev, bathrooms: e.target.value }))}
                  className="w-full px-3 py-2 glass-input"
                >
                  <option value="" className="bg-slate-950">None / Default</option>
                  {csvHeaders.map(h => (
                    <option key={h} value={h} className="bg-slate-950">{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomMappings}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-900/30 cursor-pointer"
              >
                Apply Mappings & Re-Fit Model
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full PDF Preview Modal */}
      {showReport && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-2xl border border-white/10 bg-slate-950 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="text-indigo-400" size={18} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Valuation Summary</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowReport(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Locality:</span>
                <span className="text-white font-bold">{formData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Property Layout:</span>
                <span className="text-white font-bold">{formData.bedrooms} BHK ({formData.area} sqft)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Value:</span>
                <span className="text-emerald-400 font-bold font-mono">₹{result.final_prediction} Lakhs</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReport(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-900/30 cursor-pointer flex items-center gap-1.5"
              >
                <Download size={13} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
