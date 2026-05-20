# Cost Model

The platform tracks model usage as a governance and FinOps concern. The current local chat path writes simple model-usage records using estimated tokens and a local model name. Later provider-backed mode should calculate cost from actual provider usage metadata.

## Cost Dimensions

Cost records should be attributable by:

- User
- Department
- Document collection or access group
- Date
- Model
- Request type
- Prompt tokens
- Completion tokens
- Embedding tokens
- Estimated USD cost
- Local/provider model name

## Calculation

```text
estimated_cost =
  prompt_tokens * prompt_price_per_token
  + completion_tokens * completion_price_per_token
  + embedding_tokens * embedding_price_per_token
```

Pricing should be configurable through application settings rather than hard-coded into business logic. Local fallback pricing can remain zero or near-zero to make demos run without external costs.

## Budget Alerts

The `MONTHLY_BUDGET_USD` setting provides a simple threshold for local demos. Production deployments should use:

- Department-level budgets.
- Alert routing to Slack/email/ticketing.
- Daily burn-rate projections.
- Model-level cost breakdown.

## Dashboard Views

Planned admin dashboard cards:

- Current month estimated cost.
- Cost by department.
- Cost by model.
- Most expensive users.
- Query volume and average tokens per answer.
- Budget threshold status.

## Governance Value

Cost tracking helps demonstrate that the platform treats LLM usage as managed enterprise infrastructure rather than invisible application behavior.
