import { useEffect, useState } from "react";
import { AlertOctagon, CheckCircle2, ClipboardList, UserCheck } from "lucide-react";
import { api } from "../api/client";
import type { ReviewItem } from "../api/client";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}

export function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewItem["status"]>("all");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    api
      .reviewItems()
      .then((data) => {
        if (!active) {
          return;
        }
        setItems(data);
        setLoadState("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setItems([]);
        setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = items.filter((item) => statusFilter === "all" || item.status === statusFilter);
  const highRiskOpen = items.filter(
    (item) => item.status !== "resolved" && (item.risk_level === "high" || item.risk_level === "critical")
  ).length;
  const assignedItems = items.filter((item) => item.owner).length;

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Human oversight</p>
          <h1>Review queue</h1>
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
          <option value="all">All cases</option>
          <option value="open">Open</option>
          <option value="in_review">In review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <ClipboardList size={20} />
          <span>Total cases</span>
          <strong>{items.length}</strong>
        </article>
        <article className="metric-card">
          <AlertOctagon size={20} />
          <span>High risk open</span>
          <strong>{highRiskOpen}</strong>
        </article>
        <article className="metric-card">
          <UserCheck size={20} />
          <span>Assigned cases</span>
          <strong>{assignedItems}</strong>
        </article>
      </div>

      {loadState === "error" && (
        <div className="warning-banner">
          <AlertOctagon size={18} />
          Review queue service is unavailable. Flagged answers and blocked attempts will appear here when connected.
        </div>
      )}

      <div className="review-list">
        {filteredItems.map((item) => (
          <article className="wide-panel review-item" key={item.id}>
            <div className="panel-title-row compact">
              <div>
                <p className="eyebrow">{item.reason}</p>
                <h2>{item.summary}</h2>
              </div>
              <span className={`risk ${item.risk_level}`}>{item.risk_level}</span>
            </div>
            <div className="review-meta">
              <span className={`status ${item.status}`}>{item.status.replace("_", " ")}</span>
              <span>Owner: {item.owner ?? "Unassigned"}</span>
              <span>{formatDate(item.created_at)}</span>
            </div>
            <div className="action-row">
              <button className="secondary-button" type="button">Open case</button>
              <button className="secondary-button" type="button">Mark resolved</button>
            </div>
          </article>
        ))}
        {filteredItems.length === 0 && (
          <article className="wide-panel">
            <CheckCircle2 size={22} />
            <h2>No review cases</h2>
            <p>
              Human-review items for PII exposure, prompt injection, low confidence answers, and access violations will
              appear here.
            </p>
          </article>
        )}
      </div>
    </section>
  );
}
