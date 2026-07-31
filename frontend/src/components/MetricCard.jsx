/**
 * MetricCard - A reusable dashboard KPI stat card component.
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the metric.
 * @param {number|string} props.value - Numerical or text value to display.
 * @param {React.ReactNode} props.icon - A lucide icon or custom SVG node.
 * @param {string} props.color - Color scheme variation ('sky', 'emerald', 'rose', 'amber', 'violet', 'red').
 */
export default function MetricCard({ title, value, icon, color = 'sky' }) {
  let borderHoverStyle = 'hover:border-slate-300 hover:shadow-md';
  let leftBarBg = 'bg-slate-400';
  let iconBgText = 'bg-slate-100 text-slate-600 border border-slate-200';

  if (color === 'sky' || color === 'blue') {
    borderHoverStyle = 'hover:border-blue-300 hover:shadow-md';
    leftBarBg = 'bg-blue-600';
    iconBgText = 'bg-blue-50 text-blue-600 border border-blue-100';
  } else if (color === 'emerald' || color === 'green') {
    borderHoverStyle = 'hover:border-emerald-300 hover:shadow-md';
    leftBarBg = 'bg-emerald-600';
    iconBgText = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
  } else if (color === 'rose' || color === 'red') {
    borderHoverStyle = 'hover:border-rose-300 hover:shadow-md';
    leftBarBg = 'bg-rose-600';
    iconBgText = 'bg-rose-50 text-rose-600 border border-rose-100';
  } else if (color === 'amber' || color === 'yellow') {
    borderHoverStyle = 'hover:border-amber-300 hover:shadow-md';
    leftBarBg = 'bg-amber-500';
    iconBgText = 'bg-amber-50 text-amber-600 border border-amber-100';
  } else if (color === 'violet' || color === 'purple') {
    borderHoverStyle = 'hover:border-violet-300 hover:shadow-md';
    leftBarBg = 'bg-violet-600';
    iconBgText = 'bg-violet-50 text-violet-600 border border-violet-100';
  }

  return (
    <div className={`relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-6 transition-all duration-300 shadow-sm flex items-center justify-between group ${borderHoverStyle}`}>
      {/* Visual Accent Edge Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2.5 ${leftBarBg}`} />
      
      <div className="space-y-1 ml-1.5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
          {value}
        </p>
      </div>

      {icon && (
        <div className={`p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${iconBgText}`}>
          {icon}
        </div>
      )}
    </div>
  );
}

