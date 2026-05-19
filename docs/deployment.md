# Deployment

Phase 1 runs locally with Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

Cloud deployment skeletons for Terraform and Kubernetes are reserved under `infra/`.
