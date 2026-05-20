from decimal import Decimal


LOCAL_MODEL_NAME = "local-grounded-template-v1"


def estimate_tokens(text: str) -> int:
    return max(1, len(text.split()))


def estimate_cost_usd(
    *,
    prompt_tokens: int,
    completion_tokens: int,
    prompt_price_per_1k: Decimal = Decimal("0.0000"),
    completion_price_per_1k: Decimal = Decimal("0.0000"),
) -> Decimal:
    prompt_cost = Decimal(prompt_tokens) / Decimal(1000) * prompt_price_per_1k
    completion_cost = Decimal(completion_tokens) / Decimal(1000) * completion_price_per_1k
    return (prompt_cost + completion_cost).quantize(Decimal("0.000001"))
