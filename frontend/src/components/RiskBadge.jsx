/**
 * Renders a modern, visually striking status badge indicating maintenance risk levels.
 * 
 * @param {Object} props
 * @param {string} props.risk - The risk level ('LOW', 'MEDIUM', 'HIGH')
 */
export default function RiskBadge({ risk }) {
  const normalizedRisk = (risk || '').toUpperCase();

  let badgeStyles = 'bg-slate-800 text-slate-400 border border-slate-700';
  
  if (normalizedRisk === 'LOW') {
    badgeStyles = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  } else if (normalizedRisk === 'MEDIUM') {
    badgeStyles = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  } else if (normalizedRisk === 'HIGH') {
    badgeStyles = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase transition-all ${badgeStyles}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        normalizedRisk === 'LOW' ? 'bg-emerald-400' :
        normalizedRisk === 'MEDIUM' ? 'bg-amber-400' :
        normalizedRisk === 'HIGH' ? 'bg-rose-400' : 'bg-slate-400'
      }`} />
      {normalizedRisk}
    </span>
  );
}
