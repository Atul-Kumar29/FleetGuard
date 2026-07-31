/**
 * ChartCard wrapper providing layout structure, headers, and container limits.
 */
export default function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full min-h-[360px] transition-all hover:shadow-md duration-300">
      <h3 className="text-slate-800 font-bold text-lg border-b border-slate-100 pb-3 mb-4 tracking-tight">
        {title}
      </h3>
      <div className="flex-1 w-full flex items-center justify-center min-h-[260px]">
        {children}
      </div>
    </div>
  );
}
