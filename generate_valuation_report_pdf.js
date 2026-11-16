import { jsPDF } from 'jspdf';
import fs from 'fs';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = 210;
const pageHeight = 297;
const margin = 14;
const contentWidth = pageWidth - margin * 2; // 182mm

// Background color fill (Clean modern light theme with dark accents)
doc.setFillColor(255, 255, 255);
doc.rect(0, 0, pageWidth, pageHeight, 'F');

// Top Brand Header Banner (Dark Slate Navy #0f172a)
doc.setFillColor(15, 23, 42);
doc.rect(0, 0, pageWidth, 38, 'F');

// Top Accent Line (Sky/Indigo #38bdf8)
doc.setFillColor(56, 189, 248);
doc.rect(0, 0, pageWidth, 2.5, 'F');

// Logo / Brand Name
doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.setTextColor(255, 255, 255);
doc.text("EstateSense AI", margin, 18);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(148, 163, 184); // Slate-400
doc.text("AUTOMATED REAL ESTATE VALUATION & APPRAISAL CERTIFICATE", margin, 24);
doc.text("Dual-Stage Hybrid Machine Learning (OLS + XGBoost) with SHAP Explainability", margin, 29);

// Right Side Header Badge
doc.setFillColor(30, 41, 59);
doc.roundedRect(pageWidth - margin - 55, 10, 55, 20, 2, 2, 'F');
doc.setDrawColor(51, 65, 85);
doc.setLineWidth(0.3);
doc.roundedRect(pageWidth - margin - 55, 10, 55, 20, 2, 2, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(56, 189, 248);
doc.text("VALUATION CERTIFICATE", pageWidth - margin - 52, 16);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(203, 213, 225);
doc.text("Certificate Ref: ES-VAL-2026-BLR-089", pageWidth - margin - 52, 21);
doc.text("Date of Issue: November 2026", pageWidth - margin - 52, 26);

let y = 46;

// Valuation Hero Summary Card
doc.setFillColor(248, 250, 252);
doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'F');
doc.setDrawColor(226, 232, 240);
doc.setLineWidth(0.4);
doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'S');

// Left side: Valuation Figure
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(71, 85, 105);
doc.text("AI ESTIMATED FAIR MARKET VALUE", margin + 8, y + 10);

doc.setFont('helvetica', 'bold');
doc.setFontSize(24);
doc.setTextColor(16, 185, 129); // Emerald-500
doc.text("Rs. 164.80 Lakhs", margin + 8, y + 22);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(100, 116, 139);
doc.text("Approx. ₹ 1.65 Crore (INR) | Rate: Rs. 8,908 / sq.ft.", margin + 8, y + 29);

// Right side: Confidence Interval Box
doc.setFillColor(240, 253, 244);
doc.roundedRect(pageWidth - margin - 68, y + 6, 62, 24, 1.5, 1.5, 'F');
doc.setDrawColor(187, 247, 208);
doc.setLineWidth(0.3);
doc.roundedRect(pageWidth - margin - 68, y + 6, 62, 24, 1.5, 1.5, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(21, 128, 61); // Green-700
doc.text("95% VALUATION CONFIDENCE", pageWidth - margin - 64, y + 12);

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(15, 23, 42);
doc.text("Rs. 153.60 L - 176.00 L", pageWidth - margin - 64, y + 19);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(71, 85, 105);
doc.text("Model Accuracy: +/- 6.8% MAPE", pageWidth - margin - 64, y + 25);

y += 44;

// Section 1: Property Specifications
doc.setFillColor(37, 99, 235);
doc.rect(margin, y, 3, 6, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(15, 23, 42);
doc.text("1. SUBJECT PROPERTY SPECIFICATIONS", margin + 5.5, y + 4.8);
y += 9;

// Specifications Table Grid
const specs = [
  ["Locality / Submarket", "Indiranagar (100ft Rd Corridor)", "Property Type", "Luxury Apartment"],
  ["Built-up Super Space", "1,850 sq.ft.", "Configuration", "3 BHK, 3 Bathrooms"],
  ["Property Age", "3 Years (Recent Construction)", "Floor Level", "4th Floor (Corner Facing)"],
  ["Furnishing State", "Fully-Furnished", "Reserved Parking", "2 Covered Vehicle Slots"],
  ["Coordinates", "12.9784° N, 77.6408° E", "Distance to CBD", "5.50 km to MG Road Center"]
];

const colW1 = 40, colW2 = 51, colW3 = 40, colW4 = 51;
specs.forEach((row, idx) => {
  const rowY = y + idx * 6.5;
  doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
  doc.rect(margin, rowY, contentWidth, 6.5, 'F');

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(margin, rowY + 6.5, margin + contentWidth, rowY + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(row[0], margin + 2, rowY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(row[1], margin + colW1 + 2, rowY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text(row[2], margin + colW1 + colW2 + 2, rowY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(row[3], margin + colW1 + colW2 + colW3 + 2, rowY + 4.5);
});

y += specs.length * 6.5 + 8;

// Section 2: Dual-Stage Hybrid Modeling Breakdown
doc.setFillColor(37, 99, 235);
doc.rect(margin, y, 3, 6, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(15, 23, 42);
doc.text("2. DUAL-STAGE HYBRID SYNTHESIS BREAKDOWN", margin + 5.5, y + 4.8);
y += 9;

// Stage 1 vs Stage 2 Box
doc.setFillColor(248, 250, 252);
doc.roundedRect(margin, y, (contentWidth - 6) / 2, 26, 1.5, 1.5, 'F');
doc.setDrawColor(203, 213, 225);
doc.setLineWidth(0.3);
doc.roundedRect(margin, y, (contentWidth - 6) / 2, 26, 1.5, 1.5, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(37, 99, 235);
doc.text("STAGE 1: HEDONIC OLS BASELINE", margin + 4, y + 6);
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(15, 23, 42);
doc.text("Rs. 157.25 Lakhs", margin + 4, y + 14);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(100, 116, 139);
doc.text("Calculated via Locality Base Rate (Rs. 8,500/sq.ft) + Linear structural coefficients.", margin + 4, y + 20);

// Stage 2 Box
const s2X = margin + (contentWidth - 6) / 2 + 6;
doc.setFillColor(250, 245, 255);
doc.roundedRect(s2X, y, (contentWidth - 6) / 2, 26, 1.5, 1.5, 'F');
doc.setDrawColor(216, 180, 254);
doc.roundedRect(s2X, y, (contentWidth - 6) / 2, 26, 1.5, 1.5, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(147, 51, 234); // Purple-600
doc.text("STAGE 2: XGBOOST RESIDUAL CORRECTION", s2X + 4, y + 6);
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(15, 23, 42);
doc.text("+ Rs. 7.55 Lakhs", s2X + 4, y + 14);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(100, 116, 139);
doc.text("Captures non-linear low-age appreciation, corner floor view bonus & proximity gravity.", s2X + 4, y + 20);

y += 34;

// Section 3: Explainable AI (SHAP Waterfall Attribution)
doc.setFillColor(37, 99, 235);
doc.rect(margin, y, 3, 6, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(15, 23, 42);
doc.text("3. EXPLAINABLE AI (LOCAL SHAP WATERFALL ATTRIBUTIONS)", margin + 5.5, y + 4.8);
y += 9;

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(71, 85, 105);
doc.text("Baseline Expected Market Average E[Y] = Rs. 110.50 Lakhs. Each feature contributes directly to final valuation:", margin, y);
y += 5;

// SHAP Waterfall Table
const shapItems = [
  ["1", "Built-up Space Area", "1,850 sq.ft.", "+ Rs. 31.45 Lakhs", "POSITIVE", "Large living space commanding higher rate"],
  ["2", "Neighborhood Base Rate", "Indiranagar", "+ Rs. 16.50 Lakhs", "POSITIVE", "High-demand central tech corridor premium"],
  ["3", "Bedrooms (3 BHK)", "3 Bedrooms", "+ Rs. 8.20 Lakhs", "POSITIVE", "Family configuration step-function premium"],
  ["4", "Furnishing Status", "Fully-Furnished", "+ Rs. 6.00 Lakhs", "POSITIVE", "High quality interior woodwork & fit-outs"],
  ["5", "Bathrooms & Ensuite", "3 Bathrooms", "+ Rs. 2.50 Lakhs", "POSITIVE", "Private ensuite bathrooms addition"],
  ["6", "Distance to Core CBD", "5.50 km", "- Rs. 4.95 Lakhs", "NEGATIVE", "Radial distance commute penalty"],
  ["7", "Property Construction Age", "3 Years", "- Rs. 2.40 Lakhs", "NEGATIVE", "Mild structural age depreciation adjustment"]
];

// Header
doc.setFillColor(15, 23, 42);
doc.rect(margin, y, contentWidth, 5.8, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7);
doc.setTextColor(255, 255, 255);
doc.text("No.", margin + 2, y + 4.0);
doc.text("Feature Attribute", margin + 12, y + 4.0);
doc.text("Specification", margin + 54, y + 4.0);
doc.text("SHAP Impact", margin + 88, y + 4.0);
doc.text("Impact Type", margin + 120, y + 4.0);
doc.text("Valuation Reasoning", margin + 144, y + 4.0);
y += 5.8;

shapItems.forEach((row, idx) => {
  doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  doc.text(row[0], margin + 2, y + 3.8);
  doc.text(row[1], margin + 12, y + 3.8);
  doc.text(row[2], margin + 54, y + 3.8);

  // Impact color
  if (row[4] === "POSITIVE") {
    doc.setTextColor(16, 185, 129); // Green
    doc.setFont('helvetica', 'bold');
  } else {
    doc.setTextColor(239, 68, 68); // Red
    doc.setFont('helvetica', 'bold');
  }
  doc.text(row[3], margin + 88, y + 3.8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(row[4], margin + 120, y + 3.8);
  doc.text(row[5], margin + 144, y + 3.8);

  y += 5.5;
});

y += 8;

// Section 4: Audit & Digital Verification Seal Box
doc.setFillColor(248, 250, 252);
doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'F');
doc.setDrawColor(203, 213, 225);
doc.setLineWidth(0.4);
doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'S');

// Left: Verification Text
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(15, 23, 42);
doc.text("DIGITAL VALUATION AUDIT SEAL & VERIFICATION", margin + 5, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(100, 116, 139);
doc.text("• Engine: EstateSense AI Hybrid Valuation Engine v2.4 (OLS + XGBoost with SHAP Game Theory)", margin + 5, y + 11);
doc.text("• Benchmarks: R2 Score: 0.9320 (93.2% Variance Explained) | MAE: Rs. 8.45 Lakhs | 5-Fold Cross-Validated", margin + 5, y + 16);
doc.text("• Legal Notice: Computer-generated real estate valuation certificate intended for mortgage pre-qualification and research.", margin + 5, y + 21);

// Right: Stamp Simulation
const stampX = pageWidth - margin - 38;
doc.setDrawColor(37, 99, 235);
doc.setLineWidth(0.6);
doc.roundedRect(stampX, y + 3, 34, 19, 1.5, 1.5, 'S');
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.5);
doc.setTextColor(37, 99, 235);
doc.text("ESTATESENSE AI", stampX + 17, y + 8, { align: 'center' });
doc.setFontSize(5.5);
doc.setTextColor(16, 185, 129);
doc.text("DIGITALLY CERTIFIED", stampX + 17, y + 13, { align: 'center' });
doc.setTextColor(100, 116, 139);
doc.text("CONFIDENCE: +/- 6.8%", stampX + 17, y + 18, { align: 'center' });

// Bottom Footer
doc.setDrawColor(226, 232, 240);
doc.setLineWidth(0.3);
doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(148, 163, 184);
doc.text("EstateSense AI Automated Valuation Model (AVM) | Academic Research Project", margin, pageHeight - 6);
doc.text("Report ID: ES-VAL-2026-BLR-089  |  Page 1 of 1", pageWidth - margin, pageHeight - 6, { align: 'right' });

// Save PDF
const outputPath = "EstateSense_Property_Valuation_Certificate.pdf";
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(outputPath, pdfBuffer);
console.log(`Successfully generated Valuation Certificate PDF: ${outputPath} (${pdfBuffer.length} bytes)`);
