import { useEffect, useState } from "react";
import { Database, DollarSign, LockKeyhole, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { api } from "../api/client";
import type { AppSettings } from "../api/client";

const fallbackSettings: AppSettings = {
  retrieval_top_k: 0,
  low_confidence_threshold: 0,
  monthly_budget_usd: 0,
  default_classification: "internal",
  pii_scanning_enabled: false,
  prompt_guard_enabled: false
};

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    api
      .settings()
      .then((data) => {
        if (!active) {
          return;
        }
        setSettings(data);
        setLoadState("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setSettings(fallbackSettings);
        setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  if (!settings) {
    return <div className="loading">Loading platform settings...</div>;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Platform configuration</p>
          <h1>Settings</h1>
        </div>
      </div>

      {loadState === "error" && (
        <div className="warning-banner">
          <TriangleAlert size={18} />
          Settings API is unavailable. Values below are placeholders until backend configuration is connected.
        </div>
      )}

      <div className="metric-grid">
        <article className="metric-card">
          <Database size={20} />
          <span>Retrieved chunks</span>
          <strong>{settings.retrieval_top_k}</strong>
        </article>
        <article className="metric-card">
          <LockKeyhole size={20} />
          <span>Default classification</span>
          <strong>{settings.default_classification}</strong>
        </article>
        <article className="metric-card">
          <DollarSign size={20} />
          <span>Monthly budget</span>
          <strong>${settings.monthly_budget_usd}</strong>
        </article>
      </div>

      <div className="settings-grid">
        <article className="wide-panel">
          <div className="panel-title-row compact">
            <h2>Retrieval</h2>
            <SlidersHorizontal size={20} />
          </div>
          <div className="settings-row">
            <span>Top K chunks</span>
            <strong>{settings.retrieval_top_k}</strong>
          </div>
          <div className="settings-row">
            <span>Low confidence threshold</span>
            <strong>{Math.round(settings.low_confidence_threshold * 100)}%</strong>
          </div>
          <div className="settings-row">
            <span>Default classification</span>
            <strong>{settings.default_classification}</strong>
          </div>
        </article>
        <article className="wide-panel">
          <div className="panel-title-row compact">
            <h2>Governance</h2>
            <LockKeyhole size={20} />
          </div>
          <div className="settings-row">
            <span>PII scanning</span>
            <strong>{settings.pii_scanning_enabled ? "Enabled" : "Disabled"}</strong>
          </div>
          <div className="settings-row">
            <span>Prompt guard</span>
            <strong>{settings.prompt_guard_enabled ? "Enabled" : "Disabled"}</strong>
          </div>
          <div className="settings-row">
            <span>Monthly LLM budget</span>
            <strong>${settings.monthly_budget_usd}</strong>
          </div>
        </article>
      </div>

      <article className="wide-panel">
        <h2>Operational notes</h2>
        <p>
          Production settings should be managed through environment variables, migrations, or an admin-approved
          configuration workflow. This screen is intentionally read-only until audit-safe settings updates are wired.
        </p>
      </article>
    </section>
  );
}
