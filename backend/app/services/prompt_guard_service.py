import re
from dataclasses import dataclass


@dataclass(frozen=True)
class PromptRisk:
    reason: str
    severity: str
    matched_text: str


SUSPICIOUS_PATTERNS: dict[str, str] = {
    "ignore_instructions": r"\bignore (?:all )?(?:previous|prior|system|developer) instructions\b",
    "reveal_system_prompt": r"\b(?:reveal|show|print|display).{0,40}(?:system prompt|developer message|hidden instructions)\b",
    "bypass_access_control": r"\b(?:bypass|override|disable).{0,40}(?:access control|rbac|permission|authorization)\b",
    "hidden_documents": r"\b(?:show|dump|list|print).{0,40}(?:hidden|restricted|confidential).{0,25}(?:documents|files|data)\b",
    "secrets_exfiltration": r"\b(?:print|dump|show|reveal|exfiltrate).{0,40}(?:secret|api key|password|token|credential)s?\b",
}


def detect_prompt_injection(prompt: str) -> list[PromptRisk]:
    risks: list[PromptRisk] = []
    for reason, pattern in SUSPICIOUS_PATTERNS.items():
        match = re.search(pattern, prompt, flags=re.IGNORECASE | re.DOTALL)
        if match:
            risks.append(PromptRisk(reason=reason, severity="high", matched_text=match.group(0)[:120]))
    return risks


def is_blocked_prompt(prompt: str) -> bool:
    return bool(detect_prompt_injection(prompt))
