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
let currentPage = 1;

function setHeaderFooter(sectionTitle = "") {
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, 15, pageWidth - margin, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("EstateSense AI: Software Design Specification (SDS) | IEEE Std 1016", margin, 12);
  if (sectionTitle) {
    doc.text(sectionTitle, pageWidth - margin, 12, { align: 'right' });
  }

  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Dept. of Computer Science & Engineering | Academic SDS Release v2.4", margin, pageHeight - 7);
  doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
}

function startNewPage(sectionTitle = "") {
  doc.addPage();
  currentPage++;
  setHeaderFooter(sectionTitle);
  return 24;
}

function drawSectionHeading(title, y) {
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(margin, y, 3, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(title, margin + 5.5, y + 5);
  return y + 9.5;
}

function drawParagraph(text, y, fontSize = 8.2, textColor = [51, 65, 85]) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(...textColor);
  const lines = doc.splitTextToSize(text, contentWidth);
  doc.text(lines, margin, y);
  return y + lines.length * (fontSize * 0.42) + 2.5;
}

function drawCalloutBox(title, bodyLines, y, accentColor = [37, 99, 235], bgColor = [248, 250, 252]) {
  const lineSpacing = 3.6;
  const boxHeight = 7.5 + bodyLines.length * lineSpacing;

  doc.setFillColor(...bgColor);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'F');
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'S');

  doc.setFillColor(...accentColor);
  doc.rect(margin, y, 2.5, boxHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42);
  doc.text(title, margin + 5.5, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  bodyLines.forEach((line, idx) => {
    doc.text(line, margin + 5.5, y + 8.5 + idx * lineSpacing);
  });

  return y + boxHeight + 3.5;
}

function drawTable(headers, rows, startY, colWidths, alignRightCols = []) {
  let y = startY;
  const rowHeight = 6.0;

  // Header row
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, rowHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);

  let currentX = margin;
  headers.forEach((h, i) => {
    const isRight = alignRightCols.includes(i);
    const textX = isRight ? currentX + colWidths[i] - 2 : currentX + 2;
    doc.text(h, textX, y + 4.0, { align: isRight ? 'right' : 'left' });
    currentX += colWidths[i];
  });
  y += rowHeight;

  // Data rows
  rows.forEach((row, rowIdx) => {
    doc.setFillColor(rowIdx % 2 === 0 ? 255 : 248, rowIdx % 2 === 0 ? 255 : 250, rowIdx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);

    let cellX = margin;
    row.forEach((cell, colIdx) => {
      const isRight = alignRightCols.includes(colIdx);
      const textX = isRight ? cellX + colWidths[colIdx] - 2 : cellX + 2;
      doc.text(String(cell), textX, y + 4.0, { align: isRight ? 'right' : 'left' });
      cellX += colWidths[colIdx];
    });
    y += rowHeight;
  });

  return y + 2.5;
}

console.log("Generating EstateSense AI Software Design Specification (SDS) PDF...");

// ============================================================================
// PAGE 1: TITLE & COVER PAGE
// ============================================================================
doc.setDrawColor(37, 99, 235);
doc.setLineWidth(1.2);
doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
doc.setDrawColor(203, 213, 225);
doc.setLineWidth(0.3);
doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(15, 23, 42);
doc.text("DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING", pageWidth / 2, 28, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(100, 116, 139);
doc.text("[COLLEGE / UNIVERSITY NAME HERE]", pageWidth / 2, 34, { align: 'center' });
doc.text("Affiliated to State Technical University / AICTE Approved", pageWidth / 2, 39, { align: 'center' });

// Central Badge
doc.setFillColor(241, 245, 249);
doc.circle(pageWidth / 2, 58, 14, 'F');
doc.setDrawColor(37, 99, 235);
doc.setLineWidth(0.8);
doc.circle(pageWidth / 2, 58, 14, 'S');
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.setTextColor(37, 99, 235);
doc.text("SDS", pageWidth / 2, 62, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(71, 85, 105);
doc.text("SOFTWARE DESIGN SPECIFICATION (SDS)", pageWidth / 2, 85, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(15);
doc.setTextColor(15, 23, 42);
doc.text("ESTATESENSE AI", pageWidth / 2, 96, { align: 'center' });

doc.setFontSize(10.5);
doc.setTextColor(37, 99, 235);
doc.text("Dual-Stage Hybrid House Price Prediction System with", pageWidth / 2, 103, { align: 'center' });
doc.text("Explainable AI (SHAP) and Spatial GIS Analytics", pageWidth / 2, 109, { align: 'center' });

doc.setDrawColor(203, 213, 225);
doc.setLineWidth(0.4);
doc.line(45, 115, pageWidth - 45, 115);

doc.setFont('helvetica', 'italic');
doc.setFontSize(8.5);
doc.setTextColor(100, 116, 139);
doc.text("Based on Hybrid Object-Oriented & Event-Driven (Function-Oriented) Technology", pageWidth / 2, 123, { align: 'center' });
doc.text("Compliant with IEEE Std 1016-2009 (Software Design Descriptions) & IEEE Std 830", pageWidth / 2, 128, { align: 'center' });

// Credentials Box
const boxY = 154;
doc.setFillColor(248, 250, 252);
doc.roundedRect(25, boxY, pageWidth - 50, 72, 2, 2, 'F');
doc.setDrawColor(226, 232, 240);
doc.setLineWidth(0.4);
doc.roundedRect(25, boxY, pageWidth - 50, 72, 2, 2, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(37, 99, 235);
doc.text("PROJECT UNDERTAKEN BY:", 32, boxY + 11);

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(15, 23, 42);
doc.text("[Student Name(s)]", 32, boxY + 19);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(71, 85, 105);
doc.text("Enrollment / Roll No: [1XX21CSXXX]", 32, boxY + 25);
doc.text("Degree: B.Tech / B.E. in CSE / IT", 32, boxY + 31);
doc.text("Project Type: Major Academic Project", 32, boxY + 37);

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(37, 99, 235);
doc.text("INTERNAL PROJECT GUIDE:", 112, boxY + 11);

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(15, 23, 42);
doc.text("[Prof. / Dr. Guide Name]", 112, boxY + 19);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(71, 85, 105);
doc.text("Designation: Assistant Professor", 112, boxY + 25);
doc.text("Department of CSE", 112, boxY + 31);
doc.text("[College / University Name]", 112, boxY + 37);

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(15, 23, 42);
doc.text("ACADEMIC YEAR: 2025 - 2026", pageWidth / 2, 258, { align: 'center' });
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(100, 116, 139);
doc.text("Document Version: 2.4.0 (Approved for Academic Viva Voce)", pageWidth / 2, 263, { align: 'center' });


// ============================================================================
// PAGE 2: TABLE OF CONTENTS & CHAPTER 1 INTRODUCTION
// ============================================================================
let y = startNewPage("Table of Contents & Introduction");

y = drawSectionHeading("TABLE OF CONTENTS", y);

const sdsToc = [
  ["1. Introduction", "Purpose, Conventions, Audience, References", "2"],
  ["2. Analysis Model", "Methodology (OO & Event-Driven), Use Case Model & Specs", "3"],
  ["", "Entity-Relationship (ER) Model & Metadata", "4"],
  ["", "Data Flow Diagrams (Level 0 & Level 1) & Process Specs", "5"],
  ["", "Control Flow Diagram (CFD) & State Transition Diagram (STD)", "6"],
  ["", "Activity Diagram, Sequence Diagram & Class Diagram", "7"],
  ["3. Design Model", "Architectural Design (4-Tier Architecture Diagram & Description)", "8"],
  ["", "Database Design (Data Dictionary & Normalization 1NF to BCNF)", "9"],
  ["", "Component Design (Package, Component & Deployment Diagrams)", "10"],
  ["", "Algorithmic Flowchart & Interface Design (Screenshots Layout)", "11"],
  ["Appendices", "Appendix B1/C1: Glossary | Appendix B2/C2: TBD List", "12"]
];

sdsToc.forEach(([sec, desc, pg]) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(sec, margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(desc, margin + 28, y);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 28 + doc.getTextWidth(desc) + 2, y - 0.5, pageWidth - margin - 10, y - 0.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(pg, pageWidth - margin - 3, y, { align: 'right' });

  y += 5.8;
});

y += 4;
y = drawSectionHeading("1. INTRODUCTION", y);

y = drawParagraph(
  "1.1 Purpose: This Software Design Specification (SDS) formally documents the structural, behavioral, and data designs for EstateSense AI (Release v2.4.0). The scope covers the end-to-end client-side hybrid ML valuation platform, local/global SHAP explainability decomposition, geospatial Leaflet GIS mapping, in-browser dynamic model retraining, and vector PDF valuation generation.",
  y
);

y = drawParagraph(
  "1.2 Document Conventions: This SDS complies strictly with IEEE Std 1016-2009 (Software Design Descriptions) and IEEE Std 830-1998. Requirement priorities follow RFC 2119 keywords (SHALL, MUST, SHOULD). All architectural models conform to standard UML 2.5 and Edward Yourdon / DeMarco DFD notations.",
  y
);

y = drawParagraph(
  "1.3 Intended Audience & Reading Suggestions: Evaluators and professors should examine Section 2 (Analysis Model) and Section 3 (Design Model). Developers should focus on the Sequence Diagram, Class Diagram, Component Diagram, and Data Dictionary.",
  y
);

y = drawParagraph(
  "1.4 References: [1] S. Rosen (1974) Hedonic Pricing Model. [2] S. Lundberg & S. Lee (2017) SHAP Unified Interpretation. [3] T. Chen & C. Guestrin (2016) XGBoost. [4] IEEE Std 1016-2009.",
  y
);


// ============================================================================
// PAGE 3: ANALYSIS MODEL - METHODOLOGY & USE CASE MODEL
// ============================================================================
y = startNewPage("2. Analysis Model: Use Cases");

y = drawSectionHeading("2. ANALYSIS MODEL", y);

y = drawParagraph(
  "2.1 Methodology Used: EstateSense AI employs a Hybrid Object-Oriented and Event-Driven / Function-Oriented Software Engineering paradigm. Domain entities (Properties, Valuations, Attributions) are encapsulated as reusable classes, while UI interactions trigger asynchronous reactive functional pipelines. An Agile Iterative and Incremental Process Model was utilized during development.",
  y
);

y = drawParagraph(
  "2.2 Use Case Diagram & Specifications: The system defines two primary actors: Standard User / Analyst and Administrator.",
  y
);

// Draw Textual Use Case Diagram representation
const ucBox = [
  "+------------------------------------------------------------------------------------+",
  "|                     ESTATESENSE AI USE CASE BEHAVIORAL MODEL                       |",
  "+------------------------------------------------------------------------------------+",
  "|                                                                                    |",
  "|   [ACTOR: Standard User / Analyst]                                                 |",
  "|    ├── UC-1: Register & Authenticate into System                                  |",
  "|    ├── UC-2: Input Property Parameters & Execute Single Valuation                  |",
  "|    ├── UC-3: Inspect Local SHAP Waterfall Breakdown (₹ Lakhs)                      |",
  "|    ├── UC-4: Explore Spatial GIS Map & Distance-to-CBD Filters                     |",
  "|    ├── UC-5: View Model Performance Benchmarks (R2, MAE, RMSE)                     |",
  "|    └── UC-8: Download Audit-Ready Vector PDF Valuation Certificate                 |",
  "|                                                                                    |",
  "|   [ACTOR: Administrator (Inherits User Privileges)]                                |",
  "|    ├── UC-6: Ingest Batch Properties via CSV Upload                                |",
  "|    ├── UC-7: Dynamically Retrain Hybrid Model & Recalculate Submarket Base Rates   |",
  "|    └── UC-9: Adjust Simulated Latency Overhead (0ms to 2000ms)                     |",
  "+------------------------------------------------------------------------------------+"
];

doc.setFillColor(15, 23, 42);
doc.rect(margin, y, contentWidth, 38, 'F');
doc.setFont('courier', 'normal');
doc.setFontSize(6.2);
doc.setTextColor(56, 189, 248);
ucBox.forEach((line, idx) => {
  doc.text(line, margin + 2.5, y + 4.2 + idx * 2.6);
});

y += 42;

// Detailed Use Case Specification Callout Box
y = drawCalloutBox(
  "Use Case Specification: UC-2 (Single Property Valuation)",
  [
    "• Actor: Standard User / Mortgage Analyst",
    "• Pre-Condition: Application loaded at /predict with default Bengaluru coefficients.",
    "• Primary Flow of Events:",
    "   1. User inputs square footage (Area), BHK, Bathrooms, Locality, Property Age, and Furnishing.",
    "   2. System computes Stage 1 Linear Baseline: P_linear = Area * BaseRate_loc + Structural_Premiums.",
    "   3. System evaluates Stage 2 XGBoost Residual: R_hat = f(Area, Age, Density, Proximity).",
    "   4. System synthesizes final predicted valuation: P_final = P_linear + R_hat.",
    "   5. System calculates 95% Confidence Interval bounds [ P_final * (1 - 0.068), P_final * (1 + 0.068) ].",
    "   6. UI renders animated price badge in ₹ Lakhs with color-coded confidence tags.",
    "• Alternate Flow: If square footage < 300 or > 10,000, trigger error toast and disable calculation.",
    "• Post-Condition: Prediction stored in session; inputs dispatched to SHAP Explainer."
  ],
  y,
  [37, 99, 235],
  [248, 250, 252]
);


// ============================================================================
// PAGE 4: ANALYSIS MODEL - ENTITY RELATIONSHIP (ER) MODEL
// ============================================================================
y = startNewPage("2. Analysis Model: ER Model");

y = drawSectionHeading("2.3 ENTITY-RELATIONSHIP (ER) MODEL", y);

y = drawParagraph(
  "The Entity-Relationship model illustrates the conceptual and logical schema for EstateSense AI. It defines entities, attributes, primary/foreign keys, and relational cardinality.",
  y
);

// Draw ER Diagram representation
const erdLines = [
  "+------------------------+        1:N         +------------------------------+",
  "|         USERS          |------------------->|     VALUATION_INFERENCES     |",
  "+------------------------+                    +------------------------------+",
  "| PK user_id             |                    | PK inference_id              |",
  "|    full_name           |                    | FK user_id                   |",
  "|    email (UNIQUE)      |                    | FK property_id               |",
  "|    password_hash       |                    |    stage1_hedonic_lakhs      |",
  "|    role (admin/user)   |                    |    stage2_residual_lakhs     |",
  "|    created_at          |                    |    final_predicted_lakhs     |",
  "+------------------------+                    |    confidence_low_lakhs      |",
  "                                              |    confidence_high_lakhs     |",
  "+------------------------+        1:N         |    inference_timestamp       |",
  "|     NEIGHBORHOODS      |----------------+   +------------------------------+",
  "+------------------------+                |                  | 1:N",
  "| PK location_name       |                |                  v",
  "|    base_rate_sqft      |                |   +------------------------------+",
  "|    latitude            |                |   |      SHAP_CONTRIBUTIONS      |",
  "|    longitude           |                |   +------------------------------+",
  "|    distance_to_cbd_km  |                |   | PK attribution_id            |",
  "+------------------------+                |   | FK inference_id              |",
  "           | 1:N                          |   |    feature_name              |",
  "           v                              |   |    feature_value             |",
  "+------------------------+                |   |    shap_value_lakhs          |",
  "|       PROPERTIES       |<---------------+   |    contribution_type (+/-)   |",
  "+------------------------+                    +------------------------------+",
  "| PK property_id         |",
  "| FK location_name       |",
  "|    built_up_area_sqft  |",
  "|    bedrooms_bhk        |",
  "|    bathrooms           |",
  "|    property_age_years  |",
  "|    actual_price_lakhs  |",
  "+------------------------+"
];

doc.setFillColor(15, 23, 42);
doc.rect(margin, y, contentWidth, 72, 'F');
doc.setFont('courier', 'normal');
doc.setFontSize(6.0);
doc.setTextColor(56, 189, 248);
erdLines.forEach((line, idx) => {
  doc.text(line, margin + 2.5, y + 4.2 + idx * 2.5);
});

y += 76;

y = drawParagraph(
  "Relational Multiplicities & Cardinalities:",
  y, 9.0, [15, 23, 42]
);
y = drawParagraph(
  "• USERS to VALUATION_INFERENCES (1 : N): A single authenticated user or analyst can execute multiple valuation queries across property scenarios.\n• PROPERTIES to VALUATION_INFERENCES (1 : N): A real estate property record may be evaluated multiple times across changing market conditions or model retraining runs.\n• NEIGHBORHOODS to PROPERTIES (1 : N): Each neighborhood entity governs geographic base rates and coordinates for multiple properties.\n• VALUATION_INFERENCES to SHAP_CONTRIBUTIONS (1 : N): Each final valuation inference yields exactly M additive game-theoretic attributions.",
  y
);


// ============================================================================
// PAGE 5: DFD LEVEL 0 & LEVEL 1 WITH PROCESS SPECIFICATIONS
// ============================================================================
y = startNewPage("2. Analysis Model: DFD & PSPEC");

y = drawSectionHeading("2.4 DATA FLOW DIAGRAMS & PROCESS SPECIFICATIONS", y);

y = drawParagraph(
  "Data Flow Diagrams (DFDs) trace the movement of information across external actors, functional transformations, and physical data stores.",
  y
);

// DFD Level 1 Box
const dfdBox = [
  "+------------------------------------------------------------------------------------+",
  "|                    ESTATESENSE AI DFD LEVEL 1 FUNCTIONAL DECOMPOSITION             |",
  "+------------------------------------------------------------------------------------+",
  "|                                                                                    |",
  "|  [User / Analyst] ────(Credentials)────> [1.0 Authenticate & Guard] <──>[D1:Users] |",
  "|          │                                      │                                  |",
  "|          │ (Property Specs)                     │ (Session Token)                  |",
  "|          ▼                                      ▼                                  |",
  "|  [2.0 Feature Preprocessor] ──> [3.0 Dual-Stage Hybrid Engine] <──>[D3:Coefficients]|",
  "|          ▲                                      │                                  |",
  "|          │                                      ▼                                  |",
  "|   [D2: Properties & Centroids]          [4.0 SHAP Explainer Engine]                |",
  "|          │                                      │                                  |",
  "|          ▼                                      ▼                                  |",
  "|  [5.0 Spatial GIS Engine] ──(Map Layers)──> [User View: Waterfall & Valuations]    |",
  "|                                                                                    |",
  "|  [Administrator] ──(Custom CSV)──> [6.0 In-Browser Dynamic Retraining] ──>[D3]     |",
  "+------------------------------------------------------------------------------------+"
];

doc.setFillColor(15, 23, 42);
doc.rect(margin, y, contentWidth, 38, 'F');
doc.setFont('courier', 'normal');
doc.setFontSize(6.2);
doc.setTextColor(56, 189, 248);
dfdBox.forEach((line, idx) => {
  doc.text(line, margin + 2.5, y + 4.2 + idx * 2.6);
});

y += 42;

y = drawParagraph(
  "Process Specifications (PSPEC) for Significant Processes:",
  y, 9.0, [15, 23, 42]
);

const pspecRows = [
  ["PSPEC 1.0", "Authentication", "Input: Email, Password. Action: Validate against D1. Output: JWT session token, Role.", "O(1) Hash Lookup"],
  ["PSPEC 2.0", "Feature Vectorizer", "Input: Raw UI specs. Action: Compute Area/BHK density, Bath/Bed ratio, Centroid dist.", "O(1) Transform"],
  ["PSPEC 3.0", "Hybrid Predictor", "Input: Vector X. Action: P_linear = X*W_ols; R_hat = XGBoost(X); P_final = P_lin + R_hat.", "O(Trees * Depth)"],
  ["PSPEC 4.0", "SHAP Attribution", "Input: P_final, E[Y]. Action: Decompose phi_j per feature. Output: Waterfall array.", "O(M) Attribution"],
  ["PSPEC 5.0", "Spatial Filter", "Input: Center lat, lng, radius. Action: Geodesic bounding query on properties.", "O(N) Geo Filter"],
  ["PSPEC 6.0", "Dynamic Retrainer", "Input: CSV records. Action: Group submarkets, compute base rates, refit slopes.", "O(N * Features)"]
];

y = drawTable(["Process", "Name", "Functional Transformation Algorithm", "Time Complexity"], pspecRows, y, [24, 30, 96, 32]);


// ============================================================================
// PAGE 6: CFD & STATE TRANSITION DIAGRAM (STD)
// ============================================================================
y = startNewPage("2. Analysis Model: CFD & STD");

y = drawSectionHeading("2.5 CONTROL FLOW DIAGRAM & CONTROL SPECIFICATIONS (CSPEC)", y);

y = drawParagraph(
  "The Control Flow Diagram (CFD) charts execution sequencing, event-driven conditional branching, and guard assertions across modules.",
  y
);

// CFD text diagram
const cfdBox = [
  "[Application Mount] ──> [Check LocalStorage Auth Token] ──(Valid?)──┐",
  "       ├── No ──> [Render Login View] ──(Submit Credentials)──> [Verify Hash] ──(Success?)──┐",
  "       │                                                                  ├── No ──> [Alert Toast]",
  "       └── Yes ───────────────────────────────────────────────────────────┴── Yes ──> [Mount App Shell]",
  "                                                                                               │",
  "       ┌──────────────────────────────┬───────────────────────────────┬────────────────────────┘",
  "       ▼                              ▼                               ▼",
  " [Route: /predict]            [Route: /spatial]               [Route: /admin]",
  "  • Slider Change Event        • Distance Drag Event           • CSV Drag & Drop Event",
  "  • Validate Bounds            • Query Centroid Radius         • Role Guard Check: Role == Admin?",
  "  • Dispatch Prediction        • Replot Leaflet Markers        • Parse CSV Stream & Update Weights"
];

doc.setFillColor(15, 23, 42);
doc.rect(margin, y, contentWidth, 32, 'F');
doc.setFont('courier', 'normal');
doc.setFontSize(6.0);
doc.setTextColor(56, 189, 248);
cfdBox.forEach((line, idx) => {
  doc.text(line, margin + 2.5, y + 4.2 + idx * 2.6);
});

y += 36;

y = drawSectionHeading("2.6 STATE TRANSITION DIAGRAM (STD)", y);

y = drawParagraph(
  "The State Transition Diagram models the operational states of the application runtime, event triggers, guards, and transition actions.",
  y
);

const stdRows = [
  ["Current State", "Event Trigger", "Guard Condition", "Target State", "Executed Action"],
  ["Unauthenticated", "SUBMIT_LOGIN", "Credentials == Valid", "Authenticated", "Save token to localStorage; load user profile"],
  ["Unauthenticated", "SUBMIT_LOGIN", "Credentials == Invalid", "Unauthenticated", "Trigger error toast notification; increment retry"],
  ["DashboardIdle", "SELECT_PREDICT", "None", "Predicting", "Mount prediction console; load locality base rates"],
  ["Predicting", "SLIDER_INPUT", "Area within [300, 10000]", "InferenceRunning", "Trigger Stage 1 OLS + Stage 2 XGBoost pipeline"],
  ["InferenceRunning", "CALC_COMPLETE", "None", "ValuationRendered", "Update animated price counter; render SHAP waterfall"],
  ["DashboardIdle", "SELECT_ADMIN", "role == 'admin'", "AdminConsole", "Display CSV upload zone and model retrainer"],
  ["DashboardIdle", "SELECT_ADMIN", "role != 'admin'", "DashboardIdle", "Trigger HTTP 403 Forbidden alert toast"],
  ["AdminConsole", "UPLOAD_CSV", "Valid CSV schema", "RetrainingModel", "Parse rows, compute submarket rates, update R2 score"]
];

y = drawTable(["Current State", "Event Trigger", "Guard", "Next State", "Action"], stdRows, y, [30, 28, 34, 32, 58]);


// ============================================================================
// PAGE 7: ACTIVITY, SEQUENCE & CLASS DIAGRAMS
// ============================================================================
y = startNewPage("2. Analysis Model: Activity, Sequence & Class");

y = drawSectionHeading("2.7 ACTIVITY DIAGRAM (VALUATION PIPELINE WORKFLOW)", y);

y = drawParagraph(
  "The Activity Diagram delineates the step-by-step workflow: Input -> Bounds Validation -> Parallel Stage 1 OLS & Stage 2 XGBoost -> Hybrid Synthesis -> SHAP Decomposition -> Leaflet GIS Pin Update -> Vector PDF Export.",
  y
);

y = drawSectionHeading("2.8 SEQUENCE DIAGRAM (INTERACTION TIME SEQUENCE)", y);

y = drawParagraph(
  "The Sequence Diagram captures message passing between User, React Predict Component, api.js Controller, Hybrid Engine, and SHAP Explainer:",
  y
);

const seqBox = [
  "User          React Predict View          api.js Service         Hybrid Engine          SHAP Explainer",
  " │                     │                        │                       │                      │",
  " ├─── Slider Drag ────>│                        │                       │                      │",
  " │                     ├─── requestPredict() ──>│                       │                      │",
  " │                     │                        ├── computeStage1() ───>│                      │",
  " │                     │                        │<── hedonicPrice ──────┤                      │",
  " │                     │                        ├── computeStage2() ───>│                      │",
  " │                     │                        │<── residualBonus ─────┤                      │",
  " │                     │                        ├── computeSHAP(P) ───────────────────────────>│",
  " │                     │                        │<── waterfallArray ───────────────────────────┤",
  " │                     │<── returnPayload ──────┤                       │                      │",
  " │<── Display Price ───┤                        │                       │                      │"
];

doc.setFillColor(15, 23, 42);
doc.rect(margin, y, contentWidth, 32, 'F');
doc.setFont('courier', 'normal');
doc.setFontSize(6.2);
doc.setTextColor(56, 189, 248);
seqBox.forEach((line, idx) => {
  doc.text(line, margin + 2.5, y + 4.2 + idx * 2.5);
});

y += 36;

y = drawSectionHeading("2.9 CLASS DIAGRAM (STRUCTURAL ENTITIES & METHODS)", y);

const classRows = [
  ["Class Name", "Key Attributes", "Key Operations & Methods", "Relational Dependencies"],
  ["UserSession", "userId, email, role, token", "+login(), +logout(), +hasAdminPrivilege()", "Authenticates User"],
  ["PropertyRecord", "locality, area, bhk, bath, age, lat, lng", "+validate(), +computeCBDDistance()", "Passed to ValuationEngine"],
  ["HedonicModel", "intercept, localityBaseRates", "+computeLinearFloor(PropertyRecord)", "Contained in HybridEngine"],
  ["XGBoostResidual", "nEstimators, maxDepth, learningRate", "+predictResidual(PropertyRecord)", "Contained in HybridEngine"],
  ["HybridEngine", "-stage1, -stage2, currentWeights", "+synthesizeValuation(), +retrainOnCSV()", "Produces ValuationResult"],
  ["ValuationResult", "finalPrice, hedonicPrice, bounds, shap", "+exportPDFCertificate(), +getFormattedPill()", "Contains SHAPAttribution"],
  ["SHAPAttribution", "featureName, featureValue, shapValueLakhs", "+getDirectionColor(), +getPercentageImpact()", "Rendered in Waterfall"]
];

y = drawTable(["Class", "Attributes", "Methods", "Dependencies"], classRows, y, [28, 44, 58, 52]);


// ============================================================================
// PAGE 8: DESIGN MODEL - ARCHITECTURAL DESIGN
// ============================================================================
y = startNewPage("3. Design Model: Architectural Design");

y = drawSectionHeading("3. DESIGN MODEL: 3.1 ARCHITECTURAL DESIGN", y);

y = drawParagraph(
  "3.1.1 System Architecture Diagram: EstateSense AI employs an event-driven 4-Tier Client-Centric Cloud-Native Architecture designed for instantaneous sub-millisecond mathematical appraisal.",
  y
);

// 4-Tier Architecture Box
const archBox = [
  "+------------------------------------------------------------------------------------+",
  "|                     ESTATESENSE AI 4-TIER ARCHITECTURAL TOPOLOGY                   |",
  "+------------------------------------------------------------------------------------+",
  "|  [TIER 1: PRESENTATION TIER]                                                       |",
  "|  React 19 SPA  |  Tailwind CSS 4 Glassmorphism  |  Recharts Waterfall  |  Leaflet  |",
  "|                           │ (Reactive User Input Events)                           |",
  "|                           ▼                                                        |",
  "|  [TIER 2: SERVICE & APPLICATION CONTROLLER TIER]                                   |",
  "|  Authentication Guards  •  CSV Ingestion Parser  •  Vector jsPDF Export Pipeline   |",
  "|                           │ (Sanitized Feature Vectors)                            |",
  "|                           ▼                                                        |",
  "|  [TIER 3: DUAL-STAGE MACHINE LEARNING & ANALYTICAL TIER]                           |",
  "|  Stage 1: OLS Hedonic Baseline    <───>    Stage 2: XGBoost Residual Booster       |",
  "|  Macro Submarket Pricing                   Non-Linear & Spatial Gravity Correction |",
  "|                           │                                                        |",
  "|                           └───> [SHAP Game-Theoretic Decomposition Engine]         |",
  "|                           │ (State Synchronization & Model Cache)                  |",
  "|                           ▼                                                        |",
  "|  [TIER 4: PERSISTENCE & LOCAL CACHING TIER]                                        |",
  "|  Browser LocalStorage  •  In-Memory Dataset (90 Properties)  •  Relational SQL     |",
  "+------------------------------------------------------------------------------------+"
];

doc.setFillColor(15, 23, 42);
doc.rect(margin, y, contentWidth, 48, 'F');
doc.setFont('courier', 'normal');
doc.setFontSize(6.0);
doc.setTextColor(56, 189, 248);
archBox.forEach((line, idx) => {
  doc.text(line, margin + 2.5, y + 4.2 + idx * 2.6);
});

y += 52;

y = drawParagraph(
  "3.1.2 Description of Architectural Design:",
  y, 9.0, [15, 23, 42]
);
y = drawParagraph(
  "• Modular Decoupling: Presentation components are strictly isolated from the mathematical regression solvers. UI components dispatch requests through the api.js service abstraction.\n• Zero-Round-Trip Client Inference: By hosting the linear and boosted estimators directly in the browser's optimized V8 engine, single property predictions execute in under 120ms without relying on remote network connectivity.\n• Graceful Degradation: If custom datasets lack certain non-linear features, the system seamlessly defaults to the robust Stage 1 Hedonic baseline without crashing.",
  y
);


// ============================================================================
// PAGE 9: DATABASE DESIGN - DATA DICTIONARY & NORMALIZATION
// ============================================================================
y = startNewPage("3. Design Model: Database Design");

y = drawSectionHeading("3.2 DATABASE DESIGN: DATA DICTIONARY & NORMALIZATION", y);

y = drawParagraph(
  "3.2.1 Data Dictionary: A precise listing of all primary data items, aliases, constraints, and process usages across EstateSense AI.",
  y
);

const dictRows = [
  ["user_id", "UID", "INT (PK, Auto)", "Auth / Guards", "Unique identifier for authenticated system users"],
  ["property_id", "PID", "INT (PK, Auto)", "Property Store", "Unique identifier for real estate transaction record"],
  ["location_name", "Locality", "VARCHAR(80)", "NEIGHBORHOODS", "Name of urban cluster (e.g. Indiranagar, Whitefield)"],
  ["base_rate_sqft", "BaseRate", "DECIMAL(10,2)", "Stage 1 Hedonic", "Locality baseline rate in ₹ per square foot"],
  ["built_up_area", "Area", "INT", "Stage 1 & 2 ML", "Total constructed carpet area in square feet (300 - 10000)"],
  ["bedrooms_bhk", "BHK", "INT", "Feature Matrix", "Count of dedicated bedroom accommodations (1 to 6)"],
  ["property_age", "Age", "INT", "XGBoost & Decay", "Building age since construction completion (0 to 40 yrs)"],
  ["distance_cbd", "d_CBD", "DECIMAL(6,2)", "Spatial GIS", "Euclidean distance to Bengaluru center (MG Road) in km"],
  ["final_predicted", "P_final", "DECIMAL(10,2)", "Valuation Engine", "Synthesized valuation: P_linear + R_xgboost (in ₹ Lakhs)"],
  ["shap_value", "phi_j", "DECIMAL(10,2)", "XAI Waterfall", "Marginal additive rupee contribution of attribute j (₹ Lakhs)"]
];

y = drawTable(["Item Name", "Alias", "Data Type", "Where Used", "Content Description & Constraints"], dictRows, y, [26, 20, 26, 30, 80]);

y += 3;
y = drawSectionHeading("3.2.2 DATABASE NORMALIZATION ANALYSIS", y);

y = drawParagraph(
  "To guarantee zero update, insertion, and deletion anomalies, the database schema was normalized systematically up to Boyce-Codd Normal Form (BCNF):",
  y
);

y = drawCalloutBox(
  "Normalization Stages & Mathematical Guarantees",
  [
    "• 1NF (Atomic Attributes): Every attribute contains strictly indivisible values. No repeating groups exist.",
    "• 2NF (Full Functional Dependency): All non-prime attributes functionally depend entirely on primary keys.",
    "   - In PROPERTIES, {property_id} -> {area, bhk, bath, age, price}. No partial key dependencies.",
    "• 3NF (Zero Transitive Dependencies): Locality economic attributes (base_rate, lat, lng, distance_to_cbd) were",
    "   transitive via locality_name. They are decoupled into the NEIGHBORHOODS table, eliminating transitive updates.",
    "• BCNF (Boyce-Codd Normal Form): For all functional dependencies X -> Y, X is a strict candidate superkey."
  ],
  y,
  [5, 150, 105],
  [240, 253, 244]
);


// ============================================================================
// PAGE 10: COMPONENT, PACKAGE & DEPLOYMENT DIAGRAMS
// ============================================================================
y = startNewPage("3. Design Model: Component Design");

y = drawSectionHeading("3.3 COMPONENT, PACKAGE & DEPLOYMENT DESIGN", y);

y = drawParagraph(
  "3.3.1 Component Diagram: Details how presentation components connect to analytical services and storage layers.",
  y
);

const compBox = [
  "+---------------------+   +---------------------+   +---------------------+",
  "|  PredictForm.jsx    |   |  SHAPWaterfall.jsx  |   |  SpatialMap.jsx     |",
  "+----------┬----------+   +----------┬----------+   +----------┬----------+",
  "           │                         │                         │",
  "           └─────────────────────────┼─────────────────────────┘",
  "                                     ▼",
  "                       +---------------------------+",
  "                       |      api.js Service       |",
  "                       +-------------┬-------------+",
  "                                     │",
  "           ┌─────────────────────────┼─────────────────────────┐",
  "           ▼                         ▼                         ▼",
  "+--------------------+    +--------------------+    +--------------------+",
  "| HedonicSolver (OLS)|    | XGBoostLearner (ML)|    | SHAPAttributionXAI |",
  "+--------------------+    +--------------------+    +--------------------+",
  "           │                         │                         │",
  "           └─────────────────────────┼─────────────────────────┘",
  "                                     ▼",
  "                       +---------------------------+",
  "                       | Browser LocalStorage & DB |",
  "                       +---------------------------+"
];

doc.setFillColor(15, 23, 42);
doc.rect(margin, y, contentWidth, 38, 'F');
doc.setFont('courier', 'normal');
doc.setFontSize(5.8);
doc.setTextColor(56, 189, 248);
compBox.forEach((line, idx) => {
  doc.text(line, margin + 2.5, y + 4.0 + idx * 2.4);
});

y += 42;

y = drawParagraph(
  "3.3.2 Package Diagram: Organizes modules into Presentation (src/pages, src/components), Business Logic (src/services), and Assets (public, data).",
  y
);

y = drawParagraph(
  "3.3.3 Deployment Diagram: Maps physical artifacts to runtime nodes:",
  y
);

const deployRows = [
  ["Deployment Node", "Artifact Running", "Runtime Environment", "Communication Protocol"],
  ["Client Workstation", "React 19 SPA, Tailwind CSS 4", "Web Browser (Chrome / Edge / Firefox)", "DOM Events / V8 Internal"],
  ["Analytical Core", "V8 JavaScript Inference Engine", "Client V8 ECMAScript Engine", "In-Memory Direct Method Calls"],
  ["Reporting Engine", "jsPDF 4.2.1 Vector Pipeline", "Client Web Worker / Browser Context", "Binary ArrayBuffer / Blob"],
  ["Web Server Node", "Vite Static Distribution Server", "Node.js v18.0+ / Local Host Server", "HTTP / HTTPS Port 5173"]
];

y = drawTable(["Node", "Artifact", "Environment", "Protocol"], deployRows, y, [34, 46, 56, 46]);


// ============================================================================
// PAGE 11: FLOWCHART & INTERFACE DESIGN (SCREENSHOTS)
// ============================================================================
y = startNewPage("3. Design Model: Flowchart & UI");

y = drawSectionHeading("3.3.4 ALGORITHMIC FLOWCHART & 3.4 INTERFACE DESIGN", y);

y = drawParagraph(
  "The algorithmic flowchart traces the exact computational lifecycle of the dual-stage inference pipeline:",
  y
);

const flowBox = [
  "   [Start: User inputs Area, BHK, Locality, Age, Type] ──>",
  "   [Lookup Neighborhood Centroid, BaseRate & CBD Distance] ──>",
  "   [Compute Stage 1 Linear OLS Floor: P_linear] ──>",
  "   [Construct Non-Linear Interaction Vector: Area/BHK, Bath/Bed, Age-Decay] ──>",
  "   [Execute Stage 2 XGBoost Residual Booster: R_hat] ──>",
  "   [Synthesize Hybrid Valuation: P_final = P_linear + R_hat] ──>",
  "   [Calculate 95% Confidence Bounds: +/- 6.8%] ──>",
  "   [Execute Game-Theoretic SHAP Decomposition: phi_j relative to E[Y]=110.50 L] ──>",
  "   [Render Value Pill, Confidence Range, and Color-Coded Waterfall Chart] ──> [End]"
];

doc.setFillColor(15, 23, 42);
doc.rect(margin, y, contentWidth, 26, 'F');
doc.setFont('courier', 'normal');
doc.setFontSize(6.0);
doc.setTextColor(56, 189, 248);
flowBox.forEach((line, idx) => {
  doc.text(line, margin + 2.5, y + 4.0 + idx * 2.5);
});

y += 30;

y = drawSectionHeading("3.4 INTERFACE DESIGN & SCREENSHOTS MAPPING", y);

y = drawParagraph(
  "The interface design provides structured, intuitive, and modern glassmorphic layouts across the 6 core application views:",
  y
);

const screenRows = [
  ["No.", "Screen Name", "Route Path", "Primary Functional Elements", "Evaluation Role"],
  ["01", "Home Landing Page", "http://localhost:5173/", "Hero banner, Core ML benchmarks, Navigation pills", "System Overview"],
  ["02", "Valuation Console", "http://localhost:5173/predict", "Numeric sliders (Area, BHK, Age), Locality picker", "Interactive Input"],
  ["03", "Prediction Result", "http://localhost:5173/predict", "Price Badge (₹ Lakhs), Confidence bounds (±6.8%)", "Valuation Output"],
  ["04", "Performance Dashboard", "http://localhost:5173/dashboard", "Comparison charts: OLS vs RF vs XGBoost vs Hybrid", "Comparative XAI"],
  ["05", "SHAP Explainability", "http://localhost:5173/explainable-ai", "Waterfall chart: Green premiums & Red deductions", "Model Transparency"],
  ["06", "PDF Valuation Report", "http://localhost:5173/predict (Modal)", "Downloadable institutional-grade valuation certificate", "Audit Certificate"]
];

y = drawTable(["No.", "Screen Name", "Route", "UI Elements", "Role"], screenRows, y, [10, 36, 42, 64, 30]);


// ============================================================================
// PAGE 12: APPENDICES - GLOSSARY & TBD LIST
// ============================================================================
y = startNewPage("Appendices: Glossary & TBD List");

y = drawSectionHeading("APPENDIX B1 / C1: GLOSSARY & ACRONYMS", y);

const glossaryRows = [
  ["AVM", "Automated Valuation Model", "Algorithm-driven software calculating real estate asset pricing from tabular records."],
  ["OLS", "Ordinary Least Squares", "Linear regression technique minimizing sum of squared differences to compute macro baseline."],
  ["Hedonic Model", "Hedonic Pricing Model", "Econometric pricing theory decomposing market price into composite utility characteristics."],
  ["XGBoost", "Extreme Gradient Boosting", "Scalable gradient-boosted decision tree library capturing complex non-linear residuals."],
  ["SHAP", "Shapley Additive Explanations", "Cooperative game theory method explaining individual predictions through marginal attributions."],
  ["GIS", "Geographic Information System", "Framework for analyzing spatial coordinates, submarket boundaries, and distance gravity."],
  ["CBD", "Central Business District", "Commercial and economic focal center of a metropolitan region (e.g. MG Road, Bengaluru)."],
  ["MAE", "Mean Absolute Error", "Average absolute magnitude of prediction errors in ₹ Lakhs (EstateSense AI = ₹ 8.45 L)."],
  ["R2 Score", "Coeff. of Determination", "Proportion of variance explained by model (EstateSense AI = 0.9320 or 93.2% explained)."]
];

y = drawTable(["Acronym", "Full Term", "Technical Definition & Context"], glossaryRows, y, [24, 38, 120]);

y += 4;
y = drawSectionHeading("APPENDIX B2 / C2: TO BE DETERMINED (TBD) LIST", y);

const tbdRows = [
  ["TBD-1", "Computer Vision", "Convolutional Neural Network (CNN) integration for aerial facade scoring.", "Planned Release v3.0"],
  ["TBD-2", "Blockchain", "Smart contract integration on Ethereum/Polygon for immutable title deed validation.", "Phase II Research"],
  ["TBD-3", "Macro API", "Live streaming integration with RBI repo rates and municipal infrastructure feeds.", "Contract Specification"],
  ["TBD-4", "Mobile Platform", "React Native mobile client with on-site GPS geofencing and instant appraisal.", "Future Roadmap"]
];

y = drawTable(["Item", "Subsystem", "Pending Technical Roadmap Item", "Planned Status"], tbdRows, y, [20, 32, 88, 42]);

y += 8;
doc.setFillColor(248, 250, 252);
doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'F');
doc.setDrawColor(203, 213, 225);
doc.setLineWidth(0.3);
doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(15, 23, 42);
doc.text("END OF SOFTWARE DESIGN SPECIFICATION (SDS)", pageWidth / 2, y + 7, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(100, 116, 139);
doc.text("Compliant with IEEE Std 1016-2009 & IEEE Std 830-1998 Standards", pageWidth / 2, y + 12, { align: 'center' });
doc.text("Approved for Departmental Review, Technical Viva Voce & College Submission", pageWidth / 2, y + 16, { align: 'center' });

// Save SDS PDF
const sdsOutputPath = "EstateSense_AI_Software_Design_Specification_SDS.pdf";
const sdsBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(sdsOutputPath, sdsBuffer);
console.log(`Successfully generated SDS PDF: ${sdsOutputPath} (${sdsBuffer.length} bytes, ${currentPage} pages)`);
