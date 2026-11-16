-- ============================================================================
-- EstateSense AI: Dual-Stage Hybrid House Price Prediction System
-- Relational Database Schema (MySQL / PostgreSQL Compatible)
-- Standard College Academic Release: IEEE Compliant
-- ============================================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS estatesense_ai_db;
USE estatesense_ai_db;

-- ----------------------------------------------------------------------------
-- Table 1: Users & Role-Based Authentication
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'analyst', 'admin', 'evaluator') DEFAULT 'analyst',
    institution_affiliation VARCHAR(150) DEFAULT 'Dept. of Computer Science & Engineering',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL
);

-- ----------------------------------------------------------------------------
-- Table 2: Neighborhood Centroids & Base Economic Rates
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS neighborhoods;
CREATE TABLE neighborhoods (
    neighborhood_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    base_rate_per_sqft DECIMAL(10, 2) NOT NULL,
    center_latitude DECIMAL(9, 6) NOT NULL,
    center_longitude DECIMAL(9, 6) NOT NULL,
    distance_to_cbd_km DECIMAL(6, 2) NOT NULL,
    city VARCHAR(50) DEFAULT 'Bengaluru',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Table 3: Property Records (Historical & Real-Time Appraisals)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS properties;
CREATE TABLE properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    locality VARCHAR(80) NOT NULL,
    built_up_area_sqft INT NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    property_type ENUM('Apartment', 'Villa', 'Penthouse', 'Independent House') NOT NULL,
    furnishing_status ENUM('Unfurnished', 'Semi-Furnished', 'Fully-Furnished') NOT NULL,
    property_age_years INT NOT NULL,
    parking_spaces INT DEFAULT 1,
    distance_from_cbd_km DECIMAL(6, 2) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    actual_market_price_lakhs DECIMAL(10, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Table 4: Valuation Inferences (Dual-Stage Prediction Results)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS valuation_inferences;
CREATE TABLE valuation_inferences (
    inference_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT,
    user_id INT,
    stage1_hedonic_price_lakhs DECIMAL(10, 2) NOT NULL,
    stage2_xgboost_residual_lakhs DECIMAL(10, 2) NOT NULL,
    final_predicted_price_lakhs DECIMAL(10, 2) NOT NULL,
    confidence_interval_low_lakhs DECIMAL(10, 2) NOT NULL,
    confidence_interval_high_lakhs DECIMAL(10, 2) NOT NULL,
    model_version VARCHAR(20) DEFAULT 'v2.4-Hybrid',
    inference_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- Table 5: Explainable AI (Local SHAP Feature Contributions)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS shap_feature_contributions;
CREATE TABLE shap_feature_contributions (
    attribution_id INT AUTO_INCREMENT PRIMARY KEY,
    inference_id INT NOT NULL,
    feature_name VARCHAR(60) NOT NULL,
    feature_value VARCHAR(100) NOT NULL,
    shap_value_lakhs DECIMAL(10, 2) NOT NULL,
    contribution_direction ENUM('POSITIVE', 'NEGATIVE', 'NEUTRAL') NOT NULL,
    explanation_order INT NOT NULL,
    FOREIGN KEY (inference_id) REFERENCES valuation_inferences(inference_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- Table 6: Model Evaluation & Benchmarking History
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS model_benchmarks;
CREATE TABLE model_benchmarks (
    benchmark_id INT AUTO_INCREMENT PRIMARY KEY,
    model_architecture VARCHAR(80) NOT NULL,
    mae_lakhs DECIMAL(6, 2) NOT NULL,
    rmse_lakhs DECIMAL(6, 2) NOT NULL,
    r2_score DECIMAL(5, 4) NOT NULL,
    mape_percentage DECIMAL(5, 2) NOT NULL,
    evaluation_split VARCHAR(30) DEFAULT '80-20 Train-Test',
    benchmark_date DATE NOT NULL
);

-- ============================================================================
-- Initial Seed Data for Academic Demonstration
-- ============================================================================

INSERT INTO neighborhoods (name, base_rate_per_sqft, center_latitude, center_longitude, distance_to_cbd_km) VALUES
('Indiranagar', 8500.00, 12.978400, 77.640800, 5.50),
('Koramangala', 8000.00, 12.935200, 77.624400, 6.20),
('Whitefield',  5200.00, 12.969800, 77.750000, 17.50),
('Jayanagar',   7500.00, 12.930800, 77.583000, 5.00),
('HSR Layout',  6200.00, 12.914100, 77.641300, 8.50),
('Malleshwaram',7000.00, 12.998200, 77.572100, 3.80);

INSERT INTO users (full_name, email, password_hash, role) VALUES
('Academic Admin', 'admin@estatesense.ai', 'pbkdf2_sha256$hash_admin_placeholder', 'admin'),
('Student Evaluator', 'student@estatesense.ai', 'pbkdf2_sha256$hash_student_placeholder', 'student');

INSERT INTO model_benchmarks (model_architecture, mae_lakhs, rmse_lakhs, r2_score, mape_percentage, benchmark_date) VALUES
('Ordinary Least Squares (OLS)', 18.42, 24.18, 0.7420, 14.80, '2026-10-15'),
('Random Forest Regressor', 12.65, 17.84, 0.8510, 10.40, '2026-10-18'),
('Standard Gradient Boosting', 11.20, 15.92, 0.8760, 9.10, '2026-10-20'),
('Hybrid XGBoost (Proposed)', 8.45, 12.10, 0.9320, 6.80, '2026-10-25');
