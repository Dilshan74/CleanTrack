/**
 * Central theme tokens for CleanTrack.
 *
 * Colors are driven by CSS variables declared in styles/index.css (so Tailwind
 * utilities and inline styles stay in sync). These JS tokens are handy when you
 * need a value in JavaScript — e.g. for charts or inline SVG strokes.
 */

export const colorVars = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  accent: "var(--accent)",
  destructive: "var(--destructive)",
  success: "var(--success)",
  warning: "var(--warning)",
  border: "var(--border)",
  sidebar: "var(--sidebar)",
};

export const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/** Named status → Tailwind class map, reused across badges. */
export const statusTone = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

export const theme = { radius: "0.75rem", colorVars, chartColors, statusTone };

export default theme;
