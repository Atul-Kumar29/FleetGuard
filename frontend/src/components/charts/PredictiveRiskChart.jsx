import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Donut chart illustrating predictive maintenance risk distribution (LOW, MEDIUM, HIGH counts).
 */
export default function PredictiveRiskChart({ predictiveData }) {
  const dataList = predictiveData || [];

  const highCount = dataList.filter(v => v.risk === 'HIGH').length;
  const mediumCount = dataList.filter(v => v.risk === 'MEDIUM').length;
  const lowCount = dataList.filter(v => v.risk === 'LOW').length;

  const chartData = [
    { name: 'Low Risk', value: lowCount, color: '#10b981' }, // Emerald-500
    { name: 'Medium Risk', value: mediumCount, color: '#f59e0b' }, // Amber-500
    { name: 'High Risk', value: highCount, color: '#ef4444' } // Red-500
  ];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} Vehicles`, 'Count']}
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
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


