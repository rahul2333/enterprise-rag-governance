import { Activity, Ban, Database, Euro, FileWarning, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { api, AuditEvent, DashboardMetrics } from "../api/client";

function formatCost(value: number) {
  return `$${value.toFixed(2)}`;
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    api.dashboardMetrics().then(setMetrics);
    api.auditEvents().then((items) => setEvents(items.slice(0, 5)));
  }, []);

  const cards = [
    { label: "Documents", value: String(metrics?.total_documents ?? 0), icon: Database },
    { label: "Queries", value: String(metrics?.total_queries ?? 0), icon: Activity },
    { label: "Avg latency", value: `${metrics?.average_latency_ms ?? 0} ms`, icon: Timer },
    { label: "Estimated cost", value: formatCost(metrics?.estimated_cost_usd ?? 0), icon: Euro },
    { label: "Flagged answers", value: String(metrics?.flagged_answers ?? 0), icon: FileWarning },
    { label: "Blocked prompts", value: String(metrics?.blocked_prompts ?? 0), icon: Ban }
  ];

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Operational control plane</p>
          <h1>Admin dashboard</h1>
        </div>
      </div>
      <div className="metric-grid">
        {cards.map((metric) => {
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
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Governance trail</p>
            <h2>Recent audit events</h2>
          </div>
          <span className="health-pill">Live API or fallback</span>
        </div>
        <div className="event-list">
          {events.map((event) => (
            <article className="event-row" key={event.id}>
              <div>
                <strong>{event.action}</strong>
                <span>{event.details ?? event.resource_type ?? "No details provided"}</span>
              </div>
              <small>{new Date(event.created_at).toLocaleString()}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
