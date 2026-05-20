import { AlertCircle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export interface LoadingStateProps {
  message?: string;
}

export interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
}

export function LoadingState({ message = "Loading" }: LoadingStateProps) {
  return (
    <div className="wide-panel" role="status" aria-live="polite" aria-busy="true">
      <div className="panel-title-row compact">
        <div>
          <p className="eyebrow">Working</p>
          <h2>{message}</h2>
        </div>
        <Loader2 aria-hidden="true" size={20} />
      </div>
      <p className="muted">Fetching the latest governed platform data.</p>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message, action }: ErrorStateProps) {
  return (
    <div className="wide-panel" role="alert">
      <div className="panel-title-row compact">
        <div>
          <p className="eyebrow">Error</p>
          <h2>{title}</h2>
        </div>
        <AlertCircle aria-hidden="true" size={20} />
      </div>
      <p className="error">{message}</p>
      {action && <div className="action-row">{action}</div>}
    </div>
  );
}
