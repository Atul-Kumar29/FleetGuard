import { useState, useEffect } from 'react';
import axios from 'axios';
import { exportCSV, exportPDF } from '../utils/exportUtils';
import { FileText, Download, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [overrides, setOverrides] = useState([]);
  const [predictive, setPredictive] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('fleetguard_token') || '';
      const [metricsRes, overridesRes, predictiveRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/metrics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/admin/overrides`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/admin/predictive-maintenance`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setMetrics(metricsRes.data);
      setOverrides(overridesRes.data?.data || overridesRes.data || []);
      setPredictive(predictiveRes.data || []);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format currency helper (Indian Rupees)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper to format date strings
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 1. Export Fleet Metrics
  const handleExportMetrics = (format) => {
    if (!metrics) return;
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Vehicles', metrics.totalVehicles ?? 0],
      ['Compliant Vehicles', metrics.compliantVehicles ?? 0],
      ['Expired Vehicles', metrics.expiredVehicles ?? 0],
      ['Upcoming Expiry Vehicles', metrics.upcomingExpiryVehicles ?? 0],
      ['High Risk Vehicles', metrics.highRiskVehicles ?? 0],
      ['Total Maintenance Cost', formatCurrency(metrics.totalMaintenanceCost ?? 0)]
    ];

    if (format === 'csv') {
      exportCSV(headers, rows, 'fleet-metrics-report.csv');
    } else {
      exportPDF('Fleet Metrics Report', headers, rows, 'fleet-metrics-report.pdf');
    }
  };

  // 2. Export Override Logs
  const handleExportOverrides = (format) => {
    const headers = ['Vehicle', 'Driver', 'Manager', 'Override Reason', 'Date & Time'];
    
    let rows;
    if (overrides.length === 0) {
      rows = [['No Data Available', '', '', '', '']];
    } else {
      rows = overrides.map(item => [
        item.vehicle?.licensePlate || 'N/A',
        item.driver?.fullName || 'N/A',
        item.manager?.fullName || 'N/A',
        item.overrideReason || 'N/A',
        formatDate(item.createdAt)
      ]);
    }

    if (format === 'csv') {
      exportCSV(headers, rows, 'override-logs-report.csv');
    } else {
      exportPDF('Override Logs Report', headers, rows, 'override-logs-report.pdf');
    }
  };

  // 3. Export Predictive Maintenance
  const handleExportPredictive = (format) => {
    const headers = ['Vehicle Number', 'Risk Level', 'Last Service', 'Next Service', 'Recommended Action'];
    
    const getRecommendedAction = (risk) => {
      switch (risk?.toUpperCase()) {
        case 'HIGH':
          return 'Immediate Service Required';
        case 'MEDIUM':
          return 'Schedule Service Within 15 Days';
        case 'LOW':
          return 'Routine Inspection Only';
        default:
          return 'No Action Required';
      }
    };

    const rows = predictive.map(item => [
      item.licensePlate || 'N/A',
      item.risk || 'N/A',
      item.lastServiceDate ? new Date(item.lastServiceDate).toLocaleDateString() : 'N/A',
      item.nextServiceDate ? new Date(item.nextServiceDate).toLocaleDateString() : 'N/A',
      getRecommendedAction(item.risk)
    ]);

    if (format === 'csv') {
      exportCSV(headers, rows, 'predictive-maintenance-report.csv');
    } else {
      exportPDF('Predictive Maintenance Report', headers, rows, 'predictive-maintenance-report.pdf');
    }
  };

  return (
    <div className="space-y-8 p-1 sm:p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <FileText className="w-8 h-8 text-sky-600" />
          Fleet Intelligence Reports
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate and download operational reports for fleet metrics, override logs, and predictive risk parameters.
        </p>
      </div>

      {/* States handler */}
      {error ? (
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm max-w-md mx-auto space-y-4">
          <div className="flex justify-center text-red-500">
            <AlertCircle className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-slate-900 font-bold text-lg">Unable to generate report.</h3>
            <p className="text-slate-500 text-sm mt-1">An error occurred while retrieving report details from the backend.</p>
          </div>
          <button
            onClick={fetchData}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm shadow-sky-500/10 inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry Connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Fleet Metrics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[220px] transition-all hover:shadow-md">
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-slate-800">Fleet Metrics</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Export key performance metrics including compliance statuses, service due counters, and maintenance costs.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => handleExportMetrics('pdf')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => handleExportMetrics('csv')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>

          {/* Card 2: Override Logs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[220px] transition-all hover:shadow-md">
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-slate-800">Override Logs</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Export supervisor authorization logs details explaining manual driver-to-vehicle assignment bypasses.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => handleExportOverrides('pdf')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => handleExportOverrides('csv')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>

          {/* Card 3: Predictive Maintenance */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[220px] transition-all hover:shadow-md">
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-slate-800">Predictive Maintenance</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Export diagnostics regarding vehicle risk profiles, distance parameters, and recommended repair actions.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => handleExportPredictive('pdf')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => handleExportPredictive('csv')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
