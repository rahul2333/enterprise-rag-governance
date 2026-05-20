# Frontend Components

Reusable presentational components live here so pages can share consistent dashboard, chat, document, and governance UI patterns without duplicating markup.

## Exports

Import from the barrel file:

```tsx
import {
  CitationList,
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  SnippetPanel,
  StatusBadge,
  WarningBanner
} from "../components";
```

## Intended Use

- `MetricCard`: dashboard metric tiles. Pass a `lucide-react` icon through `icon`.
- `StatusBadge`: classification, status, risk, score, or health pills. Use `kind="classification"` for document classifications and `kind="risk"` for risk levels.
- `CitationList`: answer citations. Accepts both API snake_case fields such as `document_title` and camelCase fields such as `documentTitle`.
- `SnippetPanel`: retrieved context traceability panel. Also accepts snake_case or camelCase snippet fields.
- `WarningBanner`: governance, low-confidence, or blocked-request messages. `tone="critical"` uses `role="alert"`.
- `EmptyState`: empty tables, empty queues, or no-results views.
- `LoadingState` and `ErrorState`: lightweight async state panels for page-level data loads.

## Integration Notes

These components intentionally reuse existing global classes from `styles.css`; they do not bring their own CSS. If a new status value is introduced by the API, add the color rule in `styles.css` using the existing pattern, for example `.status.dismissed`.

The chat components are designed to accept current `api/client.ts` response objects directly:

```tsx
<CitationList citations={response.citations} />
<SnippetPanel snippets={response.retrieved_contexts} />
```

