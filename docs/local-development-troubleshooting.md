# Local Development Troubleshooting

Use this when the app does not start cleanly on a local workstation.

## Docker Is Unavailable

Symptom:

```text
docker: The term 'docker' is not recognized
```

Fix:

- Install and start Docker Desktop, or use another Docker-compatible runtime.
- Reopen the terminal after installation so `docker` is on `PATH`.
- Verify with:

```bash
docker --version
docker compose version
```

The full stack requires Docker because the backend depends on PostgreSQL, Redis, and the Celery worker.

## Frontend-Only Mode

When Docker is unavailable, inspect the UI with Vite:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

Caveats:

- Login and live API workflows require the backend.
- Upload, ingestion, chat, review queue, audit logs, and evaluation scoring require the full stack.
- Some pages use frontend fallback data for visual inspection.

## PowerShell Blocks npm

Symptom:

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system
```

Use the command shim directly:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
```

This avoids changing the machine execution policy.

## Backend Dependency Caveats

Prefer Docker for backend checks because it gives the expected Linux runtime and service dependencies:

```bash
docker compose run --rm backend pytest
docker compose run --rm backend ruff check .
```

If running backend commands directly on the host:

- Use Python 3.12.
- Install dependencies from `backend/requirements.txt`.
- Provide `DATABASE_URL`, `REDIS_URL`, and `JWT_SECRET_KEY`.
- Start PostgreSQL and Redis separately.
- Remember that ingestion requires a worker process.

## Clean Restart

If containers or volumes are stale:

```bash
docker compose down
docker compose up --build
```

To reset local data:

```bash
docker compose down -v
docker compose up --build
```
