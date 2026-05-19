export function ChatPage() {
  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Phase 2 placeholder</p>
          <h1>Grounded chat</h1>
        </div>
      </div>
      <div className="chat-shell">
        <div className="answer-panel">
          <p>Retrieval, citations, answer generation, and confidence scoring are planned for Phase 2.</p>
        </div>
        <div className="question-bar">
          <input disabled placeholder="Ask over governed documents" />
          <button disabled type="button">Ask</button>
        </div>
      </div>
    </section>
  );
}
