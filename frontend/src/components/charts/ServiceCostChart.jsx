

/**
 * ServiceCostChart displays cumulative service costs vs an arbitrary budget ceiling progress.
 */
export default function ServiceCostChart({ metrics }) {
  if (!metrics) return null;

  const cost = metrics.totalMaintenanceCost || 0;
  const budget = 500000; // Target maintenance threshold ceiling (INR)

  // Formatting currency helper for Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const percentage = Math.min(100, Math.round((cost / budget) * 100));

  return (
    <div className="w-full flex flex-col justify-center px-4 space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Service Cost</p>
        <p className="text-4xl font-black text-slate-800 tracking-tight">{formatCurrency(cost)}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500">Fleet Maintenance Budget</span>
          <span className="text-slate-800">{percentage}% of {formatCurrency(budget)}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3.5 border border-slate-200/60 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      <p className="text-[10px] text-slate-400 font-semibold italic text-center sm:text-left">
        * Financial totals compiled from registered service log odometer history records.
      </p>
    </div>
  );
}


