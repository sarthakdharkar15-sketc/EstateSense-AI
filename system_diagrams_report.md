# House Price Prediction System - System Design Diagrams

This report provides the system architecture, flow, data structures, and state transitions for the **House Price Prediction System with Explainable AI (SHAP)**. The diagrams are represented using **Mermaid.js** format, which can be viewed directly in markdown viewers or copied into report documentation.

---

## 1. Use Case Diagram

The **Use Case Diagram** illustrates the interactions between the system's actors (the standard **User/Member** and the **Administrator**) and the various functionalities (use cases) provided by the application.

```mermaid
graph LR
    %% Actors
    User((User / Member))
    Admin((Administrator))

    subgraph Use Cases
        UC1([Register & Authenticate])
        UC2([View Project Dashboard & Stats])
        UC3([Predict House Price])
        UC4([Interpret Local SHAP Explanations])
        UC5([Explore Spatial Map Analysis])
        UC6([Compare Model Performance])
        UC7([View Research Experiments])
        UC8([Upload Custom Dataset])
        UC9([Train/Retrain Model dynamically])
        UC10([Adjust System Latency])
    end

    %% User Relations
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7

    %% Admin Inheritance & Relations
    Admin --> User
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10

    %% Styling
    style User fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#f8fafc
    style Admin fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc
    classDef ucStyle fill:#1e293b,stroke:#10b981,stroke-width:1.5px,color:#f8fafc;
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10 ucStyle;
```

### Description of Use Cases:
* **Register & Authenticate:** Users can create an account and log in. An administrator has special elevated roles.
* **View Project Dashboard:** Displays general information, performance curves, global feature importance charts, and key stats.
* **Predict House Price:** Input area, bedrooms, bathrooms, location, age, parking, type, and furnishing state to calculate expected valuations.
* **Interpret Local SHAP Explanations:** Explains *why* the prediction was made, breaking down the exact pricing contribution (positive or negative) of each feature.
* **Explore Spatial Map Analysis:** Inspects geographically plotted properties on the city map (e.g., Bengaluru coordinates) and filters them.
* **Compare Model Performance:** Views metrics (MAE, RMSE, $R^2$, MAPE) of baseline vs. ML models.
* **Upload Custom Dataset (Admin):** Allows uploading of custom property CSV files to fit the prediction model.
* **Train/Retrain Model (Admin):** Dynamically runs Linear Regression slope calculations and KNN calculations to recalculate weights, biases, coefficients, and metrics on-the-fly.

---

## 2. Entity-Relationship Model (ER Model)

The **ER Model** defines the schema structures and relationships of the logical entities managed in localStorage and runtime states.

```mermaid
erDiagram
    USER {
        int id PK
        string name
        string email
        string password
        string role
        string token
    }
    PROPERTY {
        int id PK
        int area "Sq.Ft."
        int bedrooms "Count"
        int bathrooms "Count"
        int age "Years"
        int floors
        int parking
        string type "Apartment/Villa/Penthouse/Independent House"
        string furnishing "Unfurnished/Semi/Fully"
        string location FK "Indiranagar/Koramangala/etc."
        float latitude
        float longitude
        float distanceFromCenter "Km"
        float hedonicPrice "₹ Lakhs"
        float residual "₹ Lakhs (ML Adjustment)"
        float price "₹ Lakhs (Target)"
    }
    NEIGHBORHOOD_CONFIG {
        string location PK
        int baseRate "₹ per Sq.Ft."
        float lat
        float lng
        float distance
    }
    PREDICTION_RESULT {
        int prediction_id PK
        int user_id FK
        int area
        int bedrooms
        int bathrooms
        int age
        string type
        string furnishing
        string location
        float final_prediction "₹ Lakhs"
        float lower_bound "₹ Lakhs"
        float upper_bound "₹ Lakhs"
        string explanation "Text Narrative"
    }
    SHAP_VALUE {
        int id PK
        int prediction_id FK
        string feature_name
        float contribution_value "₹ Lakhs"
    }
    RESEARCH_EXPERIMENT {
        string id PK
        string name
        string model
        string objective
        string parameters
        string r2
        string rmse
        string status "Completed/Running/Demo"
    }

    USER ||--o{ PREDICTION_RESULT : "performs"
    PREDICTION_RESULT ||--|{ SHAP_VALUE : "generates"
    NEIGHBORHOOD_CONFIG ||--o{ PROPERTY : "configures"
    USER ||--o{ PROPERTY : "uploads"
```

### Entity Metadata:
* **USER:** Handles authentication and role-based privileges (`Administrator` vs. `Member`).
* **PROPERTY:** Represents instances of real estate properties, capturing physical dimensions, geographic features, baseline calculations, and final prices.
* **NEIGHBORHOOD_CONFIG:** Stores baseline parameters for location-based valuation (coordinate centers and base price per square foot).
* **PREDICTION_RESULT & SHAP_VALUE:** Stores the transaction inputs along with the generated regression/boosting components, ranges, and individual feature SHAP impact values.

---

## 3. Data Flow Diagram (DFD) - Level 1

The DFD shows how information moves from external sources (User and Admin) through processes, gets read/written to stores, and renders back to the user.

```mermaid
graph TD
    %% Styling
    classDef entity fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef process fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc;
    classDef store fill:#0f342b,stroke:#10b981,stroke-width:2px,color:#f8fafc;

    %% Elements
    Actor[User / Administrator]:::entity
    
    P1(P1: Authenticate User & Admin):::process
    P2(P2: Predict Price & Calculate Residuals):::process
    P3(P3: Generate Local SHAP Explanations):::process
    P4(P4: Perform Spatial Cluster Analysis):::process
    P5(P5: Re-train Model & Fit Coefficients):::process
    P6(P6: Render Benchmarks & Experiments):::process

    D1[(D1: User Accounts Store)]:::store
    D2[(D2: Properties & Uploads Store)]:::store
    D3[(D3: Neighborhoods & Coefficients Store)]:::store
    D4[(D4: Performance & Experiments Log)]:::store

    %% Connections
    Actor -->|Credentials| P1
    P1 <-->|Read/Write User Accounts| D1
    P1 -->|Session Token & Role| Actor

    Actor -->|Property Details| P2
    P2 <-->|Fetch Core Dataset| D2
    P2 <-->|Fetch Coefficients & Base Rates| D3
    P2 -->|Hedonic & ML Predicts| P3
    P2 -->|Prediction Values| Actor
    P3 -->|SHAP Waterfall Values| Actor

    Actor -->|Map Filters| P4
    P4 <-->|Query Lat-Long Records| D2
    P4 -->|Spatial Data Points| Actor

    Actor -->|New CSV File| P5
    P5 -->|Update Dataset Array| D2
    P5 -->|Update Regression Weights| D3
    P5 -->|Re-trained Performance Metrics| Actor

    Actor -->|Query Benchmarks| P6
    P6 <-->|Read Metrics & Runs| D4
    P6 -->|Model Performance Charts| Actor
```

### Data Flow Descriptions:
* **P1 (Authentication):** Validates logging credentials against the local storage user record.
* **P2 (Predictor Engine):** Uses regression baselines ($BasePrice = Area \times BaseRate$) adjusted by categorical bonuses and an XGBoost/KNN-based residual helper to produce final predictions.
* **P3 (SHAP Calculator):** Distributes the prediction variance relative to the dataset base rate across features to formulate explanations.
* **P5 (Model Training Process):** Dynamically calculates covariances and slopes (e.g., area-to-price ratio) whenever a custom dataset is uploaded, overwriting baseline coefficients.

---

## 4. Control Flow Diagram (CFD)

The **Control Flow Diagram** charts decisions, function routing, and visual conditional renderings across different views.

```mermaid
graph TD
    Start([App Initialized]) --> CheckAuth{Is Authenticated?}
    
    CheckAuth -- No --> ShowLogin[Render Login Page]
    ShowLogin --> ClickSubmit[User Clicks Submit]
    ClickSubmit --> VerifyCredentials{Credentials Valid?}
    VerifyCredentials -- No --> ShowError[Show Error Toast] --> ShowLogin
    VerifyCredentials -- Yes --> SetAuth[Save Session & Update State] --> Dashboard

    CheckAuth -- Yes --> Dashboard[Render Sidebar & Shell]
    
    Dashboard --> ClickSidebar{Sidebar Selection}
    
    ClickSidebar -->|Dashboard| ShowStats[Display Key Performance & Dataset Indicators]
    
    ClickSidebar -->|Predict| ShowPredict[Render Predict Form]
    ShowPredict --> FillInputs[User Inputs Parameters]
    FillInputs --> ClickPredict[User Clicks Predict Button]
    ClickPredict --> ValidateForm{Are Inputs Valid?}
    ValidateForm -- No --> ShowFormError[Show Error Toast] --> ShowPredict
    ValidateForm -- Yes --> ShowLoading[Show ML Calculation Loader]
    ShowLoading --> RunCalculations[Compute Hedonic Baseline + ML Residual]
    RunCalculations --> GenerateSHAP[Compute Feature Contributions]
    GenerateSHAP --> RendersResults[Display Valuation Range & Waterfall Charts]
    
    ClickSidebar -->|Spatial| ShowMap[Render Map View]
    ShowMap --> UserFilter[User modifies geographic filters]
    UserFilter --> QueryMock[Filter Property Coordinates]
    QueryMock --> Replot[Update Leaflet Map Marker Scatter]

    ClickSidebar -->|Dataset| ShowDataset[Render Dataset Management]
    ShowDataset --> CheckRole{User Role?}
    CheckRole -- Member --> ViewOnly[View Features List & Global Stats]
    CheckRole -- Admin --> UploadOption[Enable CSV Dataset Upload]
    UploadOption --> CSVSelected[CSV Uploaded & Selected]
    CSVSelected --> ParseCSV[Parse CSV into JSON Array]
    ParseCSV --> TriggerTraining[Call trainModelOnDataset]
    TriggerTraining --> UpdateCoeff[Update Regression Coefficients & local Configs]
    UpdateCoeff --> RunCV[Update R2, RMSE metrics]
```

---

## 5. State Transition Diagram (STD)

The **State Transition Diagram** outlines how pages and processing cycles transition in response to user inputs and lifecycle hooks.

```mermaid
stateDiagram-v2
    [*] --> LoggedOut
    
    LoggedOut --> Authenticating : SUBMIT_CREDENTIALS
    Authenticating --> LoggedOut : AUTH_FAILURE / showToast
    Authenticating --> LoggedIn : AUTH_SUCCESS
    
    state LoggedIn {
        [*] --> ViewDashboard
        
        ViewDashboard --> PredictPage : SIDEBAR_CLICK_PREDICT
        PredictPage --> ViewDashboard : SIDEBAR_CLICK_DASHBOARD
        
        state PredictPage {
            [*] --> PredictionIdle
            PredictionIdle --> PredictionProcessing : CLICK_PREDICT
            PredictionProcessing --> PredictionComplete : GENERATE_PRICE_&_SHAP
            PredictionComplete --> PredictionIdle : RESET_FORM
        }
        
        ViewDashboard --> SpatialPage : SIDEBAR_CLICK_SPATIAL
        SpatialPage --> ViewDashboard : SIDEBAR_CLICK_DASHBOARD
        
        ViewDashboard --> DatasetPage : SIDEBAR_CLICK_DATASET
        state DatasetPage {
            [*] --> DatasetIdle
            DatasetIdle --> UploadingDataset : UPLOAD_CSV (Admin)
            UploadingDataset --> RetrainingModel : PARSE_SUCCESS
            RetrainingModel --> CrossValidating : RUN_DYNAMIC_REGRESSION_FIT
            CrossValidating --> DatasetIdle : SAVE_COEFFICIENTS
        }
        DatasetPage --> ViewDashboard : SIDEBAR_CLICK_DASHBOARD
    }
    
    LoggedIn --> LoggedOut : CLICK_LOGOUT / Clear localStorage
```
