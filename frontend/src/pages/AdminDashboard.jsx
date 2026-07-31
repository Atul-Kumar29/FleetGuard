import { useState, useEffect } from 'react';
import { getAssignmentOverrides } from '../services/api';
import { ShieldAlert, Search, Calendar, User, AlertCircle, RefreshCw } from 'lucide-react';

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

  useEffect(() => { fetchOverrides(); }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
      + ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const filteredOverrides = overrides.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (item.vehicle?.licensePlate?.toLowerCase() || '').includes(term)
      || `${item.vehicle?.make || ''} ${item.vehicle?.model || ''}`.toLowerCase().includes(term)
      || (item.driver?.fullName?.toLowerCase() || '').includes(term)
      || (item.driver?.email?.toLowerCase() || '').includes(term)
      || (item.manager?.fullName?.toLowerCase() || '').includes(term)
      || (item.overrideReason?.toLowerCase() || '').includes(term);
  });

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-1">Admin Panel</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Administrative Override Review
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review and audit system-level manual assignment override events.</p>
        </div>
        <button
          onClick={fetchOverrides}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Logs
        </button>
      </div>

      {/* Metric card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Override Events</p>
            <h3 className="text-3xl font-extrabold text-red-700 mt-1">{overrides.length}</h3>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-red-600 border border-red-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row gap-3 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by license plate, driver, manager, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-sm text-slate-900 placeholder-slate-400 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
            Clear Filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Loading audit records...</span>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Audit Log Fetch Failure</h3>
              <p className="text-sm text-slate-500 max-w-md mt-1">{error}</p>
            </div>
            <button onClick={fetchOverrides} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all">
              Retry Connection
            </button>
          </div>
        ) : filteredOverrides.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-3">
            <ShieldAlert className="w-12 h-12 text-slate-300" />
            <div>
              <h3 className="text-base font-bold text-slate-900">No Override Records Found</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                {searchTerm ? 'No records matched your search query.' : 'System has not logged any manual assignment override events.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  {['Date & Time', 'Vehicle Details', 'Assigned Driver', 'Authorized By', 'Justification Reason'].map((h) => (
                    <th key={h} className="py-3.5 px-5 text-xs font-extrabold text-slate-700 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOverrides.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {formatDate(item.createdAt)}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {item.vehicle ? (
                        <div>
                          <p className="inline-block text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded mb-0.5">{item.vehicle.licensePlate}</p>
                          <p className="text-xs text-slate-500">{item.vehicle.make} {item.vehicle.model}</p>
                        </div>
                      ) : <span className="text-xs text-slate-400 italic">Unknown Vehicle</span>}
                    </td>
                    <td className="py-4 px-5">
                      {item.driver ? (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item.driver.fullName}</p>
                            <p className="text-xs text-slate-500">{item.driver.email}</p>
                          </div>
                        </div>
                      ) : <span className="text-xs text-slate-400 italic">Unknown Driver</span>}
                    </td>
                    <td className="py-4 px-5">
                      {item.manager ? (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item.manager.fullName}</p>
                            <p className="text-xs text-slate-500">{item.manager.email}</p>
                          </div>
                        </div>
                      ) : <span className="text-xs text-slate-400 italic">System Auto-Override</span>}
                    </td>
                    <td className="py-4 px-5 max-w-xs">
                      <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                        <p className="text-xs text-slate-700 leading-relaxed font-medium line-clamp-2">
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
