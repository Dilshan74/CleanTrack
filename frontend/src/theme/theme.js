import { palette, chartColors, riskColors } from "./palette";
import { typography } from "./typography";

export const theme = {
  palette,
  chartColors,
  riskColors,
  typography,
  radius: {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
  },
  surface: "soft-shadow rounded-2xl border border-border bg-card",
  tooltipStyle: {
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--popover)",
    color: "var(--popover-foreground)",
  },
};

export const THEMES = ["light", "dark"];

export default theme;
