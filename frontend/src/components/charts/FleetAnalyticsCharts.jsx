import ChartCard from './ChartCard';
import ComplianceChart from './ComplianceChart';
import FleetHealthGauge from './FleetHealthGauge';
import ServiceCostChart from './ServiceCostChart';
import PredictiveRiskChart from './PredictiveRiskChart';

/**
 * Container panel rendering the 2x2 grid layout of analytics charts.
 */
export default function FleetAnalyticsCharts({ metrics, predictiveData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Chart 1: Compliance Status Distribution */}
      <ChartCard title="Compliance Status Distribution">
        <ComplianceChart metrics={metrics} />
      </ChartCard>

      {/* Chart 2: Fleet Health Score */}
      <ChartCard title="Fleet Health Score">
        <FleetHealthGauge metrics={metrics} />
      </ChartCard>

      {/* Chart 3: Service Cost Summary */}
      <ChartCard title="Service Cost Summary">
        <ServiceCostChart metrics={metrics} />
      </ChartCard>

      {/* Chart 4: Predictive Risk Distribution */}
      <ChartCard title="Predictive Risk Distribution">
        <PredictiveRiskChart predictiveData={predictiveData} />
      </ChartCard>
    </div>
  );
}


