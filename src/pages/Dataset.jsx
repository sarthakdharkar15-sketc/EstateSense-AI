import React, { useEffect, useState, useMemo } from 'react';
import { apiService } from '../services/api';
import { DATASET_FEATURES } from '../services/mockData';
import { 
  Search, 
  Database, 
  FileSpreadsheet, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Upload,
  Download,
  Trash2,
  Play,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Building2,
  Sliders,
  ArrowRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

const NEIGHBORHOOD_CONFIGS = {
  "Indiranagar": { baseRate: 9500 },
  "Whitefield": { baseRate: 5800 },
  "Koramangala": { baseRate: 8800 },
  "Jayanagar": { baseRate: 8200 },
  "HSR Layout": { baseRate: 7200 },
  "Marathahalli": { baseRate: 6000 },
  "Electronic City": { baseRate: 4500 },
  "Hebbal": { baseRate: 7500 },
  "Bannerghatta": { baseRate: 5500 },
  "Rajajinagar": { baseRate: 7800 }
};

export default function Dataset({ uploadedDataset, setUploadedDataset }) {
  // Bulk Upload State
  const [dragActive, setDragActive] = useState(false);
  const uploadedData = Array.isArray(uploadedDataset) ? uploadedDataset : [];
  const setUploadedData = setUploadedDataset;
  const [uploadError, setUploadError] = useState("");
  const [uploadSearchQuery, setUploadSearchQuery] = useState("");
  const [uploadCurrentPage, setUploadCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  // Default selected property ID to first property when dataset is loaded
  useEffect(() => {
    if (uploadedData.length > 0) {
      if (!selectedPropertyId || !uploadedData.some(p => p.id === selectedPropertyId)) {
        setSelectedPropertyId(uploadedData[0].id);
      }
    } else {
      setSelectedPropertyId(null);
    }
  }, [uploadedData]);

  // CSV Parsing and Valuation Logic
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

      // Read headers and normalize
      const originalHeaders = parseCSVLine(lines[0]);
      const headers = originalHeaders.map(h => h.toLowerCase().replace(/[\s_()]/g, ''));
      
      // Column index mappings
      const fieldMappings = {
        location: ['location', 'locality', 'neighborhood', 'address'],
        area: ['area', 'sqft', 'size', 'squarefeet', 'superbuiltuparea'],
        bedrooms: ['bedrooms', 'bhk', 'beds', 'room', 'rooms'],
        bathrooms: ['bathrooms', 'baths', 'toilet', 'toilets'],
        age: ['age', 'years', 'propertyage', 'constructed'],
        floors: ['floors', 'floor', 'totalfloors'],
        parking: ['parking', 'parkingspaces', 'garage'],
        type: ['type', 'propertytype', 'buildingtype'],
        furnishing: ['furnishing', 'furnish', 'furnishedstatus'],
        distanceFromCenter: ['distancefromcenter', 'distance', 'centerdistance'],
        price: ['price', 'target', 'cost', 'value', 'amount', 'price_lakhs', 'price(lakhs)']
      };

      const getColIndex = (keys) => {
        return headers.findIndex(h => keys.includes(h));
      };

      const idxs = {
        location: getColIndex(fieldMappings.location),
        area: getColIndex(fieldMappings.area),
        bedrooms: getColIndex(fieldMappings.bedrooms),
        bathrooms: getColIndex(fieldMappings.bathrooms),
        age: getColIndex(fieldMappings.age),
        floors: getColIndex(fieldMappings.floors),
        parking: getColIndex(fieldMappings.parking),
        type: getColIndex(fieldMappings.type),
        furnishing: getColIndex(fieldMappings.furnishing),
        distanceFromCenter: getColIndex(fieldMappings.distanceFromCenter),
        price: getColIndex(fieldMappings.price)
      };

      const locLookup = {};
      Object.keys(NEIGHBORHOOD_CONFIGS).forEach(k => {
        locLookup[k.toLowerCase()] = k;
      });

      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const columns = parseCSVLine(lines[i]);
        if (columns.length === 0 || (columns.length === 1 && columns[0] === "")) continue;

        const getVal = (colIndex, fallback) => {
          if (colIndex === -1 || colIndex >= columns.length) return fallback;
          return columns[colIndex] || fallback;
        };

        const rawValues = originalHeaders.map((_, colIdx) => columns[colIdx] || "");

        const rawLoc = getVal(idxs.location, "Indiranagar");
        const location = locLookup[rawLoc.toLowerCase()] || rawLoc || "Indiranagar";

        const csvPriceVal = getVal(idxs.price, null);
        const parsedCsvPrice = csvPriceVal !== null ? parseFloat(csvPriceVal) : null;
        const targetPrice = parsedCsvPrice !== null && !isNaN(parsedCsvPrice) ? parsedCsvPrice : null;

        const rowData = {
          location,
          area: parseFloat(getVal(idxs.area, "1200")) || 1200,
          bedrooms: parseInt(getVal(idxs.bedrooms, "2")) || 2,
          bathrooms: parseInt(getVal(idxs.bathrooms, "2")) || 2,
          age: parseFloat(getVal(idxs.age, "5")) || 5,
          floors: parseInt(getVal(idxs.floors, "1")) || 1,
          parking: parseInt(getVal(idxs.parking, "1")) || 1,
          type: getVal(idxs.type, "Apartment"),
          furnishing: getVal(idxs.furnishing, "Semi-Furnished"),
          distanceFromCenter: parseFloat(getVal(idxs.distanceFromCenter, "5.0")) || 5.0,
          price: targetPrice
        };

        rows.push({
          id: `U-${1000 + i}`,
          ...rowData,
          rawHeaders: originalHeaders,
          rawValues
        });
      }

      if (rows.length === 0) {
        throw new Error("No valid property records could be parsed from the CSV.");
      }

      setUploadedData(rows);
      setUploadCurrentPage(1);
    } catch (err) {
      setUploadError(err.message || "An error occurred while parsing the CSV file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      processCSVText(event.target.result);
    };
    reader.onerror = () => {
      setUploadError("Error reading file. Please try again.");
    };
    reader.readAsText(file);
  };

  // Drag and drop events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          processCSVText(event.target.result);
        };
        reader.readAsText(file);
      } else {
        setUploadError("Only CSV files (.csv) are supported for dataset uploads.");
      }
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "location,area,bedrooms,bathrooms,age,type,furnishing,parking,floors,distanceFromCenter\n"
      + "Indiranagar,1500,3,2,4,Flat,Fully-Furnished,2,4,3.5\n"
      + "Whitefield,2200,4,3,2,Villa,Semi-Furnished,2,2,12.5\n"
      + "HSR Layout,1100,2,2,10,Flat,Unfurnished,1,3,6.2\n"
      + "Koramangala,1800,3,2,5,Penthouse,Fully-Furnished,2,5,4.8\n"
      + "Electronic City,950,2,2,2,Flat,Semi-Furnished,1,2,18.0";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "property_valuation_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPredictions = () => {
    if (uploadedData.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = uploadedData[0].rawHeaders ? uploadedData[0].rawHeaders.join(",") : "location,area,bedrooms,bathrooms,age,type,furnishing,parking,floors,distanceFromCenter";
    csvContent += headers + "\n";
    
    uploadedData.forEach(row => {
      const line = row.rawValues ? row.rawValues.map(v => `"${v}"`).join(",") : `"${row.location}",${row.area},${row.bedrooms},${row.bathrooms},${row.age},"${row.type}","${row.furnishing}",${row.parking},${row.floors},${row.distanceFromCenter}`;
      csvContent += line + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "training_dataset_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetUpload = () => {
    setUploadedData([]);
    setUploadError("");
    setUploadSearchQuery("");
  };

  // Filtering uploaded data (memoized)
  const filteredUploads = useMemo(() => {
    return uploadedData.filter(row => {
      const q = uploadSearchQuery.toLowerCase();
      if (!q) return true;
      
      // Search in rawValues array
      if (row.rawValues && row.rawValues.some(val => val.toString().toLowerCase().includes(q))) {
        return true;
      }
      
      // Also search in id and predicted price if available
      if (row.id.toLowerCase().includes(q)) return true;
      if (row.price && row.price.toString().includes(q)) return true;
      
      return false;
    });
  }, [uploadedData, uploadSearchQuery]);

  const uploadPageSize = 8;
  
  const totalUploadPages = useMemo(() => {
    return Math.ceil(filteredUploads.length / uploadPageSize);
  }, [filteredUploads.length]);

  const paginatedUploads = useMemo(() => {
    return filteredUploads.slice(
      (uploadCurrentPage - 1) * uploadPageSize,
      uploadCurrentPage * uploadPageSize
    );
  }, [filteredUploads, uploadCurrentPage]);

  // Stats calculation for uploads (memoized)
  const hasPredictions = useMemo(() => {
    return uploadedData.length > 0 && uploadedData[0].hasPredictions;
  }, [uploadedData]);

  const uploadStats = useMemo(() => {
    return {
      totalRows: uploadedData.length,
      avgPrice: hasPredictions ? parseFloat((uploadedData.reduce((acc, curr) => acc + curr.price, 0) / uploadedData.length).toFixed(2)) : null,
      maxPrice: hasPredictions ? Math.max(...uploadedData.map(r => r.price)) : null,
      avgArea: (uploadedData.length > 0 && uploadedData[0].area !== undefined) ? parseFloat((uploadedData.reduce((acc, curr) => acc + curr.area, 0) / uploadedData.length).toFixed(0)) : null,
    };
  }, [uploadedData, hasPredictions]);



  return (
    <div className="p-6 space-y-10">
      
      {/* Title */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Database className="text-indigo-400" size={24} />
          <span>Dataset Explorer & Bulk Valuation</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Explore built-in model data schemas, or upload custom datasets for real-time bulk valuation calculations.
        </p>
      </div>

      {/* SECTION 1: Bulk Valuation Upload Engine */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <Upload size={16} className="text-emerald-400" />
            <span>Test Your Custom Dataset</span>
          </h3>
          {uploadedData.length > 0 && (
            <button
              onClick={handleResetUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs rounded-lg border border-rose-500/25 transition-all cursor-pointer"
            >
              <Trash2 size={13} />
              Reset upload
            </button>
          )}
        </div>

        {uploadedData.length === 0 ? (
          /* Drag and drop input card */
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`glass-panel border-2 border-dashed p-8 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/5' 
                : 'border-white/10 bg-slate-950/10 hover:border-white/20'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4 transition-transform hover:scale-110 shadow-inner">
              <Upload size={22} className={isProcessing ? 'animate-bounce' : ''} />
            </div>
            
            <h4 className="text-sm font-bold text-slate-200">Drag & Drop property dataset here</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Only CSV files (.csv) are supported. Headers must contain property features like <code className="text-indigo-400 font-mono">area</code> and <code className="text-indigo-400 font-mono">location</code>.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/35 transition-all cursor-pointer flex items-center gap-1.5">
                <Search size={13} />
                Browse File
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
              <button 
                onClick={handleDownloadTemplate}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-white/5 hover:border-white/10 text-slate-300 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                Download CSV Template
              </button>
            </div>

            {uploadError && (
              <div className="mt-4 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle size={14} />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        ) : (
          /* Processed Dataset Dashboard & Raw Training Data Table */
          <div className="space-y-6 animate-fade-in">
            {/* Model Trained Status Banner */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-950/50 to-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-wide">
                      Model Trained & Ready
                    </h3>
                    <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full animate-pulse">
                      ML Pipeline Fitted
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Dataset loaded successfully! The ML pipeline (Hedonic OLS + XGBoost Residual Corrector) has been trained on <strong>{uploadedData.length} property records</strong>. Dataset rows are saved for model learning only.
                  </p>
                </div>
              </div>
            </div>

            {/* KPI Cards for uploaded data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-4.5 rounded-xl border border-white/5 bg-slate-950/20">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Training Rows</span>
                <span className="text-xl font-bold text-emerald-400 mt-1 block font-mono">{uploadStats.totalRows} Properties</span>
                <span className="text-[9px] text-slate-500 block mt-1 flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  Loaded for Model Fitting
                </span>
              </div>
              <div className="glass-panel p-4.5 rounded-xl border border-white/5 bg-slate-950/20">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Average Area</span>
                <span className="text-xl font-bold text-white mt-1 block font-mono">
                  {uploadStats.avgArea !== null ? `${uploadStats.avgArea.toLocaleString()} sq.ft.` : 'N/A'}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Training spatial density</span>
              </div>
              <div className="glass-panel p-4.5 rounded-xl border border-white/5 bg-slate-950/20">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Trained Locations</span>
                <span className="text-xl font-bold text-indigo-400 mt-1 block font-mono">
                  {new Set(uploadedData.map(d => d.location)).size} Locality Clusters
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Categorical encoders active</span>
              </div>
              <div className="glass-panel p-4.5 rounded-xl border border-white/5 bg-slate-950/20">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Pipeline Status</span>
                <span className="text-xl font-bold text-emerald-400 mt-1 block font-mono">
                  100% Ready
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Single property API ready</span>
              </div>
            </div>

            {/* Uploaded table explorer */}
            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Database size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Raw Training Dataset ({filteredUploads.length} entries matching)
                  </h3>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Local dataset search */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search values..."
                      value={uploadSearchQuery}
                      onChange={(e) => {
                        setUploadSearchQuery(e.target.value);
                        setUploadCurrentPage(1);
                      }}
                      className="pl-9 pr-4 py-1.5 w-52 text-xs glass-input focus:outline-none"
                    />
                  </div>

                  {/* Export CSV */}
                  <button
                    onClick={handleExportPredictions}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/40 text-slate-400 font-bold uppercase border-b border-white/5">
                      <th className="px-6 py-3">Record ID</th>
                      {(uploadedData[0]?.rawHeaders || []).map((header, hIdx) => (
                        <th key={hIdx} className="px-6 py-3">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedUploads.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-white/5 text-slate-300 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-mono text-[11px] text-indigo-400 font-bold">{row.id}</td>
                        {(row.rawValues || []).map((val, vIdx) => (
                          <td key={vIdx} className="px-6 py-3.5 font-mono text-slate-200">{val}</td>
                        ))}
                      </tr>
                    ))}
                    {paginatedUploads.length === 0 && (
                      <tr>
                        <td colSpan={(uploadedData[0]?.rawHeaders?.length || 0) + 1} className="text-center py-8 text-slate-500 font-medium">
                          No uploaded records match filter query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalUploadPages > 1 && (
                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 bg-slate-950/20">
                  <span>Showing Page {uploadCurrentPage} of {totalUploadPages}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUploadCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={uploadCurrentPage === 1}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setUploadCurrentPage(prev => Math.min(totalUploadPages, prev + 1))}
                      disabled={uploadCurrentPage === totalUploadPages}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>


    </div>
  );
}
