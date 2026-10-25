import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import BackgroundAnimation from './components/BackgroundAnimation';

// Import Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import SpatialAnalysis from './pages/SpatialAnalysis';
import Architecture from './pages/Architecture';
import Performance from './pages/Performance';
import ExplainableAI from './pages/ExplainableAI';
import Dataset from './pages/Dataset';
import Experiments from './pages/Experiments';
import Research from './pages/Research';
import AdminPanel from './pages/AdminPanel';
import Compare from './pages/Compare';
import SystemReport from './pages/SystemReport';

import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('house_predict_user');
    try {
      return savedUser ? JSON.parse(savedUser) : {
        name: 'Administrator',
        email: 'admin@housepredict.ai',
        role: 'Administrator'
      };
    } catch (e) {
      return {
        name: 'Administrator',
        email: 'admin@housepredict.ai',
        role: 'Administrator'
      };
    }
  });
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [aiMode, setAiMode] = useState(true);

  const mainScrollRef = useRef(null);

  // Smoothly reset scroll position to top when navigating to another module
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const [uploadedDataset, setUploadedDataset] = useState(() => {
    const saved = localStorage.getItem('house_predict_uploaded_dataset');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const [lastPrediction, setLastPrediction] = useState(null);

  useEffect(() => {
    if (uploadedDataset && uploadedDataset.length > 300) {
      console.warn("Dataset exceeds 300 rows. Skipping localStorage persistence to ensure optimal performance.");
      return;
    }
    try {
      localStorage.setItem('house_predict_uploaded_dataset', JSON.stringify(uploadedDataset));
    } catch (e) {
      console.error('Failed to save uploaded dataset to localStorage:', e);
      showToast('Storage quota exceeded. The uploaded dataset won\'t persist on reload.', 'error');
    }
  }, [uploadedDataset]);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const handleLogout = () => {
    localStorage.removeItem('house_predict_user');
    setCurrentUser({
      name: 'Administrator',
      email: 'admin@housepredict.ai',
      role: 'Administrator'
    });
    showToast('Session reset to default Administrator', 'info');
  };

  // Dynamic Page Renderer
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onStartPredicting={() => setCurrentPage('predict')} onNavigate={setCurrentPage} aiMode={aiMode} uploadedDataset={uploadedDataset} />;
      case 'dashboard':
        return <Dashboard onNavigateToPredict={() => setCurrentPage('predict')} uploadedDataset={uploadedDataset} />;
      case 'predict':
        return <Predict triggerToast={showToast} uploadedDataset={uploadedDataset} setUploadedDataset={setUploadedDataset} onPredictionComplete={setLastPrediction} onNavigate={setCurrentPage} />;
      case 'compare':
        return <Compare uploadedDataset={uploadedDataset} onNavigate={setCurrentPage} />;
      case 'spatial':
        return <SpatialAnalysis uploadedDataset={uploadedDataset} />;
      case 'architecture':
        return <Architecture />;
      case 'performance':
        return <Performance />;
      case 'explainable':
        return <ExplainableAI />;
      case 'dataset':
        return <Dataset uploadedDataset={uploadedDataset} setUploadedDataset={setUploadedDataset} />;
      case 'experiments':
        return <Experiments />;
      case 'research':
        return <Research />;
      case 'report':
        return <SystemReport />;
      case 'admin':
        if (currentUser && currentUser.role === 'Administrator') {
          return <AdminPanel uploadedDataset={uploadedDataset} />;
        }
        return <Dashboard onNavigateToPredict={() => setCurrentPage('predict')} uploadedDataset={uploadedDataset} />;
      default:
        return <Home onStartPredicting={() => setCurrentPage('predict')} onNavigate={setCurrentPage} aiMode={aiMode} uploadedDataset={uploadedDataset} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-100 flex relative">
      <BackgroundAnimation />
      {/* Sidebar Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          onMenuOpen={() => setMobileMenuOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          aiMode={aiMode}
          setAiMode={setAiMode}
        />

        {/* Dynamic Page Content with smooth scroll and transition */}
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto scroll-smooth bg-slate-950/10 flex flex-col justify-between">
          <div key={currentPage} className="w-full animate-page-transition pb-8">
            {renderPage()}
          </div>
          <Footer setCurrentPage={setCurrentPage} uploadedDataset={uploadedDataset} />
        </main>
      </div>

      {/* Toast Notification Container */}
      {toast.visible && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast}
        />
      )}
    </div>
  );
}
