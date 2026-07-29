import { useState, useEffect } from 'react';
import { getAssignmentOverrides } from '../services/api';
import { ShieldAlert, Search, Calendar, User, Car, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOverrides = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAssignmentOverrides();
      if (response.success) {
        setOverrides(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch assignment overrides.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading overrides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverrides();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ' ' + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter overrides based on search term
  const filteredOverrides = overrides.filter(item => {
    const term = searchTerm.toLowerCase();
    const plate = item.vehicle?.licensePlate?.toLowerCase() || '';
    const vehicleName = `${item.vehicle?.make || ''} ${item.vehicle?.model || ''}`.toLowerCase();
    const driverName = item.driver?.fullName?.toLowerCase() || '';
    const driverEmail = item.driver?.email?.toLowerCase() || '';
    const managerName = item.manager?.fullName?.toLowerCase() || '';
    const reason = item.overrideReason?.toLowerCase() || '';

    return plate.includes(term) ||
           vehicleName.includes(term) ||
           driverName.includes(term) ||
           driverEmail.includes(term) ||
           managerName.includes(term) ||
           reason.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-red-500 animate-pulse" />
            Administrative Override Review
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review and audit system-level manual assignment overrides bypass events.
          </p>
        </div>
        <button
          onClick={fetchOverrides}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold py-2.5 px-4 rounded-xl border border-slate-700/80 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Logs
        </button>
      </div>

      {/* Metrics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Override Events</p>
            <h3 className="text-3xl font-extrabold text-white">{overrides.length}</h3>
          </div>
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="p-4 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/50 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search overrides by license plate, driver, manager, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950/80 text-sm text-slate-200 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500/80 transition-all"
          />
        </div>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Table & Logs Display list */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
            <span className="text-sm font-semibold text-slate-400">Loading audit records...</span>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <div>
              <h3 className="text-base font-bold text-white">Audit Log Fetch Failure</h3>
              <p className="text-sm text-slate-400 max-w-md mt-1">{error}</p>
            </div>
            <button
              onClick={fetchOverrides}
              className="mt-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredOverrides.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-3">
            <ShieldAlert className="w-12 h-12 text-slate-700" />
            <div>
              <h3 className="text-base font-bold text-white">No Override Records Found</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                {searchTerm ? 'No records matched your search query.' : 'System has not logged any manual assignment override events.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-850 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Vehicle Details</th>
                  <th className="py-4 px-6">Assigned Driver</th>
                  <th className="py-4 px-6">Authorized By</th>
                  <th className="py-4 px-6">Justification Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm text-slate-300">
                {filteredOverrides.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/40 transition-colors">
                    {/* Timestamp */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/50">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        {formatDate(item.createdAt)}
                      </span>
                    </td>

                    {/* Vehicle */}
                    <td className="py-4.5 px-6">
                      {item.vehicle ? (
                        <div className="space-y-1">
                          <p className="font-bold text-white text-xs tracking-wide bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20 w-fit">
                            {item.vehicle.licensePlate}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {item.vehicle.make} {item.vehicle.model}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-650 italic text-xs">Unknown Vehicle</span>
                      )}
                    </td>

                    {/* Driver */}
                    <td className="py-4.5 px-6">
                      {item.driver ? (
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-slate-850 rounded-lg text-slate-400 border border-slate-800">
                            <User className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.driver.fullName}</p>
                            <p className="text-xs text-slate-500">{item.driver.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-650 italic text-xs">Unknown Driver</span>
                      )}
                    </td>

                    {/* Manager (Authorized By) */}
                    <td className="py-4.5 px-6">
                      {item.manager ? (
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-slate-850 rounded-lg text-slate-400 border border-slate-800">
                            <User className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.manager.fullName}</p>
                            <p className="text-xs text-slate-500">{item.manager.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-650 italic text-xs">System Auto-Override</span>
                      )}
                    </td>

                    {/* Justification Reason */}
                    <td className="py-4.5 px-6 max-w-xs">
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                        <p className="text-xs text-slate-300 leading-relaxed font-medium line-clamp-2 hover:line-clamp-none transition-all">
                          {item.overrideReason || 'No justification reason provided.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
