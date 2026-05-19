export function GovernancePage() {
  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Governance workspace</p>
          <h1>Review queue and risk register</h1>
        </div>
      </div>
      <div className="two-column">
        <div className="wide-panel">
          <h2>Human review queue</h2>
          <p>PII, prompt injection, and risky answer workflows arrive in Phase 3.</p>
        </div>
        <div className="wide-panel">
          <h2>Risk register</h2>
          <p>The schema is present now; management APIs and dashboard views arrive in later phases.</p>
        </div>
      </div>
    </section>
  );
}
