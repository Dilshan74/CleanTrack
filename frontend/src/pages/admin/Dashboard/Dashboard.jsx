import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  FileText,
  UserCog,
  Users,
} from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import MonthlyAreaChart from "../../../components/charts/MonthlyAreaChart";
import { MONTHLY } from "../../../utils/constants";

const SYSTEM_HEALTH = [
  ["API uptime", "99.98%", "text-success"],
  ["AI model", "Operational", "text-success"],
  ["Storage", "62% used", "text-warning"],
  ["Queue", "12 pending", "text-info"],
];

const ACTIVITY = [
  "👤 12 new citizens registered",
  "✅ PHI-203 completed 4 inspections",
  "⚠️ New high-risk zone in Kaduwela",
  "🧠 AI retrained · +0.4% accuracy",
];

export default function Dashboard() {
  return (
    <>
      <PageHeader title="System Overview" description="Everything that matters, at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Users" value="12,480" delta="+382 this month" icon={Users} tint="primary" />
        <StatCard label="Total PHIs" value={218} delta="+6 onboarded" icon={UserCog} tint="accent" />
        <StatCard label="Total Reports" value="34,562" delta="+1,204 this month" icon={FileText} tint="success" />
        <StatCard label="High Risk Areas" value={64} delta="+3 flagged" icon={AlertTriangle} tint="destructive" />
        <StatCard label="AI Accuracy" value="93.4%" delta="+0.6% vs June" icon={Brain} tint="accent" />
        <StatCard label="Resolved Cases" value="29,110" delta="84% resolution" icon={CheckCircle2} tint="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <MonthlyAreaChart data={MONTHLY} />
        <div className="space-y-6">
          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Activity className="h-4 w-4 text-primary" /> System Health
            </h3>
            <div className="space-y-3 text-sm">
              {SYSTEM_HEALTH.map(([label, value, tint]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`font-semibold ${tint}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 font-semibold">Recent Activity</h3>
            <ul className="space-y-3 text-sm">
              {ACTIVITY.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
