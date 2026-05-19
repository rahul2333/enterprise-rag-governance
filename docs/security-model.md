# Security Model

Phase 1 implements JWT authentication and API-layer RBAC.

Roles:

- `admin`: can manage users and upload documents.
- `user`: can list documents filtered by access group and classification.
- `reviewer`: reserved for compliance review workflows in Phase 3.

Security controls started in Phase 1:

- Password hashing with bcrypt.
- JWT access tokens.
- Admin-only upload endpoint.
- Upload extension and size validation.
- Filename sanitization.
- No committed secrets; use `.env`.
