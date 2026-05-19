from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "admin"
    USER = "user"
    REVIEWER = "reviewer"


class DocumentClassification(StrEnum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"


class IngestionStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ReviewStatus(StrEnum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"


class AuditEventType(StrEnum):
    LOGIN = "login"
    REGISTER = "register"
    DOCUMENT_UPLOAD = "document_upload"
    DOCUMENT_DELETE = "document_delete"
    ACCESS_DENIED = "access_denied"
