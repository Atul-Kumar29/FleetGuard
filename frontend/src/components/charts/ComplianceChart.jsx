import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Renders a donut chart illustrating compliance statuses distribution.
 */
export default function ComplianceChart({ metrics }) {
  if (!metrics) return null;

  const data = [
    { name: 'Compliant', value: metrics.compliantVehicles || 0, color: '#10b981' }, // Emerald-500
    { name: 'Expired', value: metrics.expiredVehicles || 0, color: '#f43f5e' }, // Rose-500
    { name: 'Expiring Soon', value: metrics.upcomingExpiryVehicles || 0, color: '#f59e0b' } // Amber-500
  ];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} Vehicles`, 'Count']}
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


