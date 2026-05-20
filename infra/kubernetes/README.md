# Kubernetes Skeleton

This directory is reserved for Phase 5 manifests or Helm/Kustomize overlays. The local Docker Compose setup remains the source of truth for Phase 1.

## Planned Workloads

- `backend` Deployment and Service.
- `frontend` Deployment and Service.
- `worker` Deployment.
- `migration` Job for Alembic upgrades.
- `ingress` for HTTPS routing.
- `configmap` for non-secret runtime settings.
- `secret` references for JWT and LLM provider keys.
- `hpa` for API and worker scaling.

## Runtime Dependencies

Production Kubernetes should use managed services where possible:

- Managed PostgreSQL with pgvector.
- Managed Redis.
- Object storage for uploaded files.
- Central logs, metrics, and traces.
- Cloud secret manager or sealed secrets.

## Hardening Checklist

- Use non-root containers.
- Configure resource requests and limits.
- Restrict egress where possible.
- Enable TLS at ingress.
- Add readiness and liveness probes.
- Mount secrets as environment variables or files from the platform secret store.
