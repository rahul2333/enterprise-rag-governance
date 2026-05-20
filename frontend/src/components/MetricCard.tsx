import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type MetricTone = "default" | "good" | "warning" | "critical";

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  helperText?: string;
  tone?: MetricTone;
}

export function MetricCard({ label, value, icon: Icon, helperText, tone = "default" }: MetricCardProps) {
  const toneLabel = tone === "default" ? undefined : `${tone} status`;

  return (
    <article className="metric-card" aria-label={toneLabel ? `${label}, ${toneLabel}` : label}>
      {Icon && <Icon aria-hidden="true" size={20} />}
      <span>{label}</span>
      <strong>{value}</strong>
      {helperText && <small className={tone === "critical" ? "error" : "muted"}>{helperText}</small>}
    </article>
  );
}
