import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Target } from "lucide-react";
import { api } from "../api/client";
import type { RiskItem } from "../api/client";

export function RiskRegisterPage() {
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    api
      .riskRegister()
      .then((data) => {
        if (!active) {
          return;
        }
        setRisks(data);
        setLoadState("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setRisks([]);
        setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = Array.from(new Set(risks.map((risk) => risk.category))).sort();
  const filteredRisks = risks.filter((risk) => categoryFilter === "all" || risk.category === categoryFilter);
  const unresolvedRisks = risks.filter((risk) => risk.status !== "closed" && risk.status !== "accepted").length;
  const criticalRisks = risks.filter((risk) => risk.severity === "critical").length;

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">EU AI governance</p>
          <h1>Risk register</h1>
        </div>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <Target size={20} />
          <span>Tracked risks</span>
          <strong>{risks.length}</strong>
        </article>
        <article className="metric-card">
          <ShieldAlert size={20} />
          <span>Open or mitigating</span>
          <strong>{unresolvedRisks}</strong>
        </article>
        <article className="metric-card">
          <AlertTriangle size={20} />
          <span>Critical severity</span>
          <strong>{criticalRisks}</strong>
        </article>
      </div>

      {loadState === "error" && (
        <div className="warning-banner">
          <AlertTriangle size={18} />
          Risk register API is unavailable. Seeded governance risks can be shown here once the backend is connected.
        </div>
      )}

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Risk</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Mitigation</th>
            </tr>
          </thead>
          <tbody>
            {filteredRisks.map((risk) => (
              <tr key={risk.id}>
                <td>{risk.title}</td>
                <td>{risk.category}</td>
                <td><span className={`risk ${risk.severity}`}>{risk.severity}</span></td>
                <td><span className={`status ${risk.status}`}>{risk.status}</span></td>
                <td>{risk.mitigation}</td>
              </tr>
            ))}
            {filteredRisks.length === 0 && (
              <tr>
                <td colSpan={5}>
                  {loadState === "loading"
                    ? "Loading risk register..."
                    : "No risks match the current filter. Governance owners can add AI, privacy, and access risks here."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <article className="wide-panel">
        <div className="panel-title-row compact">
          <div>
            <p className="eyebrow">Oversight posture</p>
            <h2>Controls expected for each risk</h2>
          </div>
          <CheckCircle2 size={22} />
        </div>
        <p>
          Each entry should map to an owner, mitigation plan, review cadence, evidence source, and residual-risk
          decision before production use.
        </p>
      </article>
    </section>
  );
}
