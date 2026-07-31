import { useState, useEffect } from 'react';
import { getPredictiveMaintenanceReport } from '../services/predictiveMaintenanceApi';
import RiskBadge from '../components/RiskBadge';
import SummaryCard from '../components/SummaryCard';
import { RefreshCw, Search, Wrench, AlertTriangle, CheckCircle2, ShieldAlert, ArrowUpDown, Inbox } from 'lucide-react';

/**
 * Renders a badge showing whether a vehicle is actively being serviced
 * by a mechanic (IN_MAINTENANCE) or running normally (ACTIVE).
 */
function ServiceStatusBadge({ vehicleStatus }) {
  if (vehicleStatus === 'IN_MAINTENANCE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
        <Wrench className="w-3.5 h-3.5 animate-pulse" />
        In Service
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5" />
      Active
    </span>
  );
}

export default function PredictiveMaintenance() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortByDistance, setSortByDistance] = useState('NONE');
  const [serviceFilter, setServiceFilter] = useState('ALL'); // ALL | IN_SERVICE | ACTIVE

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPredictiveMaintenanceReport();
      setVehicles(data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve predictive maintenance metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { void fetchReport(); }, 0);
    return () => clearTimeout(timer);
  }, []);

  const totalVehicles   = vehicles.length;
  const lowRiskCount    = vehicles.filter(v => v.risk === 'LOW').length;
  const mediumRiskCount = vehicles.filter(v => v.risk === 'MEDIUM').length;
  const highRiskCount   = vehicles.filter(v => v.risk === 'HIGH').length;
  const inServiceCount  = vehicles.filter(v => v.vehicleStatus === 'IN_MAINTENANCE').length;

  const processedVehicles = vehicles
    .filter(vehicle => {
      const matchesSearch = (vehicle.licensePlate || '').toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesRisk   = riskFilter === 'ALL' || vehicle.risk === riskFilter;
      const matchesService =
        serviceFilter === 'ALL' ||
        (serviceFilter === 'IN_SERVICE' && vehicle.vehicleStatus === 'IN_MAINTENANCE') ||
        (serviceFilter === 'ACTIVE'     && vehicle.vehicleStatus !== 'IN_MAINTENANCE');
      return matchesSearch && matchesRisk && matchesService;
    })
    .sort((a, b) => {
      if (sortByDistance === 'ASC') return a.distanceSinceLastService - b.distanceSinceLastService;
      if (sortByDistance === 'DESC') return b.distanceSinceLastService - a.distanceSinceLastService;
      return 0;
    });

  const toggleSort = () => {
    if (sortByDistance === 'NONE') setSortByDistance('DESC');
    else if (sortByDistance === 'DESC') setSortByDistance('ASC');
    else setSortByDistance('NONE');
  };

  const inputClass = "border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">FleetGuard</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Predictive Maintenance Engine</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor vehicle maintenance risk based on mileage and service logs.
            {inServiceCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-600 font-semibold">
                <Wrench className="w-3.5 h-3.5 animate-pulse" />
                {inServiceCount} vehicle{inServiceCount > 1 ? 's' : ''} currently being serviced.
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard title="Total Vehicles" value={loading ? '...' : totalVehicles}    icon={<Wrench className="w-5 h-5" />}        variant="primary" />
        <SummaryCard title="Low Risk"       value={loading ? '...' : lowRiskCount}     icon={<CheckCircle2 className="w-5 h-5" />}  variant="success" />
        <SummaryCard title="Medium Risk"    value={loading ? '...' : mediumRiskCount}  icon={<AlertTriangle className="w-5 h-5" />} variant="warning" />
        <SummaryCard title="High Risk"      value={loading ? '...' : highRiskCount}    icon={<ShieldAlert className="w-5 h-5" />}   variant="danger" />
        <SummaryCard
          title="In Service Now"
          value={loading ? '...' : inServiceCount}
          icon={<Wrench className="w-5 h-5" />}
          variant="warning"
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by license plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} w-full pl-9 pr-4 py-2.5`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Risk:</span>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className={`${inputClass} px-3 py-2`}>
              <option value="ALL">All Risks</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Service:</span>
            <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className={`${inputClass} px-3 py-2`}>
              <option value="ALL">All Vehicles</option>
              <option value="IN_SERVICE">In Service Now</option>
              <option value="ACTIVE">Active Only</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Sort Distance:</span>
            <select value={sortByDistance} onChange={(e) => setSortByDistance(e.target.value)} className={`${inputClass} px-3 py-2`}>
              <option value="NONE">Unsorted</option>
              <option value="DESC">Highest First</option>
              <option value="ASC">Lowest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Calculating mileage risks...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-semibold text-sm">Failed to Load Maintenance Report</h3>
            <p className="text-red-600 text-xs mt-1">{error}</p>
            <button onClick={fetchReport} className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all">
              Try Again
            </button>
          </div>
        </div>
      ) : processedVehicles.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
          <div className="p-3 bg-slate-100 rounded-full">
            <Inbox className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-slate-900 font-bold text-base">No Vehicles Found</h3>
          <p className="text-slate-500 text-xs max-w-xs">No vehicle records matched your search or filter criteria.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide">License Plate</th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide">Vehicle Description</th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide text-right">Current Mileage</th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide text-right">Last Service Mileage</th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide text-right">
                    <button onClick={toggleSort} className="inline-flex items-center gap-1.5 ml-auto hover:text-blue-700 transition-colors">
                      Distance Since Service <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide text-center">Risk Level</th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide text-center">
                    Service Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedVehicles.map((vehicle) => {
                  const hasHistory = vehicle.lastServiceMileage > 0;
                  const isInService = vehicle.vehicleStatus === 'IN_MAINTENANCE';
                  return (
                    <tr
                      key={vehicle.vehicleId}
                      className={`transition-colors ${isInService ? 'bg-amber-50/40' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-5 py-4 font-mono font-bold text-blue-700">{vehicle.licensePlate}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{vehicle.make}</div>
                        <div className="text-slate-500 text-xs">{vehicle.model}</div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-slate-800">{vehicle.currentMileage.toLocaleString()} km</td>
                      <td className="px-5 py-4 text-right font-mono text-slate-700">
                        {hasHistory ? (
                          <span>{vehicle.lastServiceMileage.toLocaleString()} km</span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">No Logs (0 km)</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">{vehicle.distanceSinceLastService.toLocaleString()} km</td>
                      <td className="px-5 py-4 text-center"><RiskBadge risk={vehicle.risk} /></td>
                      <td className="px-5 py-4 text-center">
                        <ServiceStatusBadge vehicleStatus={vehicle.vehicleStatus} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
