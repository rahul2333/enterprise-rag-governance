const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const API_BASE_URL = env?.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type Role = "admin" | "user" | "reviewer";
export type Classification = "public" | "internal" | "confidential" | "restricted";
export type IngestionStatus = "pending" | "processing" | "completed" | "failed";

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
  classification: Classification;
  source_department?: string | null;
  access_group?: string | null;
  version: string;
  ingestion_status: IngestionStatus;
  uploader_id: number;
  created_at: string;
}

export interface RetrievedSnippet {
  chunk_id: number | string;
  document_title: string;
  page_number?: number | null;
  classification: Classification;
  confidence_score: number;
  snippet: string;
}

export interface Citation {
  id: string;
  document_title: string;
  chunk_id: number | string;
  page_number?: number | null;
  confidence_score: number;
}

export interface ChatResponse {
  answer: string;
  confidence_score: number;
  citations: Citation[];
  retrieved_contexts: RetrievedSnippet[];
  warnings: string[];
}

export interface DashboardMetrics {
  total_documents: number;
  total_queries: number;
  average_latency_ms: number;
  estimated_cost_usd: number;
  flagged_answers: number;
  blocked_prompts: number;
}

export interface AuditEvent {
  id: number | string;
  action: string;
  actor_email?: string | null;
  resource_type?: string | null;
  resource_id?: string | number | null;
  risk_level?: "low" | "medium" | "high" | "critical";
  created_at: string;
  details?: string | null;
}

export interface ReviewItem {
  id: number | string;
  reason: string;
  status: "open" | "in_review" | "resolved" | "dismissed";
  risk_level: "low" | "medium" | "high" | "critical";
  owner?: string | null;
  created_at: string;
  summary: string;
}

export interface RiskItem {
  id: number | string;
  title: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  mitigation: string;
  status: "open" | "mitigating" | "accepted" | "closed";
}

export interface EvaluationSummary {
  id: number | string;
  name: string;
  dataset_size: number;
  groundedness: number;
  citation_coverage: number;
  refusal_accuracy: number;
  last_run_at: string;
  status: "not_started" | "running" | "passed" | "needs_review";
}

export interface AppSettings {
  retrieval_top_k: number;
  low_confidence_threshold: number;
  monthly_budget_usd: number;
  default_classification: Classification;
  pii_scanning_enabled: boolean;
  prompt_guard_enabled: boolean;
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

async function optionalRequest<T>(path: string, fallback: T, options: RequestInit = {}): Promise<T> {
  try {
    return await request<T>(path, options);
  } catch (error) {
    console.info(`Using frontend fallback for ${path}`, error);
    return fallback;
  }
}

const demoAuditEvents: AuditEvent[] = [
  {
    id: "audit-1",
    action: "document.uploaded",
    actor_email: "admin@example.com",
    resource_type: "document",
    resource_id: "IT-SEC-001",
    risk_level: "low",
    created_at: new Date().toISOString(),
    details: "Synthetic IT security policy submitted for ingestion."
  },
  {
    id: "audit-2",
    action: "prompt.blocked",
    actor_email: "employee@example.com",
    resource_type: "chat",
    risk_level: "high",
    created_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    details: "Prompt injection phrase matched governance guardrail."
  },
  {
    id: "audit-3",
    action: "answer.flagged",
    actor_email: "reviewer@example.com",
    resource_type: "review_item",
    risk_level: "medium",
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    details: "Low confidence answer routed to human review."
  }
];

const demoReviewItems: ReviewItem[] = [
  {
    id: "rev-101",
    reason: "Prompt injection attempt",
    status: "open",
    risk_level: "high",
    owner: "Reviewer",
    created_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    summary: "User asked the assistant to ignore system instructions and reveal restricted salary data."
  },
  {
    id: "rev-102",
    reason: "Potential PII exposure",
    status: "in_review",
    risk_level: "medium",
    owner: "Compliance",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    summary: "Answer draft referenced an email-like token from a confidential source snippet."
  }
];

const demoRisks: RiskItem[] = [
  {
    id: "risk-1",
    title: "Unauthorized retrieval from restricted documents",
    category: "Access control",
    severity: "critical",
    mitigation: "Apply RBAC filters before vector search and retain retrieved-context audit records.",
    status: "mitigating"
  },
  {
    id: "risk-2",
    title: "Hallucinated policy guidance",
    category: "Answer quality",
    severity: "high",
    mitigation: "Require citation coverage and route low confidence answers to review.",
    status: "open"
  },
  {
    id: "risk-3",
    title: "Personal data leakage in generated answers",
    category: "Data protection",
    severity: "high",
    mitigation: "Scan uploads and answer drafts for simple PII patterns before display.",
    status: "mitigating"
  }
];

const demoEvaluationSummaries: EvaluationSummary[] = [
  {
    id: "eval-001",
    name: "Synthetic policy Q&A baseline",
    dataset_size: 20,
    groundedness: 0.91,
    citation_coverage: 0.96,
    refusal_accuracy: 0.88,
    last_run_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "passed"
  },
  {
    id: "eval-002",
    name: "Prompt injection red-team pack",
    dataset_size: 12,
    groundedness: 0.84,
    citation_coverage: 0.78,
    refusal_accuracy: 0.92,
    last_run_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "needs_review"
  }
];

const demoSettings: AppSettings = {
  retrieval_top_k: 6,
  low_confidence_threshold: 0.65,
  monthly_budget_usd: 500,
  default_classification: "internal",
  pii_scanning_enabled: true,
  prompt_guard_enabled: true
};

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
  },

  users(): Promise<User[]> {
    return optionalRequest<User[]>("/users", []);
  },

  dashboardMetrics(): Promise<DashboardMetrics> {
    return optionalRequest<DashboardMetrics>("/analytics/dashboard", {
      total_documents: 0,
      total_queries: 128,
      average_latency_ms: 820,
      estimated_cost_usd: 14.72,
      flagged_answers: 3,
      blocked_prompts: 2
    });
  },

  auditEvents(): Promise<AuditEvent[]> {
    return optionalRequest<AuditEvent[]>("/audit-logs", demoAuditEvents);
  },

  reviewItems(): Promise<ReviewItem[]> {
    return optionalRequest<ReviewItem[]>("/review-items", demoReviewItems);
  },

  riskRegister(): Promise<RiskItem[]> {
    return optionalRequest<RiskItem[]>("/risk-register", demoRisks);
  },

  evaluations(): Promise<EvaluationSummary[]> {
    return optionalRequest<EvaluationSummary[]>("/evaluations", demoEvaluationSummaries);
  },

  settings(): Promise<AppSettings> {
    return optionalRequest<AppSettings>("/settings", demoSettings);
  },

  async askQuestion(question: string): Promise<ChatResponse> {
    return optionalRequest<ChatResponse>(
      "/chat/query",
      {
        answer:
          "Based on the IT security policy, employees should not use personal cloud storage for company data. Use approved corporate storage with access controls, logging, and retention policies. [IT-SEC-001]",
        confidence_score: 0.82,
        citations: [
          {
            id: "IT-SEC-001",
            document_title: "IT Security Policy",
            chunk_id: "chunk-4",
            page_number: 2,
            confidence_score: 0.86
          }
        ],
        retrieved_contexts: [
          {
            chunk_id: "chunk-4",
            document_title: "IT Security Policy",
            page_number: 2,
            classification: "internal",
            confidence_score: 0.86,
            snippet:
              "Company information must be stored only in approved managed repositories. Personal cloud drives are not approved for business records or confidential files."
          },
          {
            chunk_id: "chunk-9",
            document_title: "Acceptable Use Policy",
            page_number: 1,
            classification: "internal",
            confidence_score: 0.72,
            snippet:
              "Users are responsible for protecting company data and must follow approved storage, sharing, and retention controls."
          }
        ],
        warnings: question.toLowerCase().includes("ignore your instructions")
          ? ["Prompt injection pattern detected. The request should be refused by the backend guardrail."]
          : []
      },
      {
        method: "POST",
        body: JSON.stringify({ question })
      }
    );
  }
};
