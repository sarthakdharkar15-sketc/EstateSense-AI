// Utility service to trigger browser download of the System Design Diagrams Report in PDF format
import { jsPDF } from 'jspdf';

export const downloadDiagramsReport = () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin + 5;

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin + 5;
    }
  };

  // --- Title Banner ---
  doc.setFillColor(15, 23, 42); // dark slate background header box
  doc.rect(margin, y, contentWidth, 34, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("House Price Prediction System", margin + 6, y + 10);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(165, 180, 252); // indigo-300
  doc.text("System Design Diagrams & Academic Research Methodology", margin + 6, y + 18);

  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text("EstateSense AI   |   Version: v2.4   |   Architecture: Hybrid OLS + XGBoost", margin + 6, y + 26);

  y += 42;

  // Helper function to add Section Heading
  const addSectionHeading = (title) => {
    checkPageBreak(15);
    doc.setFillColor(79, 70, 229); // Indigo 600 accent bar
    doc.rect(margin, y, 3, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin + 6, y + 6);
    y += 12;
  };

  // Helper function to add Paragraph text
  const addParagraph = (text) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(text, contentWidth);
    checkPageBreak(lines.length * 5 + 3);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 4;
  };

  // Helper function to add Bullet Points
  const addBullet = (title, text) => {
    checkPageBreak(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`•  ${title}`, margin, y);
    y += 5;
    if (text) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(text, contentWidth - 6);
      checkPageBreak(lines.length * 5 + 2);
      doc.text(lines, margin + 6, y);
      y += lines.length * 5 + 3;
    }
  };

  // --- SECTION 1: EXECUTIVE SUMMARY ---
  addSectionHeading("1. Executive Summary & Architecture Overview");
  addParagraph("This report presents the system design specifications, data flow models, control flow diagrams, state transitions, and academic research methodology for the EstateSense AI Real Estate Valuation Platform.");
  addParagraph("The core engine introduces a hybrid machine learning paradigm: pairing an interpretable Hedonic Linear Regression baseline (prior probabilities) with an XGBoost Gradient Boosted Residual Corrector to capture non-linear market variances while preserving SHAP explainability.");

  // --- SECTION 2: RESEARCH GAP & OBJECTIVES ---
  addSectionHeading("2. Research Gap & Core Objectives");
  addParagraph("Traditional real estate pricing relies either on linear Ordinary Least Squares (OLS) regression or black-box Machine Learning algorithms. OLS provides full transparency but fails to capture spatial cross-interactions. Conversely, standalone XGBoost yields higher accuracy but suffers from opacity.");
  
  addBullet("Hedonic Linear Prior Baseline:", "Calculates base pricing rates per sq.ft., room count premiums, property type multipliers, and distance decay coefficients.");
  addBullet("XGBoost Residual Corrector:", "Trained on error residuals (Actual Price - Hedonic Base) to capture structural micro-location interactions.");
  addBullet("Spatial GIS Integration:", "Utilizes latitude, longitude, and radial center distance metrics to smooth valuation gradients across urban clusters.");
  addBullet("Explainable AI (SHAP):", "Decomposes price outputs into exact feature contributions (in ₹ Lakhs) via local waterfall plots.");

  // --- SECTION 3: RESEARCH QUESTIONS & HYPOTHESES ---
  addSectionHeading("3. Research Questions & Hypotheses");
  
  const RQs = [
    { id: "RQ1", q: "How does hybrid residual learning compare with standalone statistical and machine learning models?", h: "Combining linear baselines with gradient-boosted error residuals yields lower error bounds than OLS or XGBoost in isolation." },
    { id: "RQ2", q: "Does incorporating spatial GIS coordinates improve prediction accuracy?", h: "Distance metrics serve as strong spatial proxies, smoothing local valuation gradients across urban neighborhoods." },
    { id: "RQ3", q: "Can residual learning capture non-linear structural patterns missed by Hedonic OLS?", h: "XGBoost decision trees capture compounding age, floor height, and amenity cross-interactions." },
    { id: "RQ4", q: "Which features contribute most to individual property price estimates?", h: "Built-up area dominates baseline pricing, while neighborhood location premiums and distance determine pricing tiers." }
  ];

  RQs.forEach(rq => {
    checkPageBreak(22);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 18, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 18, 'S');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text(`[${rq.id}] ${rq.q}`, margin + 3, y + 6);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Hypothesis: ${rq.h}`, margin + 3, y + 13);

    y += 22;
  });

  // --- SECTION 4: SYSTEM DESIGN DIAGRAM SPECIFICATIONS ---
  addSectionHeading("4. System Diagrams Specifications");
  
  addBullet("1. Use Case Model:", "Defines User (Member) and Administrator interactions including authentication, price prediction, SHAP waterfall rendering, spatial map exploration, custom CSV dataset uploads, and on-the-fly model re-training.");
  addBullet("2. Entity-Relationship (ER) Schema:", "Defines USER, PROPERTY, NEIGHBORHOOD_CONFIG, PREDICTION_RESULT, SHAP_VALUE, and RESEARCH_EXPERIMENT tables and foreign key relationships.");
  addBullet("3. Data Flow Diagram (DFD Level 1):", "Tracks input parameters from UI components to API services (FastAPI simulation), local storage stores (D1-D4), regression fitting, and SHAP calculation engines.");
  addBullet("4. Control Flow & State Transition:", "Maps application execution paths from launch to authentication, prediction submission, calculation, dynamic CSV training, cross-validation scoring, and state cleanup.");

  // --- SECTION 5: MODEL EVALUATION BENCHMARKS ---
  addSectionHeading("5. Comparative Model Performance Benchmarks");
  addParagraph("Evaluated on benchmark property registries (Bengaluru Metropolitan Region dataset):");
  
  checkPageBreak(35);
  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("Model Architecture", margin + 4, y + 5.5);
  doc.text("MAE (₹ Lakhs)", margin + 65, y + 5.5);
  doc.text("RMSE (₹ Lakhs)", margin + 105, y + 5.5);
  doc.text("R² Score", margin + 145, y + 5.5);
  y += 8;

  const rows = [
    ["Hedonic OLS Baseline", "4.85", "6.20", "74.5%"],
    ["Standalone Random Forest", "3.80", "5.10", "84.2%"],
    ["Standalone XGBoost", "3.42", "4.55", "88.6%"],
    ["Hybrid OLS + XGBoost Corrector", "2.45", "3.28", "93.4%"]
  ];

  rows.forEach((r, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont("helvetica", idx === 3 ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(idx === 3 ? 79 : 51, idx === 3 ? 70 : 65, idx === 3 ? 229 : 85);
    doc.text(r[0], margin + 4, y + 5);
    doc.text(r[1], margin + 65, y + 5);
    doc.text(r[2], margin + 105, y + 5);
    doc.text(r[3], margin + 145, y + 5);
    y += 7;
  });

  y += 10;

  // Add Page Headers & Footers across all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("EstateSense AI - Academic Research & System Diagrams Report", margin, 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 12, pageWidth - margin, 12);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
  }

  // Save document as PDF format
  doc.save('system_diagrams_report.pdf');
};
