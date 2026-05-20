"""Placeholder evaluation runner for the Enterprise RAG Governance Platform.

Phase 4 will replace this with a runner that calls the RAG API and stores
evaluation results. For now, it validates the synthetic dataset shape so CI and
portfolio demos have a concrete command to reference without requiring secrets.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


REQUIRED_FIELDS = {
    "id",
    "question",
    "expected_answer",
    "expected_sources",
    "required_citations",
    "category",
    "should_refuse",
    "risk_tags",
}

PLANNED_METRICS = [
    "answer_relevance",
    "citation_presence",
    "context_precision",
    "groundedness",
    "refusal_accuracy",
]


def load_dataset(path: Path) -> list[dict[str, object]]:
    with path.open(encoding="utf-8") as dataset_file:
        data = json.load(dataset_file)
    if not isinstance(data, list):
        raise ValueError("Evaluation dataset must be a JSON list.")
    return data


def validate_dataset(records: list[dict[str, object]]) -> None:
    for index, record in enumerate(records, start=1):
        missing = REQUIRED_FIELDS.difference(record)
        if missing:
            missing_fields = ", ".join(sorted(missing))
            raise ValueError(f"Record {index} is missing required fields: {missing_fields}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", required=True, type=Path)
    args = parser.parse_args()

    records = load_dataset(args.dataset)
    validate_dataset(records)

    print(f"Loaded {len(records)} evaluation records from {args.dataset}")
    print("Planned metrics:")
    for metric in PLANNED_METRICS:
        print(f"- {metric}")


if __name__ == "__main__":
    main()
