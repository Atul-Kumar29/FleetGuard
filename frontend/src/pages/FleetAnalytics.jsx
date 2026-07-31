import { useState, useEffect } from 'react';
import { getFleetAnalyticsMetrics } from '../services/fleetAnalyticsApi';
import { getPredictiveMaintenanceReport } from '../services/predictiveMaintenanceApi';
import MetricCard from '../components/MetricCard';
import FleetAnalyticsCharts from '../components/charts/FleetAnalyticsCharts';
import { RefreshCw, Truck, CheckCircle2, ShieldAlert, AlertTriangle, CircleDollarSign, AlertOctagon } from 'lucide-react';

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
    const interval = setInterval(() => { void fetchMetrics(false); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">FleetGuard</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fleet Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Overall fleet operational insights.</p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Aggregating fleet operational statistics...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 max-w-2xl">
          <ShieldAlert className="w-8 h-8 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-bold text-base">Failed to Load Dashboard Analytics</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchMetrics}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        </div>
      ) : metrics ? (
        <div className="flex flex-col gap-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <MetricCard title="Total Vehicles"          value={metrics.totalVehicles}                       icon={<Truck className="w-6 h-6" />}            color="sky" />
            <MetricCard title="Compliant Vehicles"      value={metrics.compliantVehicles}                   icon={<CheckCircle2 className="w-6 h-6" />}      color="emerald" />
            <MetricCard title="Expired Vehicles"        value={metrics.expiredVehicles}                     icon={<ShieldAlert className="w-6 h-6" />}       color="rose" />
            <MetricCard title="Upcoming Expiry"         value={metrics.upcomingExpiryVehicles}              icon={<AlertTriangle className="w-6 h-6" />}     color="amber" />
            <MetricCard title="Total Maintenance Cost"  value={formatCurrency(metrics.totalMaintenanceCost)} icon={<CircleDollarSign className="w-6 h-6" />} color="violet" />
            <MetricCard title="High-Risk Vehicles"      value={metrics.highRiskVehicles}                    icon={<AlertOctagon className="w-6 h-6" />}      color="red" />
          </div>
          <FleetAnalyticsCharts metrics={metrics} predictiveData={predictiveData} />
        </div>
      ) : null}
    </div>
  );
}
