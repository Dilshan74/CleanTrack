import { useEffect, useState } from "react";
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


import adminService from "../services/adminService";

const features = [
  { icon: Clock, t: "Live schedules", d: "Residents see exactly when pickup is coming." },
  { icon: MapPin, t: "GPS tracking", d: "Every truck reports live location and status." },
  { icon: Truck, t: "Route planning", d: "Assign drivers, trucks, and streets in minutes." },
  { icon: ShieldCheck, t: "Complaints", d: "Report and resolve issues without friction." },
];

const dashboards = [
  { to: "/login", state: { portal: "user" }, icon: Users, title: "Resident", tone: "bg-primary", desc: "Track pickups, manage profile, report complaints and receive alerts." },
  { to: "/login", state: { portal: "driver" }, icon: Truck, title: "Driver", tone: "bg-chart-3", desc: "See today's route, update pickup status, share live location." },
  { to: "/login", state: { portal: "admin" }, icon: ShieldCheck, title: "Admin", tone: "bg-chart-4", desc: "Manage users, drivers, routes and generate reports." },
];

export default function Home() {
  const [stats, setStats] = useState({
    activeUsers: 13,
    trucksOnRoute: 7,
    pickupsToday: 0,
    openComplaints: 0,
    routeHealth: [
      { r: "Route A · Galle Road", p: 92 },
      { r: "Route B · Kandy Central", p: 68 },
      { r: "Route C · Negombo Town", p: 41 },
    ],
  });

  useEffect(() => {
    adminService.getOverview().then((res) => {
      if (res) {
        setStats({
          activeUsers: res.activeUsers || 0,
          trucksOnRoute: res.trucksOnRoute || 0,
          pickupsToday: res.pickupsToday || 0,
          openComplaints: res.openComplaints || 0,
          routeHealth: res.routeHealth ? res.routeHealth.map(rh => ({
            r: rh.r || "Route",
            p: rh.p || 0
          })) : [],
        });
      }
    }).catch(() => {});
  }, []);

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
            <Leaf className="h-3.5 w-3.5" /> Cleaner cities, smarter routes
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Smart waste collection for modern communities.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
             One platform to plan pickups, track trucks live, resolve complaints,
             and give residents visibility into their collection schedule.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" state={{ portal: "user" }} className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium hover:opacity-90">
              Resident portal <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" state={{ portal: "driver" }} className="inline-flex items-center gap-2 rounded-lg bg-card border px-5 py-3 font-medium hover:bg-muted">
              Driver app
            </Link>
            <Link to="/login" state={{ portal: "admin" }} className="inline-flex items-center gap-2 rounded-lg bg-card border px-5 py-3 font-medium hover:bg-muted">
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
              {stats.routeHealth.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">No routes scheduled for today.</div>
              ) : (
                stats.routeHealth.slice(0, 3).map((x) => (
                  <div key={x.r}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{x.r}</span>
                      <span className="text-muted-foreground">{x.p}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${x.p}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6 text-center">
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xl font-bold">{stats.trucksOnRoute}</div>
                <div className="text-xs text-muted-foreground">Trucks</div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xl font-bold">{stats.pickupsToday}</div>
                <div className="text-xs text-muted-foreground">Pickups</div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xl font-bold">{stats.openComplaints > 0 ? "92%" : "98%"}</div>
                <div className="text-xs text-muted-foreground">On time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y bg-card/40">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.t} className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="dashboards" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Three portals. One system.</h2>
          <p className="mt-2 text-muted-foreground">
            Tailored interfaces for residents, drivers on route, and operations managers.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {dashboards.map((d) => (
            <Link key={d.title} to={d.to} state={d.state} className="group rounded-2xl border bg-card p-6 hover:shadow-lg transition">
              <div className={`h-12 w-12 rounded-xl ${d.tone} text-white flex items-center justify-center`}>
                <d.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mt-4 group-hover:text-primary transition">{d.title} Portal</h3>
              <p className="text-sm text-muted-foreground mt-2">{d.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="how" className="border-t bg-card/20">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">How CleanTrack works</h2>
            <p className="mt-2 text-muted-foreground">
              A closed-loop system connecting residents, drivers, and operations.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { s: "1", t: "Schedules & requests", d: "Residents check weekly pickup schedules or request bulk/hazardous waste collection." },
              { s: "2", t: "Smart routing", d: "Admins assign trucks and optimize streets based on real-time collection requests." },
              { s: "3", t: "Live tracking", d: "Drivers update progress as they complete stops, updating the resident maps instantly." },
            ].map((step) => (
              <div key={step.s} className="relative space-y-3">
                <div className="text-5xl font-extrabold text-primary/10">{step.s}</div>
                <h3 className="font-semibold text-lg">{step.t}</h3>
                <p className="text-sm text-muted-foreground">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t bg-card/60 backdrop-blur py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}
