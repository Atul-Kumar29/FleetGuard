import { useState, useEffect } from 'react';
import { getFleetAnalyticsMetrics } from '../services/fleetAnalyticsApi';
import { getPredictiveMaintenanceReport } from '../services/predictiveMaintenanceApi';
import MetricCard from '../components/MetricCard';
import FleetAnalyticsCharts from '../components/charts/FleetAnalyticsCharts';
import { 
  RefreshCw, 
  Truck, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  CircleDollarSign, 
  AlertOctagon
} from 'lucide-react';

export default function FleetAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [predictiveData, setPredictiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [metricsData, predictiveRes] = await Promise.all([
        getFleetAnalyticsMetrics(),
        getPredictiveMaintenanceReport()
      ]);
      setMetrics(metricsData);
      setPredictiveData(predictiveRes || []);
    } catch (err) {
      setError(err.message || 'Unable to load analytics.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMetrics(true);

    // Polling refresh loop every 30 seconds
    const interval = setInterval(() => {
      void fetchMetrics(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-8 p-1 sm:p-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            Fleet Analytics
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Overall fleet operational insights.
          </p>
        </div>
        <div>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-100 font-medium rounded-lg text-sm transition-all border border-slate-700/60 shadow-md disabled:opacity-50 gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center space-y-4 bg-slate-900/10 border border-slate-900 rounded-2xl">
          <RefreshCw className="w-12 h-12 text-sky-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Aggregating fleet operational statistics...</p>
        </div>
      ) : error ? (
        /* Error Card State */
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-6 flex items-start gap-4 max-w-2xl mx-auto shadow-2xl">
          <ShieldAlert className="w-8 h-8 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-rose-400 font-bold text-base">Failed to Load Dashboard Analytics</h3>
            <p className="text-rose-300/80 text-sm mt-1">{error}</p>
            <button 
              onClick={fetchMetrics}
              className="mt-4 px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Fetching
            </button>
          </div>
        </div>
      ) : metrics ? (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Total Vehicles"
              value={metrics.totalVehicles}
              icon={<Truck className="w-6 h-6" />}
              color="sky"
            />
            <MetricCard
              title="Compliant Vehicles"
              value={metrics.compliantVehicles}
              icon={<CheckCircle2 className="w-6 h-6" />}
              color="emerald"
            />
            <MetricCard
              title="Expired Vehicles"
              value={metrics.expiredVehicles}
              icon={<ShieldAlert className="w-6 h-6" />}
              color="rose"
            />
            <MetricCard
              title="Upcoming Expiry"
              value={metrics.upcomingExpiryVehicles}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="amber"
            />
            <MetricCard
              title="Total Maintenance Cost"
              value={formatCurrency(metrics.totalMaintenanceCost)}
              icon={<CircleDollarSign className="w-6 h-6" />}
              color="violet"
            />
            <MetricCard
              title="High-Risk Vehicles"
              value={metrics.highRiskVehicles}
              icon={<AlertOctagon className="w-6 h-6" />}
              color="red"
            />
          </div>

          {/* Fleet Analytics Visualizations */}
          <FleetAnalyticsCharts metrics={metrics} predictiveData={predictiveData} />
        </div>
      ) : null}
    </div>
  );
}
