// Mock Data Service for Explainable House Price Prediction Project

export const NEIGHBORHOOD_CONFIGS = {
  "Indiranagar": { baseRate: 8500, lat: 12.9784, lng: 77.6408, distance: 5.5 },
  "Koramangala": { baseRate: 8000, lat: 12.9352, lng: 77.6244, distance: 6.2 },
  "Whitefield": { baseRate: 5200, lat: 12.9698, lng: 77.7500, distance: 17.5 },
  "Jayanagar": { baseRate: 7500, lat: 12.9308, lng: 77.5830, distance: 5.0 },
  "HSR Layout": { baseRate: 6200, lat: 12.9141, lng: 77.6413, distance: 8.5 },
  "Malleshwaram": { baseRate: 7000, lat: 12.9982, lng: 77.5721, distance: 3.8 }
};

// Generates an array of realistic mock properties
const generateMockProperties = () => {
  const neighborhoods = Object.keys(NEIGHBORHOOD_CONFIGS);
  const types = ["Apartment", "Villa", "Penthouse", "Independent House"];
  const furnishingStates = ["Unfurnished", "Semi-Furnished", "Fully-Furnished"];
  const properties = [];

  // Seed coordinates and parameters around the neighborhoods
  let id = 1;
  neighborhoods.forEach((neighborhood, nIdx) => {
    const config = NEIGHBORHOOD_CONFIGS[neighborhood];
    const count = 15; // 15 properties per neighborhood = 90 total properties

    for (let i = 0; i < count; i++) {
      // Small random variations around neighborhood center coords
      const latOffset = (Math.random() - 0.5) * 0.015;
      const lngOffset = (Math.random() - 0.5) * 0.015;
      const lat = parseFloat((config.lat + latOffset).toFixed(5));
      const lng = parseFloat((config.lng + lngOffset).toFixed(5));

      // Calculate distance based on offset
      const distOffset = (Math.random() - 0.5) * 2;
      const distance = parseFloat(Math.max(1.0, config.distance + distOffset).toFixed(2));

      // Area, layout, age variables
      const area = Math.floor(800 + Math.random() * 3200 + (i % 3) * 400);
      const bedrooms = Math.floor(1 + Math.random() * 3 + (area > 2000 ? 1 : 0));
      const bathrooms = Math.max(1, bedrooms - Math.floor(Math.random() * 1.5));
      const age = Math.floor(Math.random() * 20);
      const floors = Math.floor(1 + Math.random() * 4);
      const parking = Math.floor(Math.random() * 3);
      
      const type = types[Math.floor(Math.random() * types.length)];
      const furnishing = furnishingStates[Math.floor(Math.random() * furnishingStates.length)];

      // Hedonic Base Price Calculation
      const basePrice = (area * config.baseRate) / 100000; // in Lakhs
      const bedPremium = bedrooms * 4.5;
      const bathPremium = bathrooms * 2.5;
      const ageDepreciation = age * 0.8;
      const distanceDiscount = distance * 0.9;
      
      let typeBonus = 0;
      if (type === "Villa") typeBonus = 12.0;
      else if (type === "Penthouse") typeBonus = 18.0;

      let furnishingBonus = 0;
      if (furnishing === "Fully-Furnished") furnishingBonus = 6.0;
      else if (furnishing === "Semi-Furnished") furnishingBonus = 3.0;

      const hedonicPrice = parseFloat((basePrice + bedPremium + bathPremium - ageDepreciation - distanceDiscount + typeBonus + furnishingBonus).toFixed(2));

      // XGBoost Residual simulation (nonlinear interactions, e.g. age-area interaction)
      // High area and low age gets a bonus, small area and old age gets discount
      let residual = 0;
      if (area > 2200 && age < 5) {
        residual = parseFloat((4.5 + Math.random() * 4.0).toFixed(2));
      } else if (area < 1200 && age > 12) {
        residual = parseFloat((-3.5 - Math.random() * 3.0).toFixed(2));
      } else {
        residual = parseFloat(((Math.random() - 0.5) * 4.0).toFixed(2));
      }

      const price = parseFloat((hedonicPrice + residual).toFixed(2));

      properties.push({
        id,
        area,
        bedrooms,
        bathrooms,
        age,
        floors,
        parking,
        type,
        furnishing,
        location: neighborhood,
        latitude: lat,
        longitude: lng,
        distanceFromCenter: distance,
        hedonicPrice,
        residual,
        price
      });
      id++;
    }
  });

  return properties;
};

export const MOCK_PROPERTIES = generateMockProperties();

// Aggregated Stats
export const DATASET_STATS = {
  totalRecords: 21613, // University project total dataset size
  demoRecords: MOCK_PROPERTIES.length,
  totalFeatures: 12,
  numericalFeatures: 8,
  categoricalFeatures: 3,
  spatialFeatures: 3,
  avgPrice: parseFloat((MOCK_PROPERTIES.reduce((sum, p) => sum + p.price, 0) / MOCK_PROPERTIES.length).toFixed(2)),
  highestPriceArea: "Indiranagar",
  lowestPriceArea: "Whitefield",
  avgPricePerSqFt: Math.round(
    MOCK_PROPERTIES.reduce((sum, p) => sum + (p.price * 100000) / p.area, 0) / MOCK_PROPERTIES.length
  )
};

// Global Feature Importance for Recharts (SHAP values)
export const GLOBAL_FEATURE_IMPORTANCE = [
  { name: "Property Area (sq.ft.)", importance: 32.4 },
  { name: "Neighborhood Rate", importance: 24.8 },
  { name: "Bedrooms Count", importance: 12.5 },
  { name: "Distance from Center", importance: 9.3 },
  { name: "Property Age", importance: 7.1 },
  { name: "Bathrooms Count", importance: 5.6 },
  { name: "Parking Spaces", intelligence: 4.8, importance: 4.8 },
  { name: "Furnishing Status", importance: 3.5 }
];

// Model Comparison Metrics
export const MODEL_PERFORMANCE_METRICS = [
  { model: "Hedonic Regression", mae: "5.42", rmse: "7.15", r2: "74.8%", mape: "8.32%" },
  { model: "Random Forest", mae: "4.12", rmse: "5.82", r2: "83.1%", mape: "6.24%" },
  { model: "XGBoost", mae: "3.75", rmse: "5.12", r2: "86.4%", mape: "5.71%" },
  { model: "Hybrid RF (Hedonic + RF)", mae: "3.48", rmse: "4.76", r2: "88.7%", mape: "5.19%" },
  { model: "Hybrid XGBoost (Proposed)", mae: "2.95", rmse: "3.92", r2: "92.3%", mape: "4.25%" }
];

// Experiment List
export const RESEARCH_EXPERIMENTS = [
  {
    id: "EXP-01",
    name: "Experiment 01",
    model: "Hedonic Regression",
    objective: "Establish an interpretable linear baseline model for pricing analysis.",
    parameters: "OLS Regression, standard feature inputs.",
    r2: "74.8%",
    rmse: "₹7.15L",
    status: "Completed"
  },
  {
    id: "EXP-02",
    name: "Experiment 02",
    model: "Random Forest",
    objective: "Evaluate nonlinear ensemble learning capacity on dataset.",
    parameters: "n_estimators=200, max_depth=12, random_state=42.",
    r2: "83.1%",
    rmse: "₹5.82L",
    status: "Completed"
  },
  {
    id: "EXP-03",
    name: "Experiment 03",
    model: "XGBoost",
    objective: "Evaluate gradient boosting performance under custom hyperparameters.",
    parameters: "learning_rate=0.05, max_depth=6, n_estimators=300.",
    r2: "86.4%",
    rmse: "₹5.12L",
    status: "Completed"
  },
  {
    id: "EXP-04",
    name: "Experiment 04",
    model: "Hedonic + RF Residual",
    objective: "Evaluate residual learning logic by mapping linear errors using Random Forest.",
    parameters: "Target = Actual - HedonicPred; Estimator = Random Forest.",
    r2: "88.7%",
    rmse: "₹4.76L",
    status: "Completed"
  },
  {
    id: "EXP-05",
    name: "Experiment 05",
    model: "Hedonic + XGBoost Residual",
    objective: "Evaluate the proposed hybrid framework combining OLS baseline and XGBoost residual corrector.",
    parameters: "Target = Actual - HedonicPred; Estimator = XGBoost.",
    r2: "92.3%",
    rmse: "₹3.92L",
    status: "Completed"
  },
  {
    id: "EXP-06",
    name: "Experiment 06",
    model: "Hybrid + Spatial Features",
    objective: "Determine impact of geographic variables (distance, lat/long clusterings) inside the ML residual model.",
    parameters: "Features += [Distance from city center, Coordinates, Local Density].",
    r2: "93.1%",
    rmse: "₹3.64L",
    status: "Running"
  },
  {
    id: "EXP-07",
    name: "Experiment 07",
    model: "Hybrid + SHAP Explanations",
    objective: "Integrate KernelExplainer and TreeExplainer to produce local predictions with mathematical explanations.",
    parameters: "SHAP library integration, JavaScript translation wrappers.",
    r2: "92.3%",
    rmse: "₹3.92L",
    status: "Demo"
  }
];

// Features List for Dataset Page
export const DATASET_FEATURES = [
  { name: "Area", type: "Numerical", unit: "Sq.Ft.", description: "Total built-up/super area of the residential unit." },
  { name: "Bedrooms", type: "Numerical", unit: "Count", description: "Number of standard bedrooms in the unit." },
  { name: "Bathrooms", type: "Numerical", unit: "Count", description: "Number of bathrooms connected to rooms or shared." },
  { name: "Property Age", type: "Numerical", unit: "Years", description: "Number of years elapsed since construction completion." },
  { name: "Floors", type: "Numerical", unit: "Count", description: "The level index on which the property is located." },
  { name: "Parking Spaces", type: "Numerical", unit: "Count", description: "Allocated slots in basement or open yard." },
  { name: "Property Type", type: "Categorical", unit: "String", description: "Type of housing layout: Apartment, Villa, Penthouse, etc." },
  { name: "Furnishing Status", type: "Categorical", unit: "String", description: "Level of interior fittings: Fully-Furnished, Semi-Furnished, Unfurnished." },
  { name: "Location / Locality", type: "Categorical", unit: "String", description: "Neighborhood cluster name inside Bengaluru city boundaries." },
  { name: "Latitude", type: "Numerical", unit: "Degrees", description: "Geographical Y coordinate for spatial calculations." },
  { name: "Longitude", type: "Numerical", unit: "Degrees", description: "Geographical X coordinate for spatial calculations." },
  { name: "Distance from Center", type: "Numerical", unit: "Kilometers", description: "Straight-line radial distance to MG Road (city center)." },
  { name: "Price (Target)", type: "Numerical (Target)", unit: "₹ Lakhs", description: "Final transacted or valuation pricing of the property." }
];
