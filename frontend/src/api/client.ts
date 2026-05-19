const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type Role = "admin" | "user" | "reviewer";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  department?: string | null;
  access_group?: string | null;
  is_active: boolean;
}

export interface DocumentRecord {
  id: number;
  title: string;
  original_filename: string;
  content_type: string;
  file_size_bytes: number;
  classification: "public" | "internal" | "confidential" | "restricted";
  source_department?: string | null;
  access_group?: string | null;
  version: string;
  ingestion_status: "pending" | "processing" | "completed" | "failed";
  uploader_id: number;
  created_at: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("access_token");
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export const api = {
  async login(email: string, password: string): Promise<string> {
    const response = await request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem("access_token", response.access_token);
    return response.access_token;
  },

  async register(payload: {
    email: string;
    password: string;
    full_name: string;
    department?: string;
    access_group?: string;
  }): Promise<User> {
    return request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  me(): Promise<User> {
    return request<User>("/users/me");
  },

  documents(): Promise<DocumentRecord[]> {
    return request<DocumentRecord[]>("/documents");
  },

  uploadDocument(formData: FormData): Promise<{ document: DocumentRecord }> {
    return request<{ document: DocumentRecord }>("/documents/upload", {
      method: "POST",
      body: formData
    });
  }
};
