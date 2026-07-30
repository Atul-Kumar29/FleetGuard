/**
 * Modern dashboard summary card with hover effects, borders, and custom background highlights.
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the card.
 * @param {number|string} props.value - Numeric or text stat to show.
 * @param {React.ReactNode} props.icon - A lucide icon or SVG node.
 * @param {string} props.variant - Variant highlight ('primary', 'success', 'warning', 'danger').
 */
export default function SummaryCard({ title, value, icon, variant = 'primary' }) {
  let ringStyles = 'hover:border-slate-700/60 hover:shadow-slate-900/50';
  let accentBarStyles = 'bg-slate-700';
  let iconContainerStyles = 'bg-slate-800 text-slate-400';

  if (variant === 'success') {
    ringStyles = 'hover:border-emerald-500/30 hover:shadow-emerald-950/20';
    accentBarStyles = 'bg-emerald-500';
    iconContainerStyles = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  } else if (variant === 'warning') {
    ringStyles = 'hover:border-amber-500/30 hover:shadow-amber-950/20';
    accentBarStyles = 'bg-amber-500';
    iconContainerStyles = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  } else if (variant === 'danger') {
    ringStyles = 'hover:border-rose-500/30 hover:shadow-rose-950/20';
    accentBarStyles = 'bg-rose-500';
    iconContainerStyles = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  } else if (variant === 'primary') {
    ringStyles = 'hover:border-sky-500/30 hover:shadow-sky-950/20';
    accentBarStyles = 'bg-sky-500';
    iconContainerStyles = 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
  }

  return (
    <div className={`relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-xl p-6 transition-all duration-300 shadow-xl flex items-center justify-between ${ringStyles}`}>
      {/* Decorative vertical colored accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBarStyles}`} />
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-slate-100 tracking-tight">{value}</p>
      </div>

      {icon && (
        <div className={`p-3 rounded-lg transition-colors ${iconContainerStyles}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
