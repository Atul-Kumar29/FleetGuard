import { Play, CheckCircle2, Clock, History, PlusCircle, Wrench, AlertTriangle, Zap } from "lucide-react";

const RiskColors = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const StatusConfig = {
  "In Service": {
    icon: <Wrench className="w-3.5 h-3.5 animate-spin" />,
    classes: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Overdue: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    classes: "bg-red-100 text-red-700 border-red-200",
  },
  Due: {
    icon: <Zap className="w-3.5 h-3.5" />,
    classes: "bg-amber-100 text-amber-700 border-amber-200",
  },
  Scheduled: {
    icon: <Clock className="w-3.5 h-3.5" />,
    classes: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export default function ServiceQueueTable({
  vehicles,
  onLoadHistory,
  onCompleteService,
  onAddHistoricalRecord,
  onStartService,
}) {
  if (vehicles.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
        <div className="p-4 bg-slate-100 rounded-full">
          <Wrench className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-slate-900 font-bold text-base">No Service Jobs Found</h3>
        <p className="text-slate-500 text-xs max-w-xs">
          No vehicles matched your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                License Plate
              </th>
              <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                Vehicle
              </th>
              <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide text-right">
                Mileage
              </th>
              <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                Last Service
              </th>
              <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                Next Service
              </th>
              <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide text-center">
                Risk
              </th>
              <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide text-center">
                Status
              </th>
              <th className="px-5 py-3.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.map((vehicle) => {
              const isInService = vehicle.vehicleStatus === "IN_MAINTENANCE";
              const statusCfg = StatusConfig[vehicle.status] || StatusConfig["Scheduled"];
              const riskCls = RiskColors[vehicle.maintenanceRisk] || RiskColors["LOW"];

              return (
                <tr
                  key={vehicle.id}
                  className={`transition-colors ${isInService ? "bg-blue-50/40" : "hover:bg-slate-50"}`}
                >
                  {/* License Plate */}
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      {vehicle.licensePlate}
                    </span>
                  </td>

                  {/* Vehicle */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{vehicle.vehicle}</div>
                  </td>

                  {/* Mileage */}
                  <td className="px-5 py-4 text-right font-mono text-slate-700 text-sm">
                    {vehicle.currentMileage?.toLocaleString()} km
                  </td>

                  {/* Last Service */}
                  <td className="px-5 py-4 text-slate-600 text-xs">
                    {vehicle.lastServiceDate || (
                      <span className="text-slate-400 italic">No record</span>
                    )}
                  </td>

                  {/* Next Service */}
                  <td className="px-5 py-4 text-slate-600 text-xs">
                    {vehicle.nextServiceDate || (
                      <span className="text-slate-400 italic">Not set</span>
                    )}
                  </td>

                  {/* Risk Badge */}
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${riskCls}`}
                    >
                      {vehicle.maintenanceRisk}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.classes}`}
                    >
                      {statusCfg.icon}
                      {vehicle.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {/* START SERVICE — only shown for ACTIVE vehicles */}
                      {!isInService && (
                        <button
                          onClick={() => onStartService(vehicle.id, vehicle.vehicle)}
                          title="Start Service"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Start Service
                        </button>
                      )}

                      {/* COMPLETE SERVICE */}
                      <button
                        onClick={() => onCompleteService(vehicle.id)}
                        title="Complete Service"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow-md active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete
                      </button>

                      {/* VIEW HISTORY */}
                      <button
                        onClick={() => onLoadHistory(vehicle.id, vehicle.vehicle)}
                        title="View Service History"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                      >
                        <History className="w-3.5 h-3.5" />
                        History
                      </button>

                      {/* ADD HISTORICAL RECORD */}
                      <button
                        onClick={() => onAddHistoricalRecord(vehicle.id)}
                        title="Add Historical Record"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add Record
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
