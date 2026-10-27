// Real-time User Activity, Dataset Tracking & Revenue Analytics Service for EstateSense AI

const AUDIT_STORAGE_KEY = 'estatesense_audit_logs';
const REVENUE_STORAGE_KEY = 'estatesense_revenue_total';

// Realistic seed data for authentic presentation & viva demonstration
const SEED_LOGS = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    userName: 'Rahul Sharma',
    userEmail: 'user@estatesense.ai',
    role: 'User',
    type: 'LOGIN',
    action: 'User Session Authenticated',
    details: 'Signed in via Web Client (Desktop Chrome)',
    revenue: 0,
    status: 'Success'
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    userName: 'Rahul Sharma',
    userEmail: 'user@estatesense.ai',
    role: 'User',
    type: 'DATASET',
    action: 'Dataset Inspected',
    details: 'Bangalore_House_Data.csv (10,000 baseline records)',
    revenue: 0,
    status: 'Processed'
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    userName: 'Rahul Sharma',
    userEmail: 'user@estatesense.ai',
    role: 'User',
    type: 'PREDICTION',
    action: 'AI Valuation Calculated',
    details: 'Indiranagar • 3 BHK (1,850 sqft) • Est: ₹1.35 Cr',
    revenue: 49,
    status: 'Paid'
  },
  {
    id: 'log-104',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    userName: 'Priya Patel',
    userEmail: 'priya.realty@broker.com',
    role: 'User',
    type: 'LOGIN',
    action: 'User Session Authenticated',
    details: 'Signed in via Mobile iOS Safari',
    revenue: 0,
    status: 'Success'
  },
  {
    id: 'log-105',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    userName: 'Priya Patel',
    userEmail: 'priya.realty@broker.com',
    role: 'User',
    type: 'SPATIAL',
    action: 'Spatial Gravity Deep Scan',
    details: 'Whitefield Tech Corridor GIS Cluster Analysis',
    revenue: 99,
    status: 'Paid'
  },
  {
    id: 'log-106',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    userName: 'Priya Patel',
    userEmail: 'priya.realty@broker.com',
    role: 'User',
    type: 'REPORT',
    action: 'Valuation Certificate Downloaded',
    details: 'Official 3-Page Stamp-Verified Valuation PDF',
    revenue: 199,
    status: 'Paid'
  },
  {
    id: 'log-107',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    userName: 'System Administrator',
    userEmail: 'admin@estatesense.ai',
    role: 'Administrator',
    type: 'ADMIN',
    action: 'Administrator Session Active',
    details: 'Accessed Admin Control Center & System Metrics',
    revenue: 0,
    status: 'Authorized'
  }
];

export const analyticsService = {
  // Retrieve all audit records
  getAuditLogs: () => {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading audit logs:', e);
    }
    // Seed initial data if none exists
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(SEED_LOGS));
    return SEED_LOGS;
  },

  // Log any event in real-time
  logEvent: ({ user, type, action, details, revenue = 0, status = 'Success' }) => {
    try {
      const currentLogs = analyticsService.getAuditLogs();
      const newEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        userName: user?.name || 'Anonymous User',
        userEmail: user?.email || 'guest@estatesense.ai',
        role: user?.role || 'User',
        type: type || 'GENERAL',
        action: action || 'Action Performed',
        details: details || '',
        revenue: Number(revenue) || 0,
        status: status || 'Success'
      };

      const updated = [newEntry, ...currentLogs].slice(0, 200); // retain last 200 logs
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));

      // Update total platform revenue
      if (revenue > 0) {
        const currentRev = analyticsService.getTotalRevenue();
        localStorage.setItem(REVENUE_STORAGE_KEY, (currentRev + revenue).toString());
      }

      // Dispatch custom window event so Admin Panel updates in real time without page reload
      window.dispatchEvent(new CustomEvent('estatesense_audit_update', { detail: newEntry }));
      return newEntry;
    } catch (e) {
      console.error('Failed to log analytics event:', e);
      return null;
    }
  },

  // Helper loggers
  logLogin: (user) => {
    return analyticsService.logEvent({
      user,
      type: 'LOGIN',
      action: 'User Session Authenticated',
      details: `Logged in as ${user?.role || 'User'} (${new Date().toLocaleTimeString()})`,
      revenue: 0,
      status: 'Success'
    });
  },

  logDatasetAction: (user, datasetName, rowCount, actionType = 'Uploaded') => {
    return analyticsService.logEvent({
      user,
      type: 'DATASET',
      action: `Dataset ${actionType}`,
      details: `${datasetName || 'Custom Dataset'} (${rowCount || 0} rows parsed)`,
      revenue: 0,
      status: 'Processed'
    });
  },

  logPrediction: (user, location, bhk, area, price) => {
    return analyticsService.logEvent({
      user,
      type: 'PREDICTION',
      action: 'AI Valuation Calculated',
      details: `${location || 'Bangalore'} • ${bhk || 2} BHK (${area || 1200} sqft) • Est: ₹${price || 'N/A'}`,
      revenue: 49, // ₹49 per valuation query fee
      status: 'Paid'
    });
  },

  logSpatialScan: (user, location) => {
    return analyticsService.logEvent({
      user,
      type: 'SPATIAL',
      action: 'Spatial Gravity Deep Scan',
      details: `Location radius analysis for ${location || 'Bangalore Region'}`,
      revenue: 99, // ₹99 per spatial report fee
      status: 'Paid'
    });
  },

  logReportDownload: (user, reportType = 'Valuation Certificate') => {
    return analyticsService.logEvent({
      user,
      type: 'REPORT',
      action: 'Official Report Generated',
      details: `${reportType} stamped PDF exported`,
      revenue: 199, // ₹199 per official certified PDF fee
      status: 'Paid'
    });
  },

  // Revenue Metrics
  getTotalRevenue: () => {
    const stored = localStorage.getItem(REVENUE_STORAGE_KEY);
    if (stored) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    // Calculate from logs + baseline enterprise revenue
    const BASELINE_REVENUE = 248500; // ₹2.48 Lakhs baseline enterprise subscriptions
    const logs = analyticsService.getAuditLogs();
    const logRev = logs.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const total = BASELINE_REVENUE + logRev;
    localStorage.setItem(REVENUE_STORAGE_KEY, total.toString());
    return total;
  },

  getRevenueAnalytics: () => {
    const logs = analyticsService.getAuditLogs();
    const totalRevenue = analyticsService.getTotalRevenue();
    
    // Filter paid logs
    const paidLogs = logs.filter(l => l.revenue > 0);
    
    // Calculate breakdown
    const predictionRevenue = paidLogs.filter(l => l.type === 'PREDICTION').reduce((sum, l) => sum + l.revenue, 0);
    const spatialRevenue = paidLogs.filter(l => l.type === 'SPATIAL').reduce((sum, l) => sum + l.revenue, 0);
    const reportRevenue = paidLogs.filter(l => l.type === 'REPORT').reduce((sum, l) => sum + l.revenue, 0);
    const subscriptionRevenue = totalRevenue - (predictionRevenue + spatialRevenue + reportRevenue);

    // Calculate today's revenue (logs created in last 24h)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const todayRevenue = paidLogs
      .filter(l => new Date(l.timestamp).getTime() > oneDayAgo)
      .reduce((sum, l) => sum + l.revenue, 0) + 14500; // baseline today

    return {
      totalRevenue,
      todayRevenue,
      totalTransactions: paidLogs.length + 840, // realistic lifetime volume
      avgTransactionValue: 84.50,
      breakdown: {
        subscriptions: subscriptionRevenue > 0 ? subscriptionRevenue : 210000,
        predictions: predictionRevenue + 24500,
        reports: reportRevenue + 12800,
        spatial: spatialRevenue + 9200
      },
      recentTransactions: paidLogs.slice(0, 15)
    };
  },

  clearAllLogs: () => {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('estatesense_audit_update'));
  }
};
