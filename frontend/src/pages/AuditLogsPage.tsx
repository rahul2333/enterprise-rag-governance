import { AlertTriangle, FileSearch, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { AuditEvent } from "../api/client";

type LoadState = "loading" | "ready" | "error";

const riskOrder = ["low", "medium", "high", "critical"] as const;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}

function countHighRisk(events: AuditEvent[]) {
  return events.filter((event) => event.risk_level === "high" || event.risk_level === "critical").length;
}

export function AuditLogsPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | AuditEvent["risk_level"]>("all");
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;
    api
      .auditEvents()
      .then((data) => {
        if (!active) {
          return;
        }
        setEvents(data);
        setLoadState("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setEvents([]);
        setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const text = `${event.action} ${event.actor_email ?? ""} ${event.resource_type ?? ""} ${
          event.details ?? ""
        }`.toLowerCase();
        const matchesSearch = text.includes(query.toLowerCase());
        const matchesRisk = riskFilter === "all" || event.risk_level === riskFilter;
        return matchesSearch && matchesRisk;
      }),
    [events, query, riskFilter]
  );

  const uniqueActors = new Set(events.map((event) => event.actor_email).filter(Boolean)).size;

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Traceability</p>
          <h1>Audit logs</h1>
        </div>
        <div className="action-row">
          <label className="search-box">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter events" />
          </label>
          <select value={riskFilter ?? "all"} onChange={(event) => setRiskFilter(event.target.value as typeof riskFilter)}>
            <option value="all">All risk levels</option>
            {riskOrder.map((risk) => (
              <option key={risk} value={risk}>
                {risk}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <FileSearch size={20} />
          <span>Events captured</span>
          <strong>{events.length}</strong>
        </article>
        <article className="metric-card">
          <AlertTriangle size={20} />
          <span>High risk events</span>
          <strong>{countHighRisk(events)}</strong>
        </article>
        <article className="metric-card">
          <ShieldCheck size={20} />
          <span>Known actors</span>
          <strong>{uniqueActors}</strong>
        </article>
      </div>

      {loadState === "error" && (
        <div className="warning-banner">
          <AlertTriangle size={18} />
          Audit log service is unavailable. Connect the backend to replace this empty state with live events.
        </div>
      )}

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Actor</th>
              <th>Resource</th>
              <th>Risk</th>
              <th>Time</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id}>
                <td>{event.action}</td>
                <td>{event.actor_email ?? "system"}</td>
                <td>{event.resource_type ?? "-"}</td>
                <td><span className={`risk ${event.risk_level ?? "low"}`}>{event.risk_level ?? "low"}</span></td>
                <td>{formatDate(event.created_at)}</td>
                <td>{event.details ?? "-"}</td>
              </tr>
            ))}
            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan={6}>
                  {loadState === "loading"
                    ? "Loading audit events..."
                    : "No audit events match the current filter. Governance activity will appear here as the platform is used."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
