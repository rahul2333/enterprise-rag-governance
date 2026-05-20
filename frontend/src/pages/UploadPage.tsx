import { FormEvent, useState } from "react";
import { FileUp, ShieldCheck } from "lucide-react";
import { api } from "../api/client";

const maxUploadBytes = 25 * 1024 * 1024;
const acceptedExtensions = [".pdf", ".txt", ".md", ".docx"];

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [classification, setClassification] = useState("internal");
  const [department, setDepartment] = useState("IT");
  const [accessGroup, setAccessGroup] = useState("employees");
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  function handleFile(nextFile: File | null) {
    setFile(nextFile);
    setMessage(null);
    if (nextFile && !title) {
      setTitle(nextFile.name.replace(/\.[^/.]+$/, ""));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setMessage("Choose a document first.");
      return;
    }
    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!acceptedExtensions.includes(extension)) {
      setMessage("Unsupported file type. Upload PDF, TXT, Markdown, or DOCX.");
      return;
    }
    if (file.size > maxUploadBytes) {
      setMessage("File is too large. Keep uploads below 25 MB.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    formData.append("classification", classification);
    formData.append("source_department", department);
    formData.append("access_group", accessGroup);
    formData.append("version", "1.0");

    try {
      setIsUploading(true);
      const response = await api.uploadDocument(formData);
      setMessage(`Uploaded ${response.document.title}. Ingestion job created.`);
      setFile(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin only</p>
          <h1>Upload document</h1>
        </div>
      </div>
      <div className="two-column upload-layout">
        <form className="upload-form" onSubmit={handleSubmit}>
          <label className="drop-zone">
            <FileUp size={26} />
            <span>{file ? file.name : "Choose governed source document"}</span>
            <small>PDF, TXT, Markdown, or DOCX up to 25 MB</small>
            <input
              accept={acceptedExtensions.join(",")}
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <div className="form-grid">
            <label>
              Classification
              <select value={classification} onChange={(event) => setClassification(event.target.value)}>
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="confidential">Confidential</option>
                <option value="restricted">Restricted</option>
              </select>
            </label>
            <label>
              Source department
              <input value={department} onChange={(event) => setDepartment(event.target.value)} />
            </label>
          </div>
          <label>
            Access group
            <input value={accessGroup} onChange={(event) => setAccessGroup(event.target.value)} />
          </label>
          <button disabled={isUploading} type="submit">
            {isUploading ? "Uploading" : "Create ingestion job"}
          </button>
          {message && <p className="status-message">{message}</p>}
        </form>
        <aside className="wide-panel upload-checklist">
          <div className="panel-title-row compact">
            <div>
              <p className="eyebrow">Upload controls</p>
              <h2>Governance checks</h2>
            </div>
            <ShieldCheck size={20} />
          </div>
          <ul className="check-list">
            <li>Filename is sanitized by the API before storage.</li>
            <li>Classification and access group become retrieval filters.</li>
            <li>Worker status is visible in the document library.</li>
            <li>PII and extraction checks are scheduled for later phases.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
