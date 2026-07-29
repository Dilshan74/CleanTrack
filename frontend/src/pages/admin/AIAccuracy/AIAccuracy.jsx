import { AlertOctagon, Brain, Target, TrendingUp } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import ReportsBarChart from "../../../components/charts/ReportsBarChart";
import TrendLineChart from "../../../components/charts/TrendLineChart";
import { AI_ACCURACY_TREND, AI_CONFIDENCE_DISTRIBUTION } from "../../../utils/constants";

const CONFIDENCE_DATA = AI_CONFIDENCE_DISTRIBUTION.map((bucket) => ({
  name: bucket.r,
  value: bucket.n,
}));

export default function AIAccuracy() {
  return (
    <>
      <PageHeader
        title="AI Accuracy Dashboard"
        description="Model performance and prediction quality"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Overall Accuracy" value="93.4%" delta="+0.6%" icon={Brain} tint="primary" />
        <StatCard label="Precision" value="91.8%" icon={Target} tint="accent" />
        <StatCard label="Recall" value="89.2%" icon={TrendingUp} tint="success" />
        <StatCard label="F1 Score" value="90.5%" icon={Brain} tint="primary" />
        <StatCard label="False Positives" value={38} icon={AlertOctagon} tint="warning" />
        <StatCard label="False Negatives" value={22} icon={AlertOctagon} tint="destructive" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TrendLineChart
          data={AI_ACCURACY_TREND}
          title="Accuracy Trend"
          xKey="m"
          dataKey="acc"
          domain={[85, 95]}
        />
        <ReportsBarChart
          data={CONFIDENCE_DATA}
          title="Confidence Score Distribution"
          color="var(--accent)"
        />
      </div>
    </>
  );
}
