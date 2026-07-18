import { Link } from "react-router-dom";
import {
  Leaf,
  Recycle,
  Truck,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Users,
} from "lucide-react";
import { APP_NAME } from "../utils/constants";

const features = [
  { icon: Clock, t: "Live schedules", d: "Residents see exactly when pickup is coming." },
  { icon: MapPin, t: "GPS tracking", d: "Every truck reports live location and status." },
  { icon: Truck, t: "Route planning", d: "Assign drivers, trucks, and streets in minutes." },
  { icon: ShieldCheck, t: "Complaints", d: "Report and resolve issues without friction." },
];

const dashboards = [
  { to: "/login", icon: Users, title: "Resident", tone: "bg-primary", desc: "Track pickups, manage profile, report complaints and receive alerts." },
  { to: "/login", icon: Truck, title: "Driver", tone: "bg-chart-3", desc: "See today's route, update pickup status, share live location." },
  { to: "/login", icon: ShieldCheck, title: "Admin", tone: "bg-chart-4", desc: "Manage users, drivers, routes and generate reports." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-semibold text-lg">{APP_NAME}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#dashboards" className="hover:text-foreground">Dashboards</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
          </nav>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Open app <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/40 text-accent-foreground px-3 py-1 text-xs font-medium mb-4">
            <Recycle className="h-3.5 w-3.5" /> Cleaner cities, smarter routes
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Smart waste collection for modern communities.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            One platform to plan pickups, track trucks live, resolve complaints,
            and give residents visibility into their collection schedule.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium hover:opacity-90">
              Resident portal <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-card border px-5 py-3 font-medium hover:bg-muted">
              Driver app
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-card border px-5 py-3 font-medium hover:bg-muted">
              Admin console
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-2xl border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium">Today&apos;s routes</div>
              <span className="text-xs rounded-full bg-success/15 text-success px-2 py-0.5">On schedule</span>
            </div>
            <div className="space-y-3">
              {[
                { r: "Route A · Elm District", p: 92 },
                { r: "Route B · Riverside", p: 68 },
                { r: "Route C · Old Town", p: 41 },
              ].map((x) => (
                <div key={x.r}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{x.r}</span>
                    <span className="text-muted-foreground">{x.p}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${x.p}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6 text-center">
              <div className="rounded-lg bg-muted p-3"><div className="text-xl font-bold">24</div><div className="text-xs text-muted-foreground">Trucks</div></div>
              <div className="rounded-lg bg-muted p-3"><div className="text-xl font-bold">1.2k</div><div className="text-xs text-muted-foreground">Pickups</div></div>
              <div className="rounded-lg bg-muted p-3"><div className="text-xl font-bold">98%</div><div className="text-xs text-muted-foreground">On time</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y bg-card/40">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.t} className="rounded-xl bg-card p-5 border">
              <f.icon className="h-6 w-6 text-primary mb-3" />
              <div className="font-semibold">{f.t}</div>
              <div className="text-sm text-muted-foreground mt-1">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="dashboards" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Three dashboards, one system</h2>
          <p className="text-muted-foreground mt-2">Every role has a purpose-built workspace.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {dashboards.map((d) => (
            <Link key={d.title} to={d.to} className="group rounded-2xl border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className={`h-11 w-11 rounded-xl ${d.tone} text-primary-foreground flex items-center justify-center mb-4`}>
                <d.icon className="h-5 w-5" />
              </div>
              <div className="text-xl font-semibold">{d.title} dashboard</div>
              <p className="text-sm text-muted-foreground mt-2">{d.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium">
                Open <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-2xl bg-sidebar text-sidebar-foreground p-10 md:p-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">Ready to modernize collection in your area?</h3>
            <p className="opacity-80 mt-3">Pick a role to explore the demo. All three dashboards are wired with sample data.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/login" className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground px-5 py-3 font-medium">Resident</Link>
            <Link to="/login" className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground px-5 py-3 font-medium">Driver</Link>
            <Link to="/login" className="rounded-lg bg-card text-card-foreground px-5 py-3 font-medium">Admin</Link>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            <span>{APP_NAME}</span>
          </div>
          <span>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
