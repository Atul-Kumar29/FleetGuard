import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

/**
 * Renders a circular progress gauge indicating the calculated fleet health score percentage.
 */
export default function FleetHealthGauge({ metrics }) {
  if (!metrics) return null;

  const total = metrics.totalVehicles || 0;
  const compliant = metrics.compliantVehicles || 0;
  const highRisk = metrics.highRiskVehicles || 0;

  // Calculate score, handle division by zero, and clamp between 0 and 100
  let score = 0;
  if (total > 0) {
    score = ((compliant - highRisk) / total) * 100;
  }
  const healthScore = Math.round(Math.max(0, Math.min(100, score)));

  // Recharts RadialBar expects value array format
  const data = [{ name: 'Health', value: healthScore, fill: '#0ea5e9' }]; // Sky-500

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height={240}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={75}
          outerRadius={95}
          barSize={12}
          data={data}
          startAngle={225}
          endAngle={-45} // Semi-circle configuration to leave the bottom open for score labeling
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#f1f5f9' }} // Light background track ring
            clockWise={true}
            dataKey="value"
            cornerRadius={6}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      {/* Central label overlays */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-[-10px]">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fleet Health</span>
        <span className="text-4xl font-black text-slate-800 tracking-tight mt-1">{healthScore}%</span>
      </div>
    </div>
  );
}


