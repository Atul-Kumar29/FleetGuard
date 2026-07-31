import { useState, useEffect } from 'react';
import { getVehicleDetails } from '../services/api';
import ComplianceCreateModal from '../components/common/ComplianceCreateModal';
import ComplianceEditModal from '../components/common/ComplianceEditModal';
import ComplianceStatusOverview from '../components/common/ComplianceStatusOverview';
import AssignDriverDrawer from '../components/common/AssignDriverDrawer';
import { ArrowLeft, PlusCircle } from 'lucide-react';

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusClasses(status) {
  switch (status) {
    case 'ACTIVE':       return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'IN_MAINTENANCE': return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'DECOMMISSIONED': return 'bg-red-100 text-red-800 border border-red-200';
    default:             return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}

export default function VehicleDetailsPage({ vehicleId, onBack }) {
  const [vehicle, setVehicle] = useState(null);
  const [compliance, setCompliance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignDrawer, setShowAssignDrawer] = useState(false);
  const [selectedCompliance, setSelectedCompliance] = useState(null);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const result = await getVehicleDetails(vehicleId);
      setVehicle(result.vehicle);
      setCompliance(result.compliance_items || []);
    } catch (err) {
      setError(err.message || 'Unable to load vehicle details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (vehicleId) loadDetails(); }, [vehicleId]);

  const handleEditCompliance = (item) => { setSelectedCompliance(item); setShowEditModal(true); };
  const handleComplianceSave = (updated) => setCompliance((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  const handleComplianceCreate = (created) => setCompliance((curr) => [...curr, created]);

  const baseShell = "min-h-screen p-6 max-w-5xl mx-auto";

  if (loading) return <div className={`${baseShell} flex items-center justify-center text-slate-500 text-sm`}>Loading vehicle details...</div>;

  if (error) return (
    <div className={baseShell}>
      <div className="px-4 py-3 bg-red-50 border border-red-200 border-l-4 border-l-red-500 text-red-800 text-sm rounded-lg mb-4">{error}</div>
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900">
        <ArrowLeft size={15} /> Back to Fleet
      </button>
    </div>
  );

  if (!vehicle) return (
    <div className={baseShell}>
      <p className="text-slate-500 text-sm mb-4">Vehicle not found.</p>
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900">
        <ArrowLeft size={15} /> Back to Fleet
      </button>
    </div>
  );

  return (
    <div className={baseShell}>
      {/* Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 mb-6 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm transition-all"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{vehicle.make} {vehicle.model}</h1>
            <p className="text-sm text-slate-500 mt-1">{vehicle.year} · {vehicle.type}</p>
          </div>
          <button
            onClick={() => setShowAssignDrawer(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all shrink-0"
          >
            Assign Driver
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Registration */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-4">Registration Details</h2>
            {[
              { label: 'VIN', value: vehicle.vin, mono: true },
              { label: 'License Plate', value: vehicle.license_plate },
              { label: 'Current Mileage', value: `${vehicle.current_mileage.toLocaleString()} km` },
              { label: 'Registered', value: formatDate(vehicle.created_at) },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide min-w-28">{label}</span>
                <span className={`text-sm font-semibold text-slate-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2 gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide min-w-28">Status</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusClasses(vehicle.status)}`}>
                {vehicle.status}
              </span>
            </div>
          </div>

          {/* Compliance */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Compliance Documents</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                <PlusCircle size={13} /> Add
              </button>
            </div>
            <ComplianceStatusOverview compliance={compliance} onEdit={handleEditCompliance} />
          </div>
        </div>
      </div>

      {showEditModal && selectedCompliance && (
        <ComplianceEditModal
          compliance={selectedCompliance}
          onClose={() => { setShowEditModal(false); setSelectedCompliance(null); }}
          onSave={handleComplianceSave}
        />
      )}

      {showCreateModal && (
        <ComplianceCreateModal
          vehicleId={vehicle.id}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleComplianceCreate}
        />
      )}

      <AssignDriverDrawer
        isOpen={showAssignDrawer}
        onClose={() => setShowAssignDrawer(false)}
        vehicle={vehicle}
        onSuccess={loadDetails}
      />
    </div>
  );
}
