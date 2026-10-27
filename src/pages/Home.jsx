import React, { useEffect, useRef, useState, useMemo } from 'react';
import PropertyPriceInsights from '../components/PropertyPriceInsights';
import { 
  ChevronRight, 
  Layers, 
  Map, 
  Sliders, 
  Cpu, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  Activity,
  GitBranch,
  ShieldCheck,
  TrendingUp,
  Zap,
  Calculator,
  Compass,
  Building2,
  CheckCircle2,
  BarChart3,
  Scale,
  MessageSquare,
  Search,
  Scan,
  Database,
  Brain,
  Eye,
  Check,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

// Live AI Insight Ticker Content
const AI_INSIGHT_TICKER = [
  "Area is a major price contributor",
  "Location influences property valuation",
  "Hybrid ML captures nonlinear patterns",
  "SHAP explains individual predictions"
];

// Spatial Market Demo Points
const SPATIAL_MARKET_POINTS = [
  { id: 1, x: 22, y: 35, loc: "Indiranagar", val: "₹1.12 Cr", rate: "₹11,850/sqft", driver: "Location Premium (+₹18.5L)", area: 1850 },
  { id: 2, x: 45, y: 55, loc: "Koramangala", val: "₹94.5 Lakhs", rate: "₹10,900/sqft", driver: "Area + BHK Config (+₹14.2L)", area: 1600 },
  { id: 3, x: 78, y: 28, loc: "Whitefield", val: "₹68.2 Lakhs", rate: "₹7,250/sqft", driver: "Recent Construction (+₹6.4L)", area: 1400 },
  { id: 4, x: 38, y: 72, loc: "HSR Layout", val: "₹86.0 Lakhs", rate: "₹9,700/sqft", driver: "Radial Center Proximity (+₹8.1L)", area: 1500 },
  { id: 5, x: 18, y: 62, loc: "Jayanagar", val: "₹1.45 Cr", rate: "₹12,400/sqft", driver: "Established Heritage Zone (+₹22.0L)", area: 2100 },
  { id: 6, x: 82, y: 68, loc: "Electronic City", val: "₹48.5 Lakhs", rate: "₹5,450/sqft", driver: "Affordable Tech Corridor (+₹4.2L)", area: 1100 },
  { id: 7, x: 58, y: 38, loc: "CBD MG Road", val: "₹2.10 Cr", rate: "₹16,500/sqft", driver: "Core Commercial Hub (+₹35.0L)", area: 2400 }
];

export default function Home({ onStartPredicting, onNavigate = () => {}, aiMode = true, uploadedDataset = [] }) {
  const heroCanvasRef = useRef(null);
  const [selectedPoint, setSelectedPoint] = useState(SPATIAL_MARKET_POINTS[0]);


  // Spatial Canvas Animation (Requirement 2)
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let frameId;
    let isTabActive = true;
    let isIntersecting = true;
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 33; // ~30 FPS limit for buttery performance
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : { width: 800, height: 400 };
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
      initMesh();
    };

    const handleVisibility = () => {
      isTabActive = !document.hidden;
    };

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(canvas);

    let nodes = [];
    let particles = [];
    const nodeCount = 16;

    class SpatialNode {
      constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.012 + Math.random() * 0.015;
        this.radius = Math.random() * 2.5 + 2;
      }
      update() {
        this.pulse += this.pulseSpeed;
      }
      draw() {
        const glowOpacity = Math.sin(this.pulse) * 0.35 + 0.5;
        const ringScale = 2.2 + Math.sin(this.pulse) * 1.2;

        // Node Glow Core
        ctx.fillStyle = `rgba(99, 102, 241, ${glowOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Ring
        ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - (Math.sin(this.pulse) * 0.5 + 0.5)) * 0.25})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * ringScale, 0, Math.PI * 2);
        ctx.stroke();

        // Small Node Label
        ctx.fillStyle = `rgba(148, 163, 184, ${glowOpacity * 0.35})`;
        ctx.font = '8px monospace';
        ctx.fillText(this.name, this.x + 7, this.y + 3);
      }
    }

    class DataParticle {
      constructor(startNode, endNode) {
        this.start = startNode;
        this.end = endNode;
        this.progress = 0;
        this.speed = 0.006 + Math.random() * 0.008;
      }
      update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
          this.progress = 0;
        }
      }
      draw() {
        const px = this.start.x + (this.end.x - this.start.x) * this.progress;
        const py = this.start.y + (this.end.y - this.start.y) * this.progress;
        
        ctx.fillStyle = 'rgba(16, 185, 129, 0.85)'; // emerald pulse particle
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const labels = [
      "INDIRANAGAR", "KORAMANGALA", "WHITEFIELD", "HSR LAYOUT", 
      "JAYANAGAR", "MALLESHWARAM", "CBD CENTER", "E-CITY", "YELAHANKA"
    ];

    const initMesh = () => {
      nodes = [];
      particles = [];
      for (let i = 0; i < nodeCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const label = labels[i % labels.length] + ` [${(12.9 + Math.random()*0.1).toFixed(3)}°N]`;
        nodes.push(new SpatialNode(x, y, label));
      }

      // Create data particles along node links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && particles.length < 10) {
            particles.push(new DataParticle(nodes[i], nodes[j]));
          }
        }
      }
    };

    const animate = (timestamp) => {
      frameId = requestAnimationFrame(animate);

      if (!isTabActive || !isIntersecting) return;

      const elapsed = timestamp - lastFrameTime;
      if (elapsed < FRAME_INTERVAL) return;
      lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (prefersReducedMotion || !aiMode) {
        nodes.forEach(n => n.draw());
        return;
      }

      // Draw Spatial Grid Background lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw faint house shape outlines in background
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.035)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, 150);
      ctx.lineTo(130, 120);
      ctx.lineTo(160, 150);
      ctx.lineTo(160, 190);
      ctx.lineTo(100, 190);
      ctx.closePath();
      ctx.stroke();

      // Update nodes
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].update();
      }

      // Connect spatial nodes with thin lines (batched path)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.07)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          if (Math.abs(dx) < 180 && Math.abs(dy) < 180) {
            if (dx * dx + dy * dy < 180 * 180) {
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
            }
          }
        }
      }
      ctx.stroke();

      // Draw spatial nodes on top of lines
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].draw();
      }

      // Draw & Update Data Particles along links
      particles.forEach(p => {
        p.update();
        p.draw();
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    const timeoutId = setTimeout(() => {
      handleResize();
      frameId = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [aiMode]);

  // Handler to open floating Ask EstateSense assistant
  const handleOpenAskAssistant = () => {
    window.dispatchEvent(new Event('open-ask-estatesense'));
  };

  return (
    <div className="space-y-16 w-full pb-12">
      
      {/* REQUIREMENT 7: LIVE AI INSIGHT TICKER */}
      <section className="w-full bg-slate-950/90 border-b border-white/5 py-2.5 px-4 overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-3 animate-marquee whitespace-nowrap">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold shrink-0 pr-4 border-r border-white/10">
            <Sparkles size={14} className="text-emerald-400 animate-pulse" />
            <span>AI INSIGHT STREAM</span>
          </div>
          <div className="flex items-center gap-10 text-xs text-slate-300">
            {AI_INSIGHT_TICKER.concat(AI_INSIGHT_TICKER).map((insight, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="font-medium">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 space-y-12 sm:space-y-16 md:space-y-20">
        
        {/* REQUIREMENT 1 & 2: HERO SECTION WITH ANIMATED SPATIAL BACKGROUND & FLOATING VALUATION CARD */}
        <section className="relative glass-panel rounded-3xl border border-white/5 bg-slate-950/40 p-4 sm:p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Spatial Canvas Background */}
          <canvas ref={heroCanvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-35" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Hero Left Column: Headlines & Subtitle */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Brain size={13} className="text-emerald-400 animate-pulse" />
                <span>Spatial Intelligence & Explainable AI</span>
              </div>

              {/* Requirement 1 Headline */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-tight">
                Predict the Price. Understand the Value.
              </h1>

              {/* Requirement 1 Subtitle */}
              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-normal max-w-xl">
                AI-powered property valuation using Hybrid Machine Learning, Spatial Intelligence and Explainable AI.
              </p>

              {/* Apple iOS Capsule Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-3.5 pt-2">
                <button
                  onClick={onStartPredicting}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-xs rounded-full shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer ios-pressable w-full sm:w-auto"
                >
                  <Zap size={14} className="text-white" />
                  <span>Predict Property Value</span>
                  <ArrowRight size={14} />
                </button>

                <a
                  href="#how-estatesense-thinks"
                  className="px-6 py-3.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 font-semibold text-xs rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ios-pressable w-full sm:w-auto text-center"
                >
                  <Compass size={14} className="text-emerald-400" />
                  <span>Explore How It Works</span>
                </a>
              </div>

              {/* Core System Motto Banner */}
              <div className="pt-6 border-t border-white/5">
                <p className="text-xs text-slate-400 font-normal">
                  “EstateSense AI continuously analyzes property data, understands spatial patterns, predicts value, and explains why.”
                </p>
              </div>
            </div>

            {/* Hero Right Column: FLOATING VALUATION CARD */}
            <div className="lg:col-span-5">
              <div className="glass-panel p-6 rounded-3xl border border-white/[0.1] bg-slate-950/80 shadow-2xl relative overflow-hidden backdrop-blur-2xl animate-float transition-transform hover:scale-[1.01]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* DEMO DATA Badge */}
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Building2 size={13} className="text-emerald-400" />
                    <span>Property Valuation Card</span>
                  </span>
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    DEMO DATA
                  </span>
                </div>

                {/* Estimated Value */}
                <div className="space-y-1 mb-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Value</span>
                  <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 font-mono">
                    ₹82.4 Lakhs
                  </div>
                </div>

                {/* Model Confidence */}
                <div className="mb-5 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Model Confidence:</span>
                    <span className="text-emerald-400 font-bold font-mono">87%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full w-[87%]"></div>
                  </div>
                </div>

                {/* Top Contributors */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Top Value Contributors</span>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-slate-300">Area (Built-up)</span>
                      <span className="text-emerald-400 font-bold">+₹8.2L</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-slate-300">Location Base</span>
                      <span className="text-indigo-400 font-bold">+₹5.6L</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-slate-300">Bedrooms Config</span>
                      <span className="text-teal-400 font-bold">+₹3.1L</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 text-[10px] text-slate-500 italic text-center border-t border-white/5">
                  Connected to dynamic hybrid OLS + XGBoost corrector.
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* REQUIREMENT 3: AI PROPERTY SCANNING ANIMATION (Isolated Subcomponent) */}
        <PropertyScanner aiMode={aiMode} />

        {/* PROPERTY PRICE INSIGHTS SECTION */}
        <PropertyPriceInsights uploadedDataset={uploadedDataset} />

        {/* REQUIREMENT 4: HOW ESTATESENSE THINKS (PIPELINE WITH ANIMATED PARTICLES & DATA FLOW) */}
        <HowEstateSenseThinksPipeline onStartPredicting={onStartPredicting} />

        {/* REQUIREMENT 9: HOMEPAGE UNIQUE FEATURE SHOWCASE ("More Than a Price Prediction") */}
        <section className="space-y-8 pt-4 border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={13} className="animate-pulse" />
              <span>Next-Gen AI Capabilities</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">More Than a Price Prediction</h2>
            <p className="text-xs md:text-sm text-slate-400 font-light max-w-xl mx-auto">
              EstateSense AI turns a simple property prediction into an intelligent valuation experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Property DNA */}
            <div 
              onClick={onStartPredicting}
              className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-950/40 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  ⭐
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Property DNA</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Understand the unique structural and spatial characteristics of a property.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold tracking-wider mt-4">
                <span>View DNA</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 2: Valuation Detective */}
            <div 
              onClick={onStartPredicting}
              className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-950/40 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  🔍
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Valuation Detective</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Discover how the model evaluates step-by-step evidence to deliver verdicts.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold tracking-wider mt-4">
                <span>Inspect Evidence</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 3: What-If AI */}
            <div 
              onClick={onStartPredicting}
              className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-950/40 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  🧠
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">What-If AI</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Explore how changing property attributes changes the model estimate.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-violet-400 font-bold tracking-wider mt-4">
                <span>Simulate Changes</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 4: Price Anomaly Detector */}
            <div 
              onClick={onStartPredicting}
              className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-950/40 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  ⚠️
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Price Anomaly Detector</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Identify unusual differences between asking prices and estimated values.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold tracking-wider mt-4">
                <span>Detect Anomalies</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 5: Explain Like I'm 5 */}
            <div 
              onClick={() => onNavigate('explainable')}
              className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-950/40 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  👶
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">Explain Like I'm 5</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Understand complex AI machine learning predictions in ultra-simple language.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-teal-400 font-bold tracking-wider mt-4">
                <span>Read ELI5 Mode</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

          </div>
        </section>

        {/* REQUIREMENT 5: PREDICT -> COMPARE -> UNDERSTAND CARDS */}
        <section className="space-y-6 pt-4 border-t border-white/5">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight">Core Application Capabilities</h3>
            <p className="text-xs text-slate-400 font-light">Interactive modules tailored for real estate research and pricing analysis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Card 1: PREDICT */}
            <div 
              onClick={onStartPredicting}
              className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-950/40 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
                  <Cpu size={20} />
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">PREDICT</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Get an intelligent property valuation powered by Hedonic OLS and XGBoost residuals.
                </p>
                <div className="pt-2 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Includes 95% confidence intervals and instant market rate calculations.
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs tracking-wider mt-6">
                <span>Evaluate Property</span>
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 2: COMPARE */}
            <div 
              onClick={() => onNavigate('compare')}
              className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-950/40 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
                  <Scale size={20} />
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">COMPARE</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Compare up to 3 properties side-by-side to evaluate rates, specs, and features.
                </p>
                <div className="pt-2 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Side-by-side specification table & metric comparison charts.
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs tracking-wider mt-6">
                <span>Compare Listings</span>
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 3: UNDERSTAND */}
            <div 
              onClick={() => onNavigate('explainable')}
              className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-950/40 hover:border-fuchsia-500/40 hover:shadow-2xl hover:shadow-fuchsia-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
                  <Eye size={20} />
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-fuchsia-400 transition-colors">UNDERSTAND</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Discover why the model predicted that price using Shapley Additive Explanations.
                </p>
                <div className="pt-2 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Waterfall feature contribution plots and natural-language summaries.
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-fuchsia-400 font-bold text-xs tracking-wider mt-6">
                <span>View SHAP Insights</span>
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

          </div>
        </section>

        {/* REQUIREMENT 6: ANIMATED SPATIAL MARKET SECTION ("See the Market Differently") */}
        <section className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 bg-slate-950/30 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">See the Market Differently</h3>
              <p className="text-xs text-slate-400 mt-1">Interactive spatial grid showcasing Bengaluru property valuation nodes.</p>
            </div>
            <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 w-fit">
              DEMO DATA
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Interactive Dark Grid Visualization */}
            <div className="lg:col-span-8 h-80 rounded-2xl bg-slate-900/90 border border-white/10 relative overflow-hidden p-4">
              <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
              
              {SPATIAL_MARKET_POINTS.map((pt) => {
                const isSelected = selectedPoint.id === pt.id;
                return (
                  <button
                    key={pt.id}
                    onClick={() => setSelectedPoint(pt)}
                    style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all cursor-pointer group z-10 ${
                      isSelected ? 'scale-125' : 'hover:scale-110'
                    }`}
                  >
                    <span className={`block rounded-full animate-ping absolute inset-0 ${
                      isSelected ? 'bg-emerald-400 opacity-75' : 'bg-indigo-400 opacity-40'
                    }`} />
                    <span className={`block w-3.5 h-3.5 rounded-full relative z-10 border ${
                      isSelected ? 'bg-emerald-500 border-white' : 'bg-indigo-600 border-indigo-300'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Selected Node Details Panel */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 font-sans text-[11px]">Location Node:</span>
                <span className="text-white font-bold">{selectedPoint.loc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans text-[11px]">Estimated Value:</span>
                <span className="text-emerald-400 font-bold text-sm">{selectedPoint.val}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans text-[11px]">Price / Sq.Ft.:</span>
                <span className="text-slate-200">{selectedPoint.rate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans text-[11px]">Property Size:</span>
                <span className="text-slate-200">{selectedPoint.area} sqft</span>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] text-slate-500 font-sans block mb-1">Top Value Driver:</span>
                <span className="text-indigo-300 text-[11px] font-bold block bg-indigo-950/40 p-2 rounded border border-indigo-500/20">
                  {selectedPoint.driver}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* REQUIREMENT 8: PROJECT METRICS */}
        <section className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Project System Metrics</h3>
            <span className="text-[9px] text-slate-500 uppercase font-bold">DEMO METRICS</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="card-premium p-6 rounded-2xl text-center shadow-lg hover:scale-102 transition-transform">
              <p className="text-3xl font-extrabold text-white">21K+</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Properties Analyzed</p>
            </div>
            <div className="card-premium-fuchsia p-6 rounded-2xl text-center shadow-lg hover:scale-102 transition-transform">
              <p className="text-3xl font-extrabold text-white">15+</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Property Features</p>
            </div>
            <div className="card-premium p-6 rounded-2xl text-center shadow-lg hover:scale-102 transition-transform">
              <p className="text-3xl font-extrabold text-white">4+</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">ML Models</p>
            </div>
            <div className="card-premium-fuchsia p-6 rounded-2xl text-center shadow-lg hover:scale-102 transition-transform">
              <p className="text-3xl font-extrabold text-white">SHAP</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Explainable AI</p>
            </div>
          </div>
        </section>

        {/* REQUIREMENT 9: ASK ESTATESENSE CTA SECTION */}
        <section className="glass-panel p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Have a property question?</span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Ask EstateSense.</h3>
            <p className="text-xs text-slate-400 max-w-md font-light">
              Chat with our AI valuation assistant for instant explanations on pricing drivers, OLS base rates, and residual factors.
            </p>
          </div>

          <button
            onClick={handleOpenAskAssistant}
            className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <MessageSquare size={15} />
            <span>Start Conversation →</span>
          </button>
        </section>

      </div>

      {/* Global Custom CSS Animation Keyframes */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: 200%;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes scanLine {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scanLine 2.5s ease-in-out infinite;
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 12s infinite linear;
        }
      `}</style>
    </div>
  );
}

// Isolated Property Scanner Subcomponent: Re-renders only itself on interval timer without triggering parent re-render
function PropertyScanner({ aiMode }) {
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (!aiMode) return;
    const timer = setInterval(() => {
      setScanStep((prev) => (prev + 1) % 7);
    }, 1300);
    return () => clearInterval(timer);
  }, [aiMode]);

  return (
    <section className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 bg-slate-950/30 space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase">
          <Scan size={13} className="animate-spin-slow" />
          <span>Real-Time Property Scanner</span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">AI Spatial Property Scanning</h3>
        <p className="text-xs text-slate-400 font-light">
          Watch EstateSense AI evaluate property attributes sequentially through neural scanning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto">
        {/* Visual Scanner House Box */}
        <div className="md:col-span-6 flex justify-center">
          <div className="w-64 h-64 rounded-2xl bg-slate-900/90 border border-indigo-500/30 relative overflow-hidden flex items-center justify-center p-6 shadow-2xl">
            {/* Moving Scan Line */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-line z-20" />

            {/* Minimal House Vector Icon */}
            <svg className="w-36 h-36 text-indigo-400/80 z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        </div>

        {/* Checklist & Results State */}
        <div className="md:col-span-6 space-y-3 font-mono text-xs">
          {[
            { name: "Area", step: 0 },
            { name: "Location", step: 1 },
            { name: "Bedrooms", step: 2 },
            { name: "Bathrooms", step: 3 },
            { name: "Property Features", step: 4 }
          ].map((item) => {
            const isPassed = scanStep >= item.step;
            return (
              <div key={item.name} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isPassed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/5 text-slate-500'
              }`}>
                <span>Analyzing {item.name}...</span>
                {isPassed ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-400">
                    <Check size={14} /> Passed
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-600">Pending</span>
                )}
              </div>
            );
          })}

          {/* Completion Banner */}
          {scanStep >= 5 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/40 space-y-1 animate-fade-in">
              <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
                AI ANALYSIS COMPLETE
              </div>
              <div className="text-base font-extrabold text-white">
                Estimated Value: <span className="text-emerald-400">₹82.4L</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Interactive Animated Valuation Pipeline Component (Requirement 4)
function HowEstateSenseThinksPipeline({ onStartPredicting }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const PIPELINE_STEPS = [
    {
      step: "01",
      title: "Property Data",
      desc: "Raw specs & coordinates",
      tag: "Input Vector",
      icon: Database,
      formula: "X = [Area, BHK, Baths, Age, Lat, Lng, Floors]",
      sample: "1,850 sq.ft • 3 BHK • Indiranagar • Age: 4 yrs",
      note: "Validates input boundaries, geocodes coordinates, and normalizes numeric ranges."
    },
    {
      step: "02",
      title: "Hedonic Regression",
      desc: "OLS prior base rate",
      tag: "Stage 1 Baseline",
      icon: TrendingUp,
      formula: "P_linear = β₀ + Σ(βᵢ·Xᵢ) + (Area × BaseRate_loc)",
      sample: "OLS Baseline Price: ₹115.5 Lakhs (Indiranagar Base Rate)",
      note: "Computes fundamental macroeconomic floor price based on historical neighborhood base rates."
    },
    {
      step: "03",
      title: "Residual Learning",
      desc: "Error difference vector",
      tag: "Variance Extractor",
      icon: Activity,
      formula: "Residual = Actual_Price - P_linear",
      sample: "Target Variance to Correct: +₹18.2 Lakhs",
      note: "Extracts non-linear variance and neighborhood premium that linear regression misses."
    },
    {
      step: "04",
      title: "XGBoost",
      desc: "Gradient boosting trees",
      tag: "Stage 2 Non-Linear",
      icon: Cpu,
      formula: "Res_pred = XGBoost(Spatial, Amenities, MicroLoc)",
      sample: "Boosted Tree Correction: +₹18.2 Lakhs (100 Estimators)",
      note: "Captures micro-location gravity, floor height premiums, and structural cross-interactions."
    },
    {
      step: "05",
      title: "Hybrid Prediction",
      desc: "Summation pipeline",
      tag: "Ensemble Merge",
      icon: Scale,
      formula: "P_final = P_linear + Res_pred  (R² = 0.932)",
      sample: "Synthesized Price: ₹133.7 Lakhs (Error: ±6.8%)",
      note: "Combines linear macro stability with gradient-boosted micro accuracy."
    },
    {
      step: "06",
      title: "SHAP Explainability",
      desc: "Feature contributions",
      tag: "Explainable AI",
      icon: Eye,
      formula: "P_final = E[P] + Σ φⱼ  (Shapley Marginal Values)",
      sample: "Indiranagar (+₹14.2L) • Area (+₹42.5L) • Age > 4 (-₹4.8L)",
      note: "Decomposes every rupee of price change into positive premiums and negative deductions."
    },
    {
      step: "07",
      title: "Final Valuation",
      desc: "Final estimate & bounds",
      tag: "Output Certificate",
      icon: CheckCircle2,
      formula: "95% Confidence Band = [₹124.6L – ₹142.8L]",
      sample: "Fair Market Value: ₹133.7 Lakhs",
      note: "Renders interactive valuation cards, SHAP waterfall chart, GIS map scatter, and official PDF."
    }
  ];

  // Auto-cycle through the 7 steps
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isPlaying, PIPELINE_STEPS.length]);

  const current = PIPELINE_STEPS[activeStep];

  return (
    <section id="how-estatesense-thinks" className="space-y-6 pt-4 border-t border-white/5">
      {/* Section Header with Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Brain size={13} className="animate-pulse" />
            <span>Dual-Stage Valuation Pipeline</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            How EstateSense Thinks
          </h2>
          <p className="text-xs text-slate-400 font-light max-w-xl">
            Live sequential data pipeline illustrating how property parameters transform into explainable valuations.
          </p>
        </div>

        {/* Interactive Play/Pause & Reset Controls */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 rounded-xl p-1.5 backdrop-blur-sm">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all"
            title={isPlaying ? "Pause automated flow" : "Resume automated flow"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "Pause Flow" : "Auto-Play"}</span>
          </button>
          
          <button
            onClick={() => {
              setActiveStep(0);
              setIsPlaying(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Restart pipeline from Step 01"
          >
            <RotateCcw size={13} />
          </button>
          
          <span className="text-[10px] font-mono text-slate-500 px-2 border-l border-white/10">
            Step {activeStep + 1}/7
          </span>
        </div>
      </div>

      {/* Progress Track with Animated Neon Laser Beam */}
      <div className="relative w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-700 ease-out rounded-full shadow-[0_0_12px_#10b981]"
          style={{ width: `${((activeStep + 1) / 7) * 100}%` }}
        />
      </div>

      {/* 7 Pipeline Cards in an Aligned Responsive Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {PIPELINE_STEPS.map((node, idx) => {
          const isActive = activeStep === idx;
          const isPassed = activeStep > idx;
          const IconComponent = node.icon;

          return (
            <div
              key={node.step}
              onClick={() => {
                setActiveStep(idx);
                setIsPlaying(false); // Pause so user can inspect
              }}
              className={`relative rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-300 min-h-[140px] sm:min-h-[148px] border text-left group ${idx === 6 ? 'col-span-2 sm:col-span-1' : ''} ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-500/15 via-slate-900/90 to-slate-950 border-emerald-500/80 shadow-xl shadow-emerald-500/20 -translate-y-1.5 ring-1 ring-emerald-500/50'
                  : isPassed
                  ? 'bg-slate-950/60 border-emerald-500/30 hover:border-emerald-500/60 hover:-translate-y-1'
                  : 'bg-slate-950/40 border-white/5 hover:border-white/20 hover:-translate-y-0.5 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Top Row: Step Number & Live Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono font-extrabold ${isActive ? 'text-emerald-400' : isPassed ? 'text-emerald-500/80' : 'text-slate-500'}`}>
                  {node.step}
                </span>

                {isActive ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Live
                  </span>
                ) : isPassed ? (
                  <span className="flex items-center text-emerald-400 text-[10px]" title="Passed step">
                    <Check size={12} />
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-600 font-mono">Queue</span>
                )}
              </div>

              {/* Icon Container */}
              <div className="my-1.5 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/30'
                    : isPassed
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-white/5 text-slate-400'
                }`}>
                  <IconComponent size={15} />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-0.5">
                <div className={`font-bold text-xs tracking-tight transition-colors ${
                  isActive ? 'text-white' : 'text-slate-200 group-hover:text-emerald-400'
                }`}>
                  {node.title}
                </div>
                <div className="text-[9px] text-slate-400 line-clamp-1 font-light">
                  {node.desc}
                </div>
              </div>

              {/* Bottom Tag Badge */}
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-emerald-400/20 text-emerald-300 font-semibold'
                    : 'bg-white/5 text-slate-500'
                }`}>
                  {node.tag}
                </span>

                {idx < 6 && (
                  <span className={`text-[10px] transition-colors ${isActive ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`}>
                    →
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Pipeline Monitor Console (Shows math & sample data for active step) */}
      <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          {/* Active Step Details */}
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                ACTIVE STEP {current.step} / 07
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {current.title} — <span className="text-slate-400">{current.tag}</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 font-light">
              {current.note}
            </p>

            <div className="font-mono text-[10px] sm:text-[11px] text-emerald-300/90 bg-black/40 px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/5 inline-block max-w-full overflow-x-auto whitespace-nowrap scrollbar-none">
              <span className="text-slate-500 select-none">$ </span>
              {current.formula}
            </div>
          </div>

          {/* Sample Property Transformation */}
          <div className="md:text-right space-y-1 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5 min-w-[240px]">
            <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
              Live Property Vector Trace
            </div>
            <div className="text-xs font-bold text-white">
              {current.sample}
            </div>
            <button
              onClick={onStartPredicting}
              className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold mt-1 transition-colors group"
            >
              <span>Test Live in Predictor</span>
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


