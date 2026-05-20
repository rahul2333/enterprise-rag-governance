# EU AI Governance Notes

This project is designed as a portfolio-grade example of responsible enterprise AI architecture. It is not legal advice, but it maps technical controls to common EU-focused governance concerns: risk management, data protection, transparency, human oversight, robustness, and accountability.

## Intended Use

The platform is intended for internal enterprise knowledge retrieval over approved company documents. It should support employees, administrators, and reviewers who need citation-backed answers and traceability.

## Prohibited Use

- Making employment, credit, legal, medical, or other high-impact decisions without qualified human review.
- Exposing restricted or confidential documents to unauthorized users.
- Uploading real personal data into demo environments.
- Treating generated answers as policy authority when citations are absent or insufficient.

## Governance Control Map

| Governance concern | Technical control |
| --- | --- |
| Access control | JWT, RBAC, document classification, access groups. |
| Traceability | Audit logs, retrieved contexts, chat records, ingestion jobs. |
| Human oversight | Reviewer role, review queue, risk register. |
| Data protection | PII detection roadmap, upload validation, retention guidance. |
| Transparency | Citations, confidence scores, source metadata. |
| Robustness | Evaluation dataset, regression scoring, refusal tests. |
| Security | Prompt-injection detection, restricted source handling, secrets hygiene. |

## Human Oversight

Reviewer workflows should allow compliance users to inspect:

- Potential PII exposure.
- Low-confidence answers.
- Prompt-injection attempts.
- Restricted document access attempts.
- Hallucination risk reports.

## Data Protection Considerations

- Synthetic data only in this repository.
- Minimize sensitive content copied into logs.
- Store source references and snippets deliberately.
- Use retention policies for uploads, chat logs, and retrieved contexts.
- Consider data residency and encryption controls in cloud deployments.

## Limitations

- Current PII detection is regex-based and should be treated as a first-pass control.
- Current answer generation is local and extractive; provider-backed generation is optional future work.
- Current retrieval uses local hashing embeddings rather than tuned pgvector indexes.
- Automated risk scoring should support, not replace, human review.
- Evaluation metrics are necessary but not sufficient proof of safety.
- Model providers may process prompts according to their own data policies; enterprise deployments should review provider terms.
