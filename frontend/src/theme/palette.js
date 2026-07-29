/**
 * Semantic colour tokens. Values are CSS variables declared in `src/index.css`
 * so both Tailwind classes and JS consumers (charts) stay in sync.
 */
export const palette = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  accent: "var(--accent)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  border: "var(--border)",
  success: "var(--success)",
  warning: "var(--warning)",
  info: "var(--info)",
  destructive: "var(--destructive)",
};

export const chartColors = [
  palette.primary,
  palette.accent,
  palette.warning,
  palette.destructive,
  palette.success,
];

export const riskColors = {
  High: palette.destructive,
  Medium: palette.warning,
  Low: palette.success,
};
