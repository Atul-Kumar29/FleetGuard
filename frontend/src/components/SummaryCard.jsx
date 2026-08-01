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
  let ringStyles = 'hover:border-slate-300 hover:shadow-md';
  let accentBarStyles = 'bg-slate-400';
  let iconContainerStyles = 'bg-slate-100 text-slate-600 border border-slate-200';

  if (variant === 'success') {
    ringStyles = 'hover:border-emerald-300 hover:shadow-md';
    accentBarStyles = 'bg-emerald-600';
    iconContainerStyles = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
  } else if (variant === 'warning') {
    ringStyles = 'hover:border-amber-300 hover:shadow-md';
    accentBarStyles = 'bg-amber-500';
    iconContainerStyles = 'bg-amber-50 text-amber-600 border border-amber-100';
  } else if (variant === 'danger') {
    ringStyles = 'hover:border-rose-300 hover:shadow-md';
    accentBarStyles = 'bg-rose-600';
    iconContainerStyles = 'bg-rose-50 text-rose-600 border border-rose-100';
  } else if (variant === 'primary') {
    ringStyles = 'hover:border-blue-300 hover:shadow-md';
    accentBarStyles = 'bg-blue-600';
    iconContainerStyles = 'bg-blue-50 text-blue-600 border border-blue-100';
  }

  return (
    <div className={`relative overflow-hidden bg-white border border-slate-200/80 rounded-xl p-6 transition-all duration-300 shadow-sm flex items-center justify-between ${ringStyles}`}>
      {/* Decorative vertical colored accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBarStyles}`} />
      
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      </div>

      {icon && (
        <div className={`p-3 rounded-lg transition-colors ${iconContainerStyles}`}>
          {icon}
        </div>
      )}
    </div>
  );
}

