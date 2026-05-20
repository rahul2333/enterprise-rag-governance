import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="wide-panel" role="status" aria-live="polite">
      <div className="panel-title-row compact">
        <div>
          <p className="eyebrow">No results</p>
          <h2>{title}</h2>
        </div>
        {Icon && <Icon aria-hidden="true" size={20} />}
      </div>
      {description && <p className="muted">{description}</p>}
      {action && <div className="action-row">{action}</div>}
    </div>
  );
}
