import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, FileText, PlayCircle, TriangleAlert } from "lucide-react";
import { api } from "../api/client";
import type { EvaluationSummary } from "../api/client";

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

function averageScore(evaluations: EvaluationSummary[], key: keyof Pick<EvaluationSummary, "groundedness" | "citation_coverage" | "refusal_accuracy">) {
  if (evaluations.length === 0) {
    return 0;
  }
  return evaluations.reduce((sum, evaluation) => sum + evaluation[key], 0) / evaluations.length;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not run yet" : date.toLocaleString();
}

export function EvaluationDashboardPage() {
  const [evaluations, setEvaluations] = useState<EvaluationSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    api
      .evaluations()
      .then((data) => {
        if (!active) {
          return;
        }
        setEvaluations(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setEvaluations([]);
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const needsReview = evaluations.filter((evaluation) => evaluation.status === "needs_review").length;

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Quality management</p>
          <h1>Evaluation dashboard</h1>
        </div>
        <button className="secondary-button" type="button">
          <PlayCircle size={16} />
          Run baseline
        </button>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <FileText size={20} />
          <span>Evaluation suites</span>
          <strong>{evaluations.length}</strong>
        </article>
        <article className="metric-card">
          <CheckCircle2 size={20} />
          <span>Avg groundedness</span>
          <strong>{pct(averageScore(evaluations, "groundedness"))}</strong>
        </article>
        <article className="metric-card">
          <BarChart3 size={20} />
          <span>Avg citation coverage</span>
          <strong>{pct(averageScore(evaluations, "citation_coverage"))}</strong>
        </article>
        <article className="metric-card">
          <TriangleAlert size={20} />
          <span>Suites needing review</span>
          <strong>{needsReview}</strong>
        </article>
      </div>

      {status === "error" && (
        <div className="warning-banner">
          <TriangleAlert size={18} />
          Evaluation APIs are unavailable. This page is ready for live runs once the backend is connected.
        </div>
      )}

      <div className="evaluation-grid">
        {evaluations.map((evaluation) => (
          <article className="wide-panel evaluation-card" key={evaluation.id}>
            <div className="panel-title-row compact">
              <div>
                <p className="eyebrow">{evaluation.dataset_size} test questions</p>
                <h2>{evaluation.name}</h2>
              </div>
              <span className={`status ${evaluation.status}`}>{evaluation.status.replace("_", " ")}</span>
            </div>
            <div className="quality-bars">
              <label>
                Groundedness
                <span>{pct(evaluation.groundedness)}</span>
                <meter min="0" max="1" value={evaluation.groundedness} />
              </label>
              <label>
                Citation coverage
                <span>{pct(evaluation.citation_coverage)}</span>
                <meter min="0" max="1" value={evaluation.citation_coverage} />
              </label>
              <label>
                Refusal accuracy
                <span>{pct(evaluation.refusal_accuracy)}</span>
                <meter min="0" max="1" value={evaluation.refusal_accuracy} />
              </label>
            </div>
            <p className="muted">Last run {formatDate(evaluation.last_run_at)}</p>
          </article>
        ))}
        {evaluations.length === 0 && (
          <article className="wide-panel">
            <h2>No evaluation suites yet</h2>
            <p>
              Baseline quality, citation coverage, refusal accuracy, and red-team results will appear here after the
              first evaluation run.
            </p>
          </article>
        )}
      </div>
    </section>
  );
}
