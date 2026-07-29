import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  MapPinned,
  ScanEye,
} from "lucide-react";
import Button from "../../components/common/Button";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#roles", label: "For everyone" },
];

const STATS = [
  { value: "12,480", label: "Reports processed" },
  { value: "93.4%", label: "AI accuracy" },
  { value: "218", label: "PHIs onboarded" },
  { value: "64", label: "High-risk zones" },
];

const ROLE_CARDS = [
  {
    icon: ScanEye,
    title: "Citizens",
    body: "Snap a photo of stagnant water. Our AI classifies the risk in seconds and routes it to the right inspector.",
    cta: "Report a site",
  },
  {
    icon: Activity,
    title: "PHIs",
    body: "Review AI predictions, accept or reject reports, schedule visits, and upload before/after inspection evidence.",
    cta: "Manage reports",
  },
  {
    icon: MapPinned,
    title: "Administrators",
    body: "Oversee users, PHIs, and areas. Track AI accuracy, generate monthly reports, and monitor system health.",
    cta: "Open admin",
  },
];

const STEPS = [
  "Citizen uploads a photo of suspected breeding site.",
  "AI analyses the image, extracts risk level and detected objects.",
  "PHI reviews, accepts or rejects, and schedules an inspection.",
  "Admin monitors accuracy, resolved cases, and area-level trends.",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar links={NAV_LINKS} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%),radial-gradient(circle_at_80%_30%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Empowering Public Health with AI
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Predict, report and prevent{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                dengue outbreaks
              </span>{" "}
              — before they spread.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              A unified platform where citizens report suspected breeding sites with a
              photo, AI detects the risk, and Public Health Inspectors act in real time.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button as={Link} to="/register" size="lg">
                Create account <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/login" size="lg" variant="outline">
                Sign in
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="soft-shadow rounded-2xl border border-border bg-card p-4 text-center"
              >
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Built for every stakeholder
          </h2>
          <p className="mt-2 text-muted-foreground">
            From citizens to administrators — one platform, three connected experiences.
          </p>
        </div>
        <div id="roles" className="grid gap-6 md:grid-cols-3">
          {ROLE_CARDS.map((card) => (
            <div
              key={card.title}
              className="soft-shadow rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                {card.cta} <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {STEPS.map((step, index) => (
              <div
                key={step}
                className="soft-shadow rounded-2xl border border-border bg-card p-5"
              >
                <div className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
