import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Database,
  Workflow,
  ArrowRightLeft,
  Layers,
  CheckCircle2,
  Loader2
} from 'lucide-react';

/* ─── Diagram definitions ─── */
const DIAGRAMS = [
  {
    id: 'usecase',
    title: '1. Use Case Diagram',
    icon: Layers,
    color: 'indigo',
    description:
      'Illustrates the interactions between system actors (User/Member and Administrator) and the various functionalities provided by the application.',
    bullets: [
      '<strong>Register & Authenticate:</strong> Users can create an account and log in. Administrators have elevated roles.',
      '<strong>View Project Dashboard:</strong> Displays performance curves, global feature importance charts, and key stats.',
      '<strong>Predict House Price:</strong> Input area, bedrooms, bathrooms, location, age, parking, type, and furnishing to get valuations.',
      '<strong>Interpret Local SHAP Explanations:</strong> Explains why the prediction was made, breaking down each feature\'s contribution.',
      '<strong>Explore Spatial Map Analysis:</strong> Geographically plotted properties on the Bengaluru city map with filters.',
      '<strong>Compare Model Performance:</strong> Views metrics (MAE, RMSE, R², MAPE) of baseline vs. ML models.',
      '<strong>Upload Custom Dataset (Admin):</strong> Upload custom property CSV files to fit the prediction model.',
      '<strong>Train/Retrain Model (Admin):</strong> Dynamically recalculates regression weights, coefficients, and metrics.',
    ],
    code: `graph TD
    classDef actor fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef userCase fill:#1e293b,stroke:#10b981,stroke-width:1.5px,color:#f8fafc;
    classDef adminCase fill:#1e1b4b,stroke:#8b5cf6,stroke-width:1.5px,color:#f8fafc;

    subgraph Actors["System Actors"]
        User((User / Member)):::actor
        Admin((Administrator)):::actor
    end

    subgraph CorePlatform["Core Valuation Platform"]
        UC1([1. Register & Authenticate]):::userCase
        UC2([2. Predict Property Price]):::userCase
        UC3([3. Explainable AI SHAP]):::userCase
        UC4([4. Spatial GIS Map Analysis]):::userCase
        UC5([5. Compare Model Performance]):::userCase
    end

    subgraph AdminModule["Admin & Machine Learning Operations"]
        UC6([6. Upload Custom Property CSV]):::adminCase
        UC7([7. Dynamically Fit & Train Model]):::adminCase
        UC8([8. Real-Time Cross Validation]):::adminCase
        UC9([9. Configure Latency & Benchmarks]):::adminCase
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5

    Admin --> User
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9`,
  },
  {
    id: 'er',
    title: '2. Entity-Relationship Model (ER Model)',
    icon: Database,
    color: 'emerald',
    description:
      'Defines the schema structures and relationships of the logical entities managed in localStorage and runtime states.',
    bullets: [
      '<strong>USER:</strong> Handles authentication and role-based privileges (Administrator vs. Member).',
      '<strong>PROPERTY:</strong> Represents real estate instances capturing physical dimensions, geographic features, and ML prices.',
      '<strong>NEIGHBORHOOD_CONFIG:</strong> Stores baseline parameters for location-based valuation.',
      '<strong>PREDICTION_RESULT & SHAP_VALUE:</strong> Stores transaction inputs along with generated regression components and SHAP impact values.',
    ],
    code: `erDiagram
    USER ||--o{ PREDICTION_RESULT : performs
    USER ||--o{ PROPERTY : uploads
    NEIGHBORHOOD_CONFIG ||--o{ PROPERTY : configures
    PREDICTION_RESULT ||--|{ SHAP_VALUE : generates

    USER {
        int id PK
        string name
        string role
        string token
    }
    PROPERTY {
        int id PK
        int area
        int bedrooms
        int age
        string type
        string location FK
        float price
        float hedonicPrice
        float residual
    }
    NEIGHBORHOOD_CONFIG {
        string location PK
        int baseRate
        float lat
        float lng
        float distance
    }
    PREDICTION_RESULT {
        int prediction_id PK
        int user_id FK
        float final_prediction
        float lower_bound
        float upper_bound
        string explanation
    }
    SHAP_VALUE {
        int id PK
        int prediction_id FK
        string feature_name
        float contribution_value
    }`,
  },
  {
    id: 'dfd',
    title: '3. Data Flow Diagram (DFD) — Level 1',
    icon: ArrowRightLeft,
    color: 'cyan',
    description:
      'Shows how information moves from external sources (User and Admin) through processes, gets read/written to stores, and renders back to the user.',
    bullets: [
      '<strong>P1 (Authentication):</strong> Validates credentials against the local storage user record.',
      '<strong>P2 (Predictor Engine):</strong> Uses regression baselines adjusted by categorical bonuses and an XGBoost/KNN-based residual helper.',
      '<strong>P3 (SHAP Calculator):</strong> Distributes prediction variance relative to dataset base rate across features.',
      '<strong>P5 (Model Training):</strong> Dynamically calculates covariances and slopes when a custom dataset is uploaded.',
    ],
    code: `graph TD
    classDef entity fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef process fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc;
    classDef store fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;

    User[User / Administrator]:::entity

    subgraph Processes["Core Processing Engine"]
        P1(P1: Authenticate User & Admin):::process
        P2(P2: Predict Price & Residuals):::process
        P3(P3: Local SHAP Explanations):::process
        P4(P4: Spatial GIS Clustering):::process
        P5(P5: Re-train Model & Coefficients):::process
    end

    subgraph DataStores["Storage Systems"]
        D1[(D1: User Accounts Store)]:::store
        D2[(D2: Properties & Baseline Store)]:::store
        D3[(D3: Neighborhoods & Rates Store)]:::store
        D4[(D4: Performance & Logs Store)]:::store
    end

    User -->|Credentials| P1
    P1 <-->|Read/Write Auth| D1

    User -->|Property Details| P2
    P2 <-->|Fetch Baselines| D2
    P2 <-->|Fetch Coefficients| D3
    P2 -->|Hedonic & ML Estimate| User

    P2 -->|Error Residuals| P3
    P3 -->|SHAP Waterfall Values| User

    User -->|Spatial Filters| P4
    P4 <-->|Geo Lat/Lng Records| D2

    User -->|Custom CSV| P5
    P5 -->|Update Regression Weights| D3
    P5 -->|Update Metrics| D4`,
  },
  {
    id: 'cfd',
    title: '4. Control Flow Diagram (CFD)',
    icon: Workflow,
    color: 'violet',
    description:
      'Charts decisions, function routing, and visual conditional renderings across different views and user interactions.',
    bullets: [
      'Auth flow: login → credential validation → session creation → dashboard render.',
      'Prediction flow: form inputs → validation → ML calculation → SHAP generation → results display.',
      'Spatial flow: map filters → coordinate query → Leaflet marker update.',
      'Dataset flow: CSV upload → parsing → model retraining → coefficient update.',
    ],
    code: `graph TD
    classDef startNode fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef routerNode fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc;
    classDef stepNode fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc;
    classDef actionNode fill:#064e3b,stroke:#10b981,stroke-width:1.5px,color:#f8fafc;

    Start([App Initialized & Check Auth]):::startNode --> Router{Module Router}:::routerNode

    subgraph Pipe1["1. Prediction Pipeline"]
        Router --> P_In[Input Form Parameters]:::stepNode
        P_In --> P_Val{Validate Inputs}
        P_Val -->|Valid| P_Compute[Compute Hedonic + ML Residual]:::actionNode
        P_Compute --> P_SHAP[Generate Local SHAP Values]:::actionNode
        P_SHAP --> P_Out[Render Price & Waterfall Cards]:::stepNode
    end

    subgraph Pipe2["2. Spatial GIS Pipeline"]
        Router --> S_Filter[Apply Map Filters]:::stepNode
        S_Filter --> S_Query[Query Geo Coordinates]:::actionNode
        S_Query --> S_Map[Update Leaflet Marker Scatter]:::stepNode
    end

    subgraph Pipe3["3. Dataset & Retraining Pipeline"]
        Router --> D_Upload[Admin Uploads CSV]:::stepNode
        D_Upload --> D_Parse[Parse Dataset Rows]:::actionNode
        D_Parse --> D_Fit[trainModelOnDataset]:::actionNode
        D_Fit --> D_Metrics[Update R2, RMSE & Weights]:::stepNode
    end`,
  },
  {
    id: 'std',
    title: '5. State Transition Diagram (STD)',
    icon: GitBranch,
    color: 'rose',
    description:
      'Outlines how pages and processing cycles transition in response to user inputs and React lifecycle hooks.',
    bullets: [
      'LoggedOut → Authenticating → LoggedIn on successful credential validation.',
      'PredictPage: Idle → Processing → Complete → Idle (reset).',
      'DatasetPage (Admin): Idle → Uploading → Retraining → CrossValidating → Idle.',
      'Logout clears localStorage session and returns to LoggedOut state.',
    ],
    code: `stateDiagram-v2
    [*] --> LoggedOut
    LoggedOut --> LoggedIn : Authenticate Success
    LoggedIn --> LoggedOut : Logout / Clear Session

    state LoggedIn {
        [*] --> DashboardView
        
        DashboardView --> PredictPipeline : Select Predict
        state PredictPipeline {
            [*] --> FormIdle
            FormIdle --> Computing : Click Predict
            Computing --> ValuationReady : Compute Hedonic + Residual + SHAP
            ValuationReady --> FormIdle : Reset / Modify
        }
        PredictPipeline --> DashboardView : Return to Dashboard

        DashboardView --> SpatialMap : Select Spatial GIS
        SpatialMap --> DashboardView : Return to Dashboard

        DashboardView --> DatasetTraining : Upload CSV (Admin)
        state DatasetTraining {
            [*] --> CSVReady
            CSVReady --> RetrainingModel : Parse Rows
            RetrainingModel --> MetricsUpdated : Save Coefficients
        }
        DatasetTraining --> DashboardView : Return to Dashboard
    }`,
  },
];

const COLOR_MAP = {
  indigo: { badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25', dot: 'bg-indigo-400', glow: 'hover:border-indigo-500/40 hover:shadow-indigo-500/10' },
  emerald: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25', dot: 'bg-emerald-400', glow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10' },
  cyan: { badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25', dot: 'bg-cyan-400', glow: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10' },
  violet: { badge: 'bg-violet-500/15 text-violet-300 border-violet-500/25', dot: 'bg-violet-400', glow: 'hover:border-violet-500/40 hover:shadow-violet-500/10' },
  rose: { badge: 'bg-rose-500/15 text-rose-300 border-rose-500/25', dot: 'bg-rose-400', glow: 'hover:border-rose-500/40 hover:shadow-rose-500/10' },
};

/* ─── Mermaid diagram renderer (loads CDN once) ─── */
let mermaidLoaded = false;
let mermaidLoading = false;
const mermaidCallbacks = [];

function loadMermaid(cb) {
  if (mermaidLoaded) { cb(); return; }
  mermaidCallbacks.push(cb);
  if (mermaidLoading) return;
  mermaidLoading = true;
  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = `
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    window.__mermaid__ = mermaid;
    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
    window.dispatchEvent(new Event('mermaid-ready'));
  `;
  document.head.appendChild(script);
  window.addEventListener('mermaid-ready', () => {
    mermaidLoaded = true;
    mermaidCallbacks.forEach(fn => fn());
  }, { once: true });
}

function MermaidChart({ code, id }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMermaid(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !ref.current || !window.__mermaid__) return;
    ref.current.innerHTML = '';
    window.__mermaid__.render(`mermaid-${id}-${Date.now()}`, code)
      .then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
          const svgEl = ref.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
            svgEl.removeAttribute('height');
            svgEl.classList.add('report-svg');
          }
        }
      })
      .catch(e => setError(String(e)));
  }, [ready, code, id]);

  if (error) return (
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
      ⚠ Diagram render error: {error}
    </div>
  );

  if (!ready) return (
    <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-xs">
      <Loader2 size={16} className="animate-spin" />
      <span>Loading Mermaid renderer…</span>
    </div>
  );

  return (
    <div
      ref={ref}
      className="w-full flex justify-center items-center overflow-visible"
      style={{ minHeight: 120 }}
    />
  );
}

/* ─── Main Page ─── */
export default function SystemReport() {
  const [expanded, setExpanded] = useState({});
  const [printing, setPrinting] = useState(false);
  const reportRef = useRef(null);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  /* PDF via browser print — most reliable, no extra deps */
  const handlePrint = () => {
    setExpanded({
      usecase: true,
      er: true,
      dfd: true,
      cfd: true,
      std: true
    });
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 450);
  };

  /* Download as standalone HTML (same as the existing file) */
  const handleDownloadHTML = () => {
    const link = document.createElement('a');
    link.href = '/system_diagrams_report.html';
    link.download = 'EstateSense_System_Diagrams_Report.html';
    link.click();
  };

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          /* Hide non-printable app shell elements */
          aside,
          header,
          footer,
          nav,
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Reset all parent layout containers so pages break naturally without clipping */
          html, body, #root, #root > div, main, .flex-1, .animate-page-transition {
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            display: block !important;
            position: static !important;
            transform: none !important;
            animation: none !important;
          }

          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }

          /* Force all diagram content to be block and visible in print */
          .diagram-content {
            display: block !important;
            visibility: visible !important;
          }

          /* Header card as clean cover/intro */
          .report-header-card {
            background: #f8fafc !important;
            border: 1.5px solid #cbd5e1 !important;
            color: #0f172a !important;
            page-break-after: always !important;
            break-after: page !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            padding: 24px !important;
          }

          /* Section panel */
          .glass-panel {
            background: #ffffff !important;
            border: 1.5px solid #cbd5e1 !important;
            box-shadow: none !important;
            border-radius: 12px !important;
            margin-bottom: 24px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-page-break {
            page-break-before: always !important;
            break-before: page !important;
          }

          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Diagram container */
          .diagram-canvas-box {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            padding: 14px !important;
            margin: 12px 0 16px 0 !important;
            overflow: visible !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Responsive SVG scaling */
          .diagram-canvas-box svg,
          svg.report-svg {
            max-width: 100% !important;
            width: 100% !important;
            height: auto !important;
            max-height: 430px !important;
            display: block !important;
            margin: 0 auto !important;
            overflow: visible !important;
          }

          h1, h2, h3, h4 {
            color: #0f172a !important;
          }

          p, li, span, strong {
            color: #334155 !important;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 md:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-page-transition" ref={reportRef}>

        {/* ── Header ── */}
        <div className="glass-panel report-header-card rounded-3xl p-4 sm:p-8 md:p-10 border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/8 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/8 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <FileText size={13} />
                System Design Report
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                House Price Prediction
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-teal-400">
                  System Design Diagrams
                </span>
              </h1>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                Full system architecture including Use Case, ER Model, DFD Level 1, Control Flow, and State Transition diagrams for the Hedonic + XGBoost hybrid valuation platform.
              </p>
              {/* Quick stats */}
              <div className="flex flex-wrap gap-3 pt-1">
                {['5 Diagrams', 'Mermaid.js', 'Hedonic + XGBoost', 'SHAP Explainability'].map(tag => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="no-print flex flex-col gap-3 shrink-0">
              <button
                onClick={handlePrint}
                disabled={printing}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
              >
                {printing ? <Loader2 size={15} className="animate-spin" /> : <Printer size={15} />}
                {printing ? 'Preparing…' : 'Print / Save as PDF'}
              </button>
              <button
                onClick={handleDownloadHTML}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-200 font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Download size={15} />
                Download HTML Report
              </button>
            </div>
          </div>
        </div>

        {/* ── Table of Contents ── */}
        <div className="no-print glass-panel rounded-2xl p-5 border border-white/[0.08]">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Table of Contents</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {DIAGRAMS.map((d) => {
              const Icon = d.icon;
              const colors = COLOR_MAP[d.color];
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    document.getElementById(`section-${d.id}`)?.scrollIntoView({ behavior: 'smooth' });
                    setExpanded(prev => ({ ...prev, [d.id]: true }));
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] transition-all text-left cursor-pointer group"
                >
                  <Icon size={14} className="text-slate-400 group-hover:text-slate-200 transition-colors shrink-0" />
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors truncate">{d.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Diagram Sections ── */}
        {DIAGRAMS.map((diagram, idx) => {
          const Icon = diagram.icon;
          const colors = COLOR_MAP[diagram.color];
          const isOpen = expanded[diagram.id] !== false; // default open

          return (
            <section
              key={diagram.id}
              id={`section-${diagram.id}`}
              className={`glass-panel rounded-3xl border border-white/[0.08] overflow-hidden transition-all duration-300 ${colors.glow} hover:shadow-2xl hover:-translate-y-0.5 print-page-break print-avoid-break`}
            >
              {/* Section header: visible in web & print, only chevron hidden in print */}
              <div className="w-full flex items-center justify-between p-6 md:p-8 text-left border-b border-white/[0.04] print:border-slate-200 print:p-4">
                <div 
                  onClick={() => toggle(diagram.id)}
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.badge} border print:hidden`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white tracking-tight print:text-slate-900 print:text-base">{diagram.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-lg print:text-slate-600">{diagram.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggle(diagram.id)}
                  className="no-print shrink-0 ml-4 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-slate-400"
                >
                  {isOpen
                    ? <ChevronUp size={18} />
                    : <ChevronDown size={18} />
                  }
                </button>
              </div>

              {/* Always visible in print, togglable in UI */}
              <div className={`${isOpen ? 'block' : 'hidden'} print:!block diagram-content`}>
                {/* Diagram render area */}
                <div className="diagram-canvas-box mx-6 md:mx-8 mb-6 bg-slate-950/70 rounded-2xl border border-white/[0.06] p-4 md:p-6 min-h-[180px] flex items-center justify-center overflow-x-auto print:overflow-visible">
                  <MermaidChart code={diagram.code} id={diagram.id} />
                </div>

                {/* Description bullets */}
                <div className="px-6 md:px-8 pb-8 print:pb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 print:text-slate-700">
                    <CheckCircle2 size={13} className="text-emerald-400 print:text-emerald-600" />
                    Key Architectural Points
                  </h3>
                  <ul className="space-y-2">
                    {diagram.bullets.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-slate-400 print:text-slate-700 leading-relaxed"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} mt-1.5 shrink-0`} />
                        <span dangerouslySetInnerHTML={{ __html: b }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}

        {/* ── Footer CTA ── */}
        <div className="no-print glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Ready to download the full report?</p>
            <p className="text-xs text-slate-400 mt-0.5">Save as PDF via browser print, or grab the standalone HTML file.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <Printer size={13} />
              Save PDF
            </button>
            <button
              onClick={handleDownloadHTML}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <Download size={13} />
              HTML File
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
