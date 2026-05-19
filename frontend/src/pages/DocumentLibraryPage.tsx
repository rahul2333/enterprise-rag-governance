import { useEffect, useState } from "react";
import { api, DocumentRecord } from "../api/client";

export function DocumentLibraryPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .documents()
      .then(setDocuments)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load documents"));
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Governed corpus</p>
          <h1>Document library</h1>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Classification</th>
              <th>Department</th>
              <th>Access group</th>
              <th>Status</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id}>
                <td>{document.title}</td>
                <td>{document.classification}</td>
                <td>{document.source_department ?? "-"}</td>
                <td>{document.access_group ?? "-"}</td>
                <td>{document.ingestion_status}</td>
                <td>{document.version}</td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={6}>No documents uploaded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
