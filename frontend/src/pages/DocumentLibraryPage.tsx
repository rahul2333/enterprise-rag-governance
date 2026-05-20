import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api, DocumentRecord } from "../api/client";

export function DocumentLibraryPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadDocuments() {
    setIsLoading(true);
    setError(null);
    api
      .documents()
      .then(setDocuments)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load documents"))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Governed corpus</p>
          <h1>Document library</h1>
        </div>
        <button className="secondary-button" onClick={loadDocuments} type="button">
          <RefreshCw size={16} />
          {isLoading ? "Refreshing" : "Refresh"}
        </button>
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
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id}>
                <td>{document.title}</td>
                <td><span className={`badge ${document.classification}`}>{document.classification}</span></td>
                <td>{document.source_department ?? "-"}</td>
                <td>{document.access_group ?? "-"}</td>
                <td><span className={`status ${document.ingestion_status}`}>{document.ingestion_status}</span></td>
                <td>{document.version}</td>
                <td>{new Date(document.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={7}>No documents uploaded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
