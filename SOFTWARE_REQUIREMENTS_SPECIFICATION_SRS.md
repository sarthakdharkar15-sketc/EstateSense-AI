# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## For EstateSense AI: Dual-Stage Hybrid House Price Prediction System with Explainable AI (SHAP) & Spatial GIS Analytics

**Document Version:** 1.0.0  
**Status:** Approved / Academic Release  
**Standard:** IEEE Std 830-1998 Compliant  
**Project:** EstateSense AI Real Estate Valuation Platform  

---

## TABLE OF CONTENTS
1. [Introduction](#1-introduction)
   - 1.1 Purpose
   - 1.2 Document Conventions
   - 1.3 Intended Audience and Reading Suggestions
   - 1.4 Project Scope
   - 1.5 Definitions, Acronyms, and Abbreviations
   - 1.6 References
2. [Overall Description](#2-overall-description)
   - 2.1 Product Perspective
   - 2.2 Product Functions
   - 2.3 User Classes and Characteristics
   - 2.4 Operating Environment
   - 2.5 Design and Implementation Constraints
   - 2.6 Assumptions and Dependencies
3. [System Features & Functional Requirements](#3-system-features--functional-requirements)
   - 3.1 FR-1: User Authentication & Role-Based Access Control
   - 3.2 FR-2: Single Property Valuation Engine
   - 3.3 FR-3: Batch Property Valuation via CSV Ingestion
   - 3.4 FR-4: Dual-Stage Hybrid Machine Learning Inference Pipeline
   - 3.5 FR-5: Explainable AI (Local & Global SHAP Decomposition)
   - 3.6 FR-6: Spatial GIS Analysis & Price Gravity Mapping
   - 3.7 FR-7: In-Browser Dynamic Model Retraining
   - 3.8 FR-8: Audit-Ready PDF Valuation Certificate Generation
   - 3.9 FR-9: Model Benchmarking & Multi-Algorithm Comparison
   - 3.10 FR-10: Network Latency Simulation & Tuning
4. [External Interface Requirements](#4-external-interface-requirements)
   - 4.1 User Interfaces
   - 4.2 Hardware Interfaces
   - 4.3 Software Interfaces
   - 4.4 Communications Interfaces
5. [Non-Functional Requirements (NFRs)](#5-non-functional-requirements-nfrs)
   - 5.1 Performance Requirements
   - 5.2 Safety & Reliability Requirements
   - 5.3 Security Requirements
   - 5.4 Software Quality Attributes (Portability, Maintainability, Usability)
6. [System Evolution & Future Scope](#6-system-evolution--future-scope)

---

## 1. INTRODUCTION

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) document is to provide a complete, rigorous, and formal description of the functional and non-functional requirements for **EstateSense AI**. This document details the software capabilities, architectural boundaries, modeling mechanisms, user interfaces, and environmental prerequisites for stakeholders, evaluators, developers, and project guides.

### 1.2 Document Conventions
This document adheres to the **IEEE Std 830-1998** standard for software requirements specification. 
- Requirement identifiers are labeled as **FR-[Number]** for Functional Requirements and **NFR-[Number]** for Non-Functional Requirements.
- The keywords *SHALL*, *MUST*, *SHOULD*, and *MAY* indicate requirement priority as per RFC 2119.

### 1.3 Intended Audience and Reading Suggestions
- **Academic Evaluators / Viva Examiners:** Review Sections 1.4, 2.2, 3, and 5 for academic compliance and system feasibility.
- **Software Engineers / Developers:** Refer to Sections 3 and 4 for component logic, mathematical formulas, and interface hooks.
- **System Architects:** Focus on Section 2.1, 3.4, and 3.5 for hybrid ML pipeline constraints and data flow mechanisms.

### 1.4 Project Scope
EstateSense AI is an explainable automated valuation model (AVM) designed for urban residential real estate (benchmarked on Bengaluru Metropolitan Region data). It solves the classic trade-off between linear interpretability (OLS) and non-linear ensemble accuracy (XGBoost) by deploying a dual-stage residual learning pipeline integrated with Shapley Additive Explanations (SHAP) and Leaflet GIS mapping.

### 1.5 Definitions, Acronyms, and Abbreviations
- **AVM:** Automated Valuation Model
- **OLS:** Ordinary Least Squares (Hedonic Linear Regression)
- **XGBoost:** Extreme Gradient Boosting
- **SHAP:** Shapley Additive Explanations (Game-Theoretic Feature Attribution)
- **GIS:** Geographic Information System
- **CBD:** Central Business District (commercial core, e.g., MG Road, Bengaluru)
- **MAE:** Mean Absolute Error
- **RMSE:** Root Mean Squared Error
- **MAPE:** Mean Absolute Percentage Error
- **$R^2$:** Coefficient of Determination

### 1.6 References
1. IEEE Std 830-1998, *IEEE Recommended Practice for Software Requirements Specifications*.
2. Rosen, S. (1974), *Hedonic prices and implicit markets*, Journal of Political Economy.
3. Lundberg, S. M. & Lee, S. I. (2017), *A Unified Approach to Interpreting Model Predictions (SHAP)*, NeurIPS.
4. Chen, T. & Guestrin, C. (2016), *XGBoost: A Scalable Tree Boosting System*, ACM SIGKDD.

---

## 2. OVERALL DESCRIPTION

### 2.1 Product Perspective
EstateSense AI operates as a modern client-centric Single Page Application (SPA) with a simulated micro-service backend. It provides an enterprise-grade analytics dashboard, interactive GIS spatial analysis, real-time regression training, and audit-ready report generation.

```
+─────────────────────────────────────────────────────────────────────────+
|                           ESTATESENSE AI ECOSYSTEM                      |
+─────────────────────────────────────────────────────────────────────────+
|  [Presentation Layer]    React 19, Tailwind CSS 4, Recharts, Leaflet    |
|  [Simulation Layer]      REST-style API Service with Dynamic Latency   |
|  [Inference Engine]      Dual-Stage Hybrid (OLS Baseline + XGBoost Res) |
|  [XAI Layer]             SHAP Marginal Contribution Decomposer          |
|  [Storage / Cache]       Browser Local Storage & State Cache (D1-D4)   |
|  [Third-Party Service]   CartoDB / OpenStreetMap Geospatial Tile API    |
+─────────────────────────────────────────────────────────────────────────+
```

### 2.2 Product Functions
1. **Interactive Valuation:** Real-time predictive pricing based on multi-dimensional property attributes.
2. **Batch Valuation Engine:** Multi-row CSV parsing and parallel appraisal computation.
3. **Dual-Stage Residual Estimation:** Combines linear baseline price with non-linear tree corrections.
4. **SHAP Feature Attribution:** Calculates exact monetary value contributions (in ₹ Lakhs) for every attribute.
5. **Spatial GIS Intelligence:** Geographic distance-decay calculation from the city's commercial centroid.
6. **Dynamic In-Browser Retraining:** Auto-recalculates coefficients and base rates upon uploading custom CSV files.
7. **Institutional Export:** Generates downloadable, vector-rendered valuation reports in PDF format.

### 2.3 User Classes and Characteristics
1. **General User / Real Estate Buyer / Broker:**
   - Technical Expertise: Beginner to Intermediate.
   - Privileges: Execute property valuations, view SHAP waterfalls, inspect GIS gravity maps, compare models, and export PDF certificates.
2. **Administrator / Data Scientist / Appraiser:**
   - Technical Expertise: Advanced.
   - Privileges: All general user privileges, plus uploading custom property datasets, triggering client-side dynamic retraining, running cross-validation, and adjusting simulated API latency.

### 2.4 Operating Environment
- **Client Platforms:** Web Browsers supporting ECMAScript 2022+ (Google Chrome 100+, Mozilla Firefox 100+, Microsoft Edge 100+, Apple Safari 15+).
- **Display Resolution:** Responsive design supporting Viewports from 1280×720 (minimum) to 3840×2160 (4K).
- **Hosting / Runtime:** Node.js v18.0+ and modern HTTP/HTTPS web servers.

### 2.5 Design and Implementation Constraints
- **Client-Side Compute Budget:** Dynamic retraining algorithms are bounded to a maximum sample of 2,000 records to prevent freezing browser UI worker threads.
- **Geographic Scope:** Built-in default model is calibrated to Bengaluru residential housing clusters; users must upload localized CSV data for other municipal territories.
- **Zero-Backend Dependency:** Core application operates fully standalone without requiring continuous Python/CUDA server availability.

### 2.6 Assumptions and Dependencies
- Modern browser JavaScript execution is enabled.
- External internet access is available for fetching CartoDB/OpenStreetMap raster map tiles.
- Uploaded CSV datasets contain at least numerical columns for area, price, and categorical locality attributes.

---

## 3. SYSTEM FEATURES & FUNCTIONAL REQUIREMENTS

### 3.1 FR-1: User Authentication & Role-Based Access Control
- **Description:** The system shall authenticate users and enforce role-based access.
- **Inputs:** User email address and password string.
- **Processing:** Validates credentials against cached user store (`localStorage`), generates a mock session token, and sets role state (`Administrator` or `Member`).
- **Outputs:** Authentication status flag, user profile state, and conditional navigation bar rendering.

### 3.2 FR-2: Single Property Valuation Engine
- **Description:** Allows users to input detailed architectural and spatial parameters for an individual property appraisal.
- **Inputs:**
  - Area: Float (300 to 10,000 Sq.Ft.)
  - Bedrooms: Integer (1 to 8 BHK)
  - Bathrooms: Integer (1 to 8)
  - Locality: Nominal string (Indiranagar, Koramangala, Whitefield, etc.)
  - Age: Float (0 to 50 years)
  - Floors: Integer (1 to 40)
  - Parking Slots: Integer (0 to 5)
  - Furnishing State: Categorical (Unfurnished, Semi-Furnished, Fully Furnished)
  - Property Type: Categorical (Apartment, Independent House, Villa, Penthouse)
- **Validation:** If any required parameter is null or outside valid numerical bounds, the system shall display a descriptive error toast and halt computation.
- **Outputs:** Estimated Valuation (in ₹ Lakhs) and 95% Confidence Valuation Band $[\hat{P}_{\text{min}}, \hat{P}_{\text{max}}]$.

### 3.3 FR-3: Batch Property Valuation via CSV Ingestion
- **Description:** Enables institutional users to upload bulk property registries for simultaneous appraisal.
- **Inputs:** `.csv` formatted transaction file.
- **Processing:** System auto-detects column headers using alias matching (`total_sqft` $\to$ `area`, `bhk` $\to$ `bedrooms`, `rate` $\to$ `price`), parses rows, and maps them to input vectors.
- **Outputs:** Tabular batch appraisal output with individual predicted prices, confidence brackets, and bulk summary statistics.

### 3.4 FR-4: Dual-Stage Hybrid Machine Learning Inference Pipeline
- **Description:** The core ML engine shall synthesize linear hedonic models with gradient boosted residual learning.
- **Mathematical Specification:**
  1. **Stage 1 (Hedonic Baseline OLS):**
     $$\hat{P}_{\text{linear}} = \beta_0 + \sum_{i=1}^{k} \beta_i X_i + \left(\text{Area} \times \text{BaseRate}_{\text{loc}}\right)$$
  2. **Stage 2 (Non-linear Residual Correction):**
     $$\hat{R} = \text{XGBoost}(X_{\text{spatial}}, X_{\text{structural}}, X_{\text{amenities}})$$
  3. **Stage 3 (Hybrid Synthesis):**
     $$\hat{P}_{\text{final}} = \hat{P}_{\text{linear}} + \hat{R}$$
- **Outputs:** Final estimated valuation $\hat{P}_{\text{final}}$ combining macroeconomic floor pricing and micro-location corrections.

### 3.5 FR-5: Explainable AI (Local & Global SHAP Decomposition)
- **Description:** Every valuation prediction shall be mathematically decomposed into exact feature-by-feature monetary contributions.
- **Mathematical Specification:**
  $$\hat{P}_{\text{final}} = \mathbb{E}[P] + \sum_{j=1}^{M} \phi_j$$
  Where $\phi_j$ is the Shapley marginal attribution of attribute $j$.
- **Outputs:**
  - Positive Contributions (Green): e.g., $+₹14.2\text{ Lakhs for Indiranagar location premium}$.
  - Negative Deductions (Red): e.g., $-₹4.8\text{ Lakhs for property age } > 12\text{ years}$.
  - Interactive Recharts Waterfall Bar Chart.
  - Natural-language textual summary explaining key value drivers.

### 3.6 FR-6: Spatial GIS Analysis & Price Gravity Mapping
- **Description:** The system shall plot real estate geographic distributions and evaluate spatial distance to key economic epicenters.
- **Processing:** Calculates Euclidean/haversine distance from Bengaluru CBD (MG Road coordinates: $12.9784^{\circ}\text{N}, 77.6408^{\circ}\text{E}$):
  $$d_{\text{CBD}} = \sqrt{(\text{lat} - \text{lat}_0)^2 + (\text{lng} - \text{lng}_0)^2} \times 111\text{ km}$$
- **Outputs:** Interactive Leaflet GIS map with color-coded property markers, dynamic price gravity contours, and radial distance threshold rings.

### 3.7 FR-7: In-Browser Dynamic Model Retraining
- **Description:** Allows administrators to train custom models instantly upon uploading proprietary datasets without code modifications.
- **Processing:**
  - Auto-groups records by locality to recalculate baseline rates per sq.ft. bounded between ₹2,500 and ₹25,000.
  - Recomputes regression slope weights for bedrooms, bathrooms, and age.
  - Executes 5-fold cross-validation returning updated $R^2$, MAE, RMSE, and MAPE scores.
- **Outputs:** Real-time notification of active model replacement and updated performance charts.

### 3.8 FR-8: Audit-Ready PDF Valuation Certificate Generation
- **Description:** Generates an official, publication-quality appraisal document.
- **Processing:** Executes vector drawing routines using `jsPDF` to compile property attributes, valuation estimates, SHAP breakdown bars, timestamp, and verification hash.
- **Outputs:** Downloadable `.pdf` document named `valuation_report.pdf`.

### 3.9 FR-9: Model Benchmarking & Multi-Algorithm Comparison
- **Description:** System shall provide side-by-side performance comparison of 4 architectures:
  1. Ordinary Least Squares (OLS) Hedonic Baseline
  2. Standalone Random Forest Regressor
  3. Standalone Gradient Boosting Regressor
  4. Proposed EstateSense Hybrid Model (OLS + XGBoost + SHAP)
- **Outputs:** Benchmark comparison matrix displaying MAE, RMSE, $R^2$, and MAPE.

### 3.10 FR-10: Network Latency Simulation & Tuning
- **Description:** Provides an administrator slider to introduce artificial latency between 0ms and 2000ms.
- **Purpose:** Demonstrates system UI resilience, asynchronous spinners, and realistic client-server round-trip conditions during viva demonstrations.

---

## 4. EXTERNAL INTERFACE REQUIREMENTS

### 4.1 User Interfaces
- **Theme:** Dark slate modern dashboard palette (Slate-900 background, Indigo-500 primary accents, Emerald-500 positive indicators, Rose-500 deduction indicators).
- **Navigation:** Persistent responsive sidebar routing between Home, Dashboard, Predict, Explainable AI, Spatial Analysis, Architecture, Performance, Compare, Dataset, and Admin views.
- **Visualization:** Interactive SVG waterfall charts, animated numerical counters, and Leaflet GIS canvas.

### 4.2 Hardware Interfaces
- No direct custom hardware interface required; communicates via standard screen display and mouse/touch input devices.

### 4.3 Software Interfaces
- **Leaflet & React-Leaflet:** GIS map rendering engine.
- **CartoDB Dark Matter / OpenStreetMap:** Raster tile server providing cartographic mapping imagery.
- **jsPDF & html2canvas:** PDF canvas rendering engine.
- **Browser Web Storage API:** Provides persistent client-side data stores for datasets, authentication tokens, and custom weights.

### 4.4 Communications Interfaces
- Standard HTTP/HTTPS protocol for fetching online map tiles and external web fonts.
- RESTful JSON messaging payloads for simulated client-side API routing.

---

## 5. NON-FUNCTIONAL REQUIREMENTS (NFRs)

### 5.1 Performance Requirements
- **NFR-1.1 (Prediction Latency):** In standard simulation mode, valuation predictions and SHAP computations shall complete in under **200 milliseconds**.
- **NFR-1.2 (Batch Parsing Throughput):** The system shall parse and appraise a 1,000-row CSV dataset in under **1.5 seconds**.
- **NFR-1.3 (Rendering Smoothness):** Interactive map panning, zooming, and slider adjustments shall maintain a minimum frame rate of **50 frames per second (FPS)**.

### 5.2 Safety & Reliability Requirements
- **NFR-2.1 (Input Sanitization):** The system shall sanitize all text inputs and CSV cells to protect against script injection and formula injection.
- **NFR-2.2 (Graceful Degradation):** In the event of network tile failure from the map provider, the system shall continue to display coordinate scatters and valuation predictions without crashing.
- **NFR-2.3 (Value Clamping):** Property valuations shall enforce sanity bounds (never producing negative prices or anomalous values $> 100\times$ market average).

### 5.3 Security Requirements
- **NFR-3.1 (Role Enforcement):** Retraining actions and dataset overwriting functions shall be strictly gated behind Administrator privileges.
- **NFR-3.2 (Credential Protection):** Authentication passwords in local cache shall not be stored in raw plain text.

### 5.4 Software Quality Attributes
- **Usability:** User interface elements shall include descriptive tooltips, clear unit notations (₹ Lakhs, Sq.Ft.), and color-coded explainability cues.
- **Portability:** The web application shall operate consistently across Windows, macOS, Linux, Android, and iOS web browsers without native compilation.
- **Maintainability:** Codebase is modularized into reusable React components (`/components`), distinct view pages (`/pages`), and isolated business logic services (`/services`).

---

## 6. SYSTEM EVOLUTION & FUTURE SCOPE
1. **Real-time Satellite Vision Module:** Integration with aerial drone imagery and satellite feeds to score exterior building quality and road accessibility.
2. **Direct Python FastAPI Microservice:** Migration option to connect the frontend to a remote CUDA-accelerated GPU cluster running PyTorch and cuML.
3. **Automated Land Registry Verification:** Blockchain smart contract hooks for verifying title ownership directly through municipal portals.

---

**Prepared By:** Project Engineering Team  
**Verified By:** Academic Project Coordinator / Guide  
**Department:** Computer Science & Engineering  
