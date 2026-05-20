import re
from dataclasses import dataclass


@dataclass(frozen=True)
class PiiFindingResult:
    finding_type: str
    severity: str
    sample: str


PII_PATTERNS: dict[str, tuple[str, str]] = {
    "email": (r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", "medium"),
    "phone": (r"(?<!\d)(?:\+?\d[\d\s().-]{7,}\d)(?!\d)", "medium"),
    "credit_card_like": (r"(?<!\d)(?:\d[ -]?){13,19}(?!\d)", "high"),
    "government_id_like": (r"\b(?:[A-Z]{2,4}[- ]?)?\d{6,12}[A-Z]?\b", "high"),
    "iban_like": (r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b", "high"),
}


def redact_sample(sample: str) -> str:
    compact = sample.strip()
    if len(compact) <= 6:
        return "*" * len(compact)
    return f"{compact[:3]}...{compact[-3:]}"


def detect_pii(text: str) -> list[PiiFindingResult]:
    findings: list[PiiFindingResult] = []
    for finding_type, (pattern, severity) in PII_PATTERNS.items():
        for match in re.finditer(pattern, text, flags=re.IGNORECASE):
            findings.append(
                PiiFindingResult(
                    finding_type=finding_type,
                    severity=severity,
                    sample=redact_sample(match.group(0)),
                )
            )
    return findings
