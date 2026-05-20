import hashlib
import json
import math
import re
from collections import Counter


EMBEDDING_MODEL = "local-hashing-v1"
TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9][a-zA-Z0-9_-]*")


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_PATTERN.findall(text)]


def create_embedding(text: str, *, dimensions: int = 96) -> list[float]:
    vector = [0.0] * dimensions
    counts = Counter(tokenize(text))
    if not counts:
        return vector

    for token, count in counts.items():
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % dimensions
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        vector[index] += sign * (1.0 + math.log(count))

    norm = math.sqrt(sum(value * value for value in vector))
    if norm == 0:
        return vector
    return [round(value / norm, 6) for value in vector]


def serialize_embedding(vector: list[float]) -> str:
    return json.dumps(vector, separators=(",", ":"))


def deserialize_embedding(raw: str | None) -> list[float]:
    if not raw:
        return []
    data = json.loads(raw)
    return [float(value) for value in data]


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0
    numerator = sum(a * b for a, b in zip(left, right, strict=True))
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return numerator / (left_norm * right_norm)
