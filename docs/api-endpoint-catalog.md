# API Endpoint Catalog

Current base URL for local development:

```text
http://localhost:8000/api/v1
```

OpenAPI docs:

```text
http://localhost:8000/docs
```

## Authentication

| Method | Path | Auth | Consumer | Notes |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Registration/API demos | Creates a user and writes a register audit event. |
| `POST` | `/auth/login` | Public | `LoginPage`, `useAuth` | Returns JWT access token. |
| `GET` | `/users/me` | Bearer token | `useAuth`, app shell | Returns current user profile. |

## Users

| Method | Path | Auth | Consumer | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/users` | Admin | Admin/user management future UI | Lists users newest first. |
| `PATCH` | `/users/{user_id}/role` | Admin | Admin/user management future UI | Updates user role. |

## Documents And Ingestion

| Method | Path | Auth | Consumer | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/documents` | Bearer token | `DocumentLibraryPage` | Lists documents visible to the current user. |
| `POST` | `/documents/upload` | Admin | `UploadPage` | Multipart upload with metadata. Creates document, ingestion job, audit event, and worker task. |
| `GET` | `/documents/{document_id}/chunks` | Bearer token with document access | Document detail/debug future UI | Returns chunks for a document after access filtering. |

Upload form fields:

- `file`: uploaded document.
- `title`: optional display title.
- `classification`: `public`, `internal`, `confidential`, or `restricted`.
- `source_department`: optional department label.
- `access_group`: optional access group used for filtering.
- `version`: document version, defaults to `1.0`.

## Chat And Retrieval

| Method | Path | Auth | Consumer | Notes |
| --- | --- | --- | --- | --- |
| `POST` | `/chat/query` | Bearer token | `ChatPage` | Runs prompt guard, access-filtered retrieval, local extractive answer generation, audit logging, cost estimate, and review item creation when needed. |

Request shape:

```json
{
  "question": "What is the policy for personal cloud storage?",
  "session_id": null
}
```

Response includes:

- `session_id`
- `message_id`
- `answer`
- `confidence_score`
- `citations`
- `retrieved_sources`
- `retrieved_contexts`
- `flags`
- `warnings`
- `blocked`

## Governance

| Method | Path | Auth | Consumer | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/review-queue` | Admin or reviewer | `ReviewQueuePage` | Lists review items; accepts optional `status_filter`. |
| `GET` | `/review-items` | Admin or reviewer | `ReviewQueuePage` frontend alias | Alias for review queue list. |
| `PATCH` | `/review-queue/{item_id}` | Admin or reviewer | `ReviewQueuePage` | Updates item status and assigns current reviewer if unassigned. |
| `PATCH` | `/review-items/{item_id}` | Admin or reviewer | `ReviewQueuePage` frontend alias | Alias for review item update. |
| `GET` | `/audit-logs` | Admin | `AuditLogsPage` | Lists audit events; accepts `limit` from `1` to `500`. |

Review item status values are defined by the backend enum and currently include the statuses used by the UI, such as open/in-review/resolved style lifecycle states.

## Evaluations

| Method | Path | Auth | Consumer | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/evaluations` | Admin or reviewer | `EvaluationDashboardPage` | Lists stored evaluation summaries. Returns empty list if no evaluations exist. |
| `POST` | `/evaluations/score` | Admin or reviewer | `EvaluationDashboardPage`, scripts/manual smoke tests | Scores a supplied answer without requiring LLM secrets. |

Score request shape:

```json
{
  "question": "What is the policy for personal cloud storage?",
  "answer": "Employees must use approved enterprise storage.",
  "expected_answer": "Employees must not store company documents in personal cloud storage.",
  "citations": ["it-security-policy.md"]
}
```

## Health

| Method | Path | Auth | Consumer | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | Public | Docker/manual smoke tests | Returns `{"status": "ok"}`. |

## Frontend Fallback Consumers

The frontend currently has optional request fallbacks for some not-yet-complete analytics/settings surfaces. These are useful for UI inspection but should not be confused with live API coverage.

| Frontend method | Requested path | Current backend status |
| --- | --- | --- |
| `dashboardMetrics()` | `/analytics/dashboard` | Not implemented; frontend fallback data is used. |
| `riskRegister()` | `/risk-register` | Not implemented; frontend fallback data is used. |
| `settings()` | `/settings` | Not implemented; frontend fallback data is used. |

## Smoke-Test Order

1. `GET /health`
2. `POST /auth/login`
3. `GET /users/me`
4. `POST /documents/upload`
5. `GET /documents`
6. `GET /documents/{document_id}/chunks`
7. `POST /chat/query`
8. `GET /review-queue`
9. `GET /audit-logs`
10. `GET /evaluations`
11. `POST /evaluations/score`
