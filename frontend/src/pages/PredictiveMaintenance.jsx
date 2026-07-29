import { useState, useEffect } from 'react';
import { 
  getPredictiveMaintenanceReport 
} from '../services/predictiveMaintenanceApi';
import RiskBadge from '../components/RiskBadge';
import SummaryCard from '../components/SummaryCard';
import { 
  RefreshCw, 
  Search, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowUpDown, 
  Inbox 
} from 'lucide-react';

export default function PredictiveMaintenance() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortByDistance, setSortByDistance] = useState('NONE'); // 'NONE', 'ASC', 'DESC'

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
    const timer = setTimeout(() => {
      void fetchReport();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Compute stats based on complete dataset (before query/filter)
  const totalVehicles = vehicles.length;
  const lowRiskCount = vehicles.filter(v => v.risk === 'LOW').length;
  const mediumRiskCount = vehicles.filter(v => v.risk === 'MEDIUM').length;
  const highRiskCount = vehicles.filter(v => v.risk === 'HIGH').length;

  // Filter & sort logic applied to displayed list
  const processedVehicles = vehicles
    .filter(vehicle => {
      const matchesSearch = (vehicle.licensePlate || '')
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      
      const matchesRisk = riskFilter === 'ALL' || vehicle.risk === riskFilter;

      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      if (sortByDistance === 'ASC') {
        return a.distanceSinceLastService - b.distanceSinceLastService;
      }
      if (sortByDistance === 'DESC') {
        return b.distanceSinceLastService - a.distanceSinceLastService;
      }
      return 0; // NONE
    });

  const toggleSort = () => {
    if (sortByDistance === 'NONE') setSortByDistance('DESC');
    else if (sortByDistance === 'DESC') setSortByDistance('ASC');
    else setSortByDistance('NONE');
  };

  return (
    <div className="space-y-8 p-1 sm:p-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            Predictive Maintenance Engine
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Monitor vehicle maintenance risk based on mileage and service logs.
          </p>
        </div>
        <div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-100 font-medium rounded-lg text-sm transition-all border border-slate-700/60 shadow-md disabled:opacity-50 gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Vehicles" 
          value={loading ? '...' : totalVehicles} 
          icon={<Wrench className="w-5 h-5" />} 
          variant="primary" 
        />
        <SummaryCard 
          title="Low Risk" 
          value={loading ? '...' : lowRiskCount} 
          icon={<CheckCircle2 className="w-5 h-5" />} 
          variant="success" 
        />
        <SummaryCard 
          title="Medium Risk" 
          value={loading ? '...' : mediumRiskCount} 
          icon={<AlertTriangle className="w-5 h-5" />} 
          variant="warning" 
        />
        <SummaryCard 
          title="High Risk" 
          value={loading ? '...' : highRiskCount} 
          icon={<ShieldAlert className="w-5 h-5" />} 
          variant="danger" 
        />
      </div>

      {/* Filters and Controls */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by license plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/80 transition-colors"
            />
          </div>

          {/* Filtering and sorting selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Risk filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Risk:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800/80 rounded-lg text-sm text-slate-200 px-3 py-1.5 focus:outline-none focus:border-sky-500/80 transition-colors"
              >
                <option value="ALL">All Risks</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>
            </div>

            {/* Sort filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sort Distance:</span>
              <select
                value={sortByDistance}
                onChange={(e) => setSortByDistance(e.target.value)}
                className="bg-slate-950 border border-slate-800/80 rounded-lg text-sm text-slate-200 px-3 py-1.5 focus:outline-none focus:border-sky-500/80 transition-colors"
              >
                <option value="NONE">Unsorted</option>
                <option value="DESC">Highest First</option>
                <option value="ASC">Lowest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data States */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-10 h-10 text-sky-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Calculating mileage risks...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-lg p-5 flex items-start gap-3 my-4">
            <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-rose-400 font-semibold text-sm">Failed to Load Maintenance Report</h3>
              <p className="text-rose-300/80 text-xs mt-1">{error}</p>
              <button 
                onClick={fetchReport}
                className="mt-3 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded text-rose-400 text-xs font-medium transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : processedVehicles.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-slate-800/40 rounded-full text-slate-500 border border-slate-800">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-slate-300 font-semibold text-base">No Vehicles Found</h3>
            <p className="text-slate-500 text-xs max-w-xs mx-auto">
              No vehicle records matched your search queries or risk filter criteria.
            </p>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto rounded-lg border border-slate-800/85">
            <table className="w-full text-left border-collapse bg-slate-900/10">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-855 text-slate-300 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">License Plate</th>
                  <th className="px-6 py-4">Vehicle Description</th>
                  <th className="px-6 py-4 text-right">Current Mileage</th>
                  <th className="px-6 py-4 text-right">Last Service Mileage</th>
                  <th className="px-6 py-4 text-right">
                    <button 
                      onClick={toggleSort}
                      className="inline-flex items-center gap-1.5 ml-auto font-semibold uppercase hover:text-sky-400 transition-colors focus:outline-none"
                    >
                      Distance Since Service
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                {processedVehicles.map((vehicle) => {
                  const hasHistory = vehicle.lastServiceMileage > 0;
                  return (
                    <tr 
                      key={vehicle.vehicleId} 
                      className="hover:bg-slate-800/35 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                        {vehicle.licensePlate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-200">
                          {vehicle.make}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {vehicle.model}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-200">
                        {vehicle.currentMileage.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        {hasHistory ? (
                          <span className="text-slate-300">
                            {vehicle.lastServiceMileage.toLocaleString()} km
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-xs">
                            No Logs (0 km)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-slate-100 bg-slate-900/10">
                        {vehicle.distanceSinceLastService.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4 text-center">
                        <RiskBadge risk={vehicle.risk} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
