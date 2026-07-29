import { CheckCircle2, ClipboardCheck, Clock, FileText } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import ReportsBarChart from "../../../components/charts/ReportsBarChart";
import RiskPieChart from "../../../components/charts/RiskPieChart";
import TrendLineChart from "../../../components/charts/TrendLineChart";
import {
  AREA_REPORTS,
  RISK_DISTRIBUTION,
  WEEKLY_INSPECTIONS,
} from "../../../utils/constants";

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Inspector Overview"
        description="Your assigned reports and inspection workload"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New Reports" value={14} delta="+4 today" icon={FileText} tint="primary" />
        <StatCard label="Accepted Reports" value={38} delta="This month" icon={CheckCircle2} tint="success" />
        <StatCard label="Pending Inspections" value={6} delta="2 overdue" icon={Clock} tint="warning" />
        <StatCard label="Completed Inspections" value={112} delta="+18 this month" icon={ClipboardCheck} tint="accent" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ReportsBarChart data={AREA_REPORTS} className="lg:col-span-2" />
        <RiskPieChart data={RISK_DISTRIBUTION} />
      </div>

      <TrendLineChart
        data={WEEKLY_INSPECTIONS}
        title="Weekly Inspections"
        xKey="day"
        dataKey="visits"
        color="var(--accent)"
        height="h-64"
        className="mt-6"
      />
    </>
  );
}
