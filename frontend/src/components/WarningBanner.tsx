import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

type WarningTone = "warning" | "critical" | "info";

export interface WarningBannerProps {
  children: ReactNode;
  tone?: WarningTone;
  title?: string;
}

export function WarningBanner({ children, tone = "warning", title }: WarningBannerProps) {
  const Icon = tone === "critical" ? ShieldAlert : tone === "info" ? Info : AlertTriangle;

  return (
    <div className="warning-banner" role={tone === "critical" ? "alert" : "status"}>
      <Icon aria-hidden="true" size={18} />
      <span>
        {title && <strong>{title}: </strong>}
        {children}
      </span>
    </div>
  );
}
