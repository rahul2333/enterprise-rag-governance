import { BadgeCheck, FileText } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export interface Citation {
  id: string | number;
  documentTitle?: string;
  document_title?: string;
  chunkId?: string | number;
  chunk_id?: string | number;
  pageNumber?: number | null;
  page_number?: number | null;
  confidenceScore?: number;
  confidence_score?: number;
}

export interface RetrievedSnippet {
  id?: string | number;
  documentTitle?: string;
  document_title?: string;
  chunkId?: string | number;
  chunk_id?: string | number;
  pageNumber?: number | null;
  page_number?: number | null;
  confidenceScore?: number;
  confidence_score?: number;
  classification: string;
  snippet: string;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getDocumentTitle(item: Citation | RetrievedSnippet) {
  return item.documentTitle ?? item.document_title ?? "Untitled document";
}

function getChunkId(item: Citation | RetrievedSnippet) {
  return item.chunkId ?? item.chunk_id ?? "unknown";
}

function getPageNumber(item: Citation | RetrievedSnippet) {
  return item.pageNumber ?? item.page_number;
}

function getConfidenceScore(item: Citation | RetrievedSnippet) {
  return item.confidenceScore ?? item.confidence_score ?? 0;
}

export interface CitationListProps {
  citations: Citation[];
  emptyMessage?: string;
}

export function CitationList({ citations, emptyMessage = "Citations will appear after a query runs." }: CitationListProps) {
  return (
    <>
      <div className="section-divider">
        <BadgeCheck aria-hidden="true" size={18} />
        <h3>Citations</h3>
      </div>
      <div className="citation-list" aria-label="Answer citations">
        {citations.map((citation) => {
          const chunkId = getChunkId(citation);
          const pageNumber = getPageNumber(citation);

          return (
            <article className="citation-card" key={`${citation.id}-${chunkId}`}>
              <strong>{getDocumentTitle(citation)}</strong>
              <span>
                Chunk {chunkId}
                {pageNumber ? ` - page ${pageNumber}` : ""}
              </span>
              <small>{formatPercent(getConfidenceScore(citation))} match</small>
            </article>
          );
        })}
        {citations.length === 0 && <p className="muted">{emptyMessage}</p>}
      </div>
    </>
  );
}

export interface SnippetPanelProps {
  snippets: RetrievedSnippet[];
  title?: string;
  eyebrow?: string;
  emptyMessage?: string;
}

export function SnippetPanel({
  snippets,
  title = "Traceability",
  eyebrow = "Retrieved source snippets",
  emptyMessage = "Top chunks, classifications, and similarity scores are shown here."
}: SnippetPanelProps) {
  return (
    <aside className="snippet-panel" aria-label="Retrieved source snippets">
      <div className="panel-title-row compact">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <FileText aria-hidden="true" size={20} />
      </div>
      {snippets.map((snippet) => {
        const documentTitle = getDocumentTitle(snippet);
        const chunkId = getChunkId(snippet);
        const pageNumber = getPageNumber(snippet);

        return (
          <article className="snippet-card" key={`${snippet.id ?? documentTitle}-${chunkId}`}>
            <div className="snippet-meta">
              <strong>{documentTitle}</strong>
              <StatusBadge kind="classification" value={snippet.classification}>
                {snippet.classification}
              </StatusBadge>
            </div>
            <p>{snippet.snippet}</p>
            <small>
              Chunk {chunkId}
              {pageNumber ? ` - page ${pageNumber}` : ""} - {formatPercent(getConfidenceScore(snippet))} match
            </small>
          </article>
        );
      })}
      {snippets.length === 0 && <p className="muted">{emptyMessage}</p>}
    </aside>
  );
}
