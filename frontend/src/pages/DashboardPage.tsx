import { Activity, Ban, Database, Euro, FileWarning, Timer } from "lucide-react";

const metrics = [
  { label: "Documents", value: "0", icon: Database },
  { label: "Queries", value: "0", icon: Activity },
  { label: "Avg latency", value: "0 ms", icon: Timer },
  { label: "Estimated cost", value: "0.00 USD", icon: Euro },
  { label: "Flagged answers", value: "0", icon: FileWarning },
  { label: "Blocked prompts", value: "0", icon: Ban }
];

export function DashboardPage() {
  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Phase 1</p>
          <h1>Admin dashboard</h1>
        </div>
      </div>
      <div className="metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="metric-card" key={metric.label}>
              <Icon size={20} />
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          );
        })}
      </div>
      <div className="wide-panel">
        <h2>Recent audit events</h2>
        <p>Authentication and upload events are stored in PostgreSQL. Audit list APIs arrive in Phase 3.</p>
      </div>
    </section>
  );
}
