import PageHeader from "../../../components/common/PageHeader";
import ReportsBarChart from "../../../components/charts/ReportsBarChart";
import RiskPieChart from "../../../components/charts/RiskPieChart";
import TrendLineChart from "../../../components/charts/TrendLineChart";
import {
  AREA_REPORTS,
  MONTHLY,
  REPORT_STATUS_SPLIT,
  RISK_DISTRIBUTION,
} from "../../../utils/constants";

export default function Statistics() {
  return (
    <>
      <PageHeader title="Statistics" description="System-wide analytics" />
      <div className="grid gap-6 lg:grid-cols-2">
        <TrendLineChart data={MONTHLY} title="Monthly Reports" dataKey="reports" />
        <ReportsBarChart
          data={AREA_REPORTS}
          title="Reports by District"
          color="var(--accent)"
        />
        <RiskPieChart data={RISK_DISTRIBUTION} title="Risk Distribution" />
        <RiskPieChart data={REPORT_STATUS_SPLIT} title="Report Status" />
      </div>
    </>
  );
}
