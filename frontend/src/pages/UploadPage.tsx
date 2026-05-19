import { FormEvent, useState } from "react";
import { api } from "../api/client";

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [classification, setClassification] = useState("internal");
  const [department, setDepartment] = useState("IT");
  const [accessGroup, setAccessGroup] = useState("employees");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setMessage("Choose a document first.");
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
      const response = await api.uploadDocument(formData);
      setMessage(`Uploaded ${response.document.title}. Ingestion job created.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
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
      <form className="upload-form" onSubmit={handleSubmit}>
        <label>
          Document
          <input
            accept=".pdf,.txt,.md,.docx"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
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
        <label>
          Access group
          <input value={accessGroup} onChange={(event) => setAccessGroup(event.target.value)} />
        </label>
        <button type="submit">Upload</button>
        {message && <p className="status-message">{message}</p>}
      </form>
    </section>
  );
}
