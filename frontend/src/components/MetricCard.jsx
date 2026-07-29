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
  // Define Tailwind CSS variations based on color prop
  let borderHoverStyle = 'hover:border-slate-700/60 hover:shadow-slate-900/50';
  let leftBarBg = 'bg-slate-700';
  let iconBgText = 'bg-slate-800 text-slate-400 border-slate-700/50';

  if (color === 'sky') {
    borderHoverStyle = 'hover:border-sky-500/30 hover:shadow-sky-950/20';
    leftBarBg = 'bg-sky-500';
    iconBgText = 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
  } else if (color === 'emerald') {
    borderHoverStyle = 'hover:border-emerald-500/30 hover:shadow-emerald-950/20';
    leftBarBg = 'bg-emerald-500';
    iconBgText = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  } else if (color === 'rose') {
    borderHoverStyle = 'hover:border-rose-500/30 hover:shadow-rose-950/20';
    leftBarBg = 'bg-rose-500';
    iconBgText = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  } else if (color === 'amber') {
    borderHoverStyle = 'hover:border-amber-500/30 hover:shadow-amber-950/20';
    leftBarBg = 'bg-amber-500';
    iconBgText = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  } else if (color === 'violet') {
    borderHoverStyle = 'hover:border-violet-500/30 hover:shadow-violet-950/20';
    leftBarBg = 'bg-violet-500';
    iconBgText = 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
  } else if (color === 'red') {
    borderHoverStyle = 'hover:border-red-500/30 hover:shadow-red-950/20';
    leftBarBg = 'bg-red-500';
    iconBgText = 'bg-red-500/10 text-red-400 border border-red-500/20';
  }

  return (
    <div className={`relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-xl p-6 transition-all duration-300 shadow-xl flex items-center justify-between group ${borderHoverStyle}`}>
      {/* Visual Accent Edge Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2.5 ${leftBarBg}`} />
      
      <div className="space-y-1 ml-1.5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-slate-100 tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
          {value}
        </p>
      </div>

      {icon && (
        <div className={`p-3.5 rounded-xl transition-all duration-300 group-hover:rotate-6 ${iconBgText}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
