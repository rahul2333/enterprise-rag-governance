# Terraform Skeleton

This directory is reserved for Phase 5 infrastructure-as-code modules. It currently documents the intended cloud resources so reviewers can understand the deployment target without needing cloud credentials.

## Planned Modules

- `network`: virtual network, private subnets, security groups.
- `database`: managed PostgreSQL with pgvector support where available.
- `cache`: managed Redis for Celery broker/result backend.
- `storage`: encrypted object storage for uploaded documents.
- `compute`: container service, Kubernetes cluster, or app platform.
- `secrets`: references to cloud secret manager values.
- `observability`: logs, metrics, traces, and alerting workspace.

## Variables To Model

- `environment`
- `region`
- `app_name`
- `container_image_backend`
- `container_image_frontend`
- `container_image_worker`
- `database_instance_size`
- `monthly_budget_usd`

## Production Notes

- Do not store secrets in Terraform variables files.
- Use remote state with locking.
- Run database migrations as a deployment step.
- Enable backups, encryption, and retention by default.
