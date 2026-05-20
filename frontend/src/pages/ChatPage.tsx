import { AlertTriangle, BadgeCheck, FileText, Send, ThumbsDown } from "lucide-react";
import { FormEvent, useState } from "react";
import { api, ChatResponse } from "../api/client";

const starterResponse: ChatResponse = {
  answer: "Ask a policy question to see a grounded response, citations, retrieved snippets, and governance warnings.",
  confidence_score: 0,
  citations: [],
  retrieved_contexts: [],
  warnings: []
};

export function ChatPage() {
  const [question, setQuestion] = useState("What is the company policy for using personal cloud storage?");
  const [response, setResponse] = useState<ChatResponse>(starterResponse);
  const [isAsking, setIsAsking] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleAsk(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) {
      setStatus("Enter a question before running retrieval.");
      return;
    }
    setIsAsking(true);
    setStatus(null);
    try {
      const result = await api.askQuestion(question.trim());
      setResponse(result);
      if (result.warnings.length > 0) {
        setStatus("Governance warning: this interaction should be reviewed.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to ask question");
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Grounded retrieval workspace</p>
          <h1>Grounded chat</h1>
        </div>
        <span className="health-pill">RBAC filtered retrieval</span>
      </div>

      {response.warnings.length > 0 && (
        <div className="warning-banner">
          <AlertTriangle size={18} />
          <span>{response.warnings.join(" ")}</span>
        </div>
      )}

      <div className="chat-shell two-pane">
        <div className="answer-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Assistant answer</p>
              <h2>Policy response</h2>
            </div>
            <span className={response.confidence_score >= 0.65 ? "score good" : "score"}>
              {Math.round(response.confidence_score * 100)}% confidence
            </span>
          </div>
          <p className="answer-text">{response.answer}</p>

          <div className="section-divider">
            <BadgeCheck size={18} />
            <h3>Citations</h3>
          </div>
          <div className="citation-list">
            {response.citations.map((citation) => (
              <article className="citation-card" key={`${citation.id}-${citation.chunk_id}`}>
                <strong>{citation.document_title}</strong>
                <span>
                  Chunk {citation.chunk_id}
                  {citation.page_number ? ` - page ${citation.page_number}` : ""}
                </span>
                <small>{Math.round(citation.confidence_score * 100)}% match</small>
              </article>
            ))}
            {response.citations.length === 0 && <p className="muted">Citations will appear after a query runs.</p>}
          </div>

          <button className="secondary-button" type="button">
            <ThumbsDown size={16} />
            Report answer
          </button>
        </div>

        <aside className="snippet-panel">
          <div className="panel-title-row compact">
            <div>
              <p className="eyebrow">Retrieved source snippets</p>
              <h2>Traceability</h2>
            </div>
            <FileText size={20} />
          </div>
          {response.retrieved_contexts.map((snippet) => (
            <article className="snippet-card" key={`${snippet.document_title}-${snippet.chunk_id}`}>
              <div className="snippet-meta">
                <strong>{snippet.document_title}</strong>
                <span className={`badge ${snippet.classification}`}>{snippet.classification}</span>
              </div>
              <p>{snippet.snippet}</p>
              <small>
                Chunk {snippet.chunk_id}
                {snippet.page_number ? ` - page ${snippet.page_number}` : ""} -{" "}
                {Math.round(snippet.confidence_score * 100)}% match
              </small>
            </article>
          ))}
          {response.retrieved_contexts.length === 0 && (
            <p className="muted">Top chunks, classifications, and similarity scores are shown here.</p>
          )}
        </aside>
      </div>

      <form className="question-bar" onSubmit={handleAsk}>
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask over governed documents"
        />
        <button disabled={isAsking} type="submit">
          <Send size={16} />
          {isAsking ? "Asking" : "Ask"}
        </button>
      </form>
      {status && <p className="status-message">{status}</p>}
    </section>
  );
}
