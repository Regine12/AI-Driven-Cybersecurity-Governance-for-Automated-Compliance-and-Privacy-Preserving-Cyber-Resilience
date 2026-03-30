"""
Schema Validator – validates all data files against their JSON schemas.

Usage:
    python scripts/validate_schemas.py
"""

import json
import sys
from pathlib import Path

from jsonschema import Draft7Validator, ValidationError


BASE = Path(__file__).resolve().parent.parent
SCHEMAS_DIR = BASE / "schemas"


# Map of schema file → list of data files to validate against it
VALIDATION_MAP = {
    "requirement_schema.json": [
        "data/iso27001_requirements.json",
        "data/nist_csf2_requirements.json",
        "data/cyber_essentials_requirements.json",
        "data/gdpr_requirements.json",
    ],
    "control_mapping_schema.json": [
        "data/control_mappings.json",
    ],
    "evidence_schema.json": [
        "case_study/evidence/access_control_evidence.json",
        "case_study/evidence/incident_response_evidence.json",
        "case_study/evidence/data_protection_evidence.json",
        "case_study/evidence/risk_assessment_evidence.json",
    ],
}


def load_json(path: Path) -> dict | list:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_file(schema: dict, data_path: Path, is_array_wrapper: bool = False) -> list[str]:
    """Validate a data file against a schema.  Returns list of error messages."""
    data = load_json(data_path)
    validator = Draft7Validator(schema)
    errors: list[str] = []

    if is_array_wrapper:
        # Files like requirements wrap items in a "requirements" array
        items_key = "requirements" if "requirements" in data else "mappings"
        items = data.get(items_key, [])
        for i, item in enumerate(items):
            for error in validator.iter_errors(item):
                errors.append(f"  [{i}] {error.message}")
    else:
        for error in validator.iter_errors(data):
            errors.append(f"  {error.message}")

    return errors


def main() -> int:
    total_files = 0
    total_errors = 0

    print("=" * 60)
    print("Schema Validation Report")
    print("=" * 60)

    for schema_file, data_files in VALIDATION_MAP.items():
        schema_path = SCHEMAS_DIR / schema_file
        schema = load_json(schema_path)
        print(f"\nSchema: {schema_file}")

        for rel_path in data_files:
            data_path = BASE / rel_path
            total_files += 1

            # Determine if the file wraps items in an array
            is_wrapper = schema_file in (
                "requirement_schema.json",
                "control_mapping_schema.json",
            )

            errors = validate_file(schema, data_path, is_array_wrapper=is_wrapper)

            if errors:
                print(f"  ✗ {rel_path} — {len(errors)} error(s)")
                for err in errors:
                    print(f"    {err}")
                total_errors += len(errors)
            else:
                print(f"  ✓ {rel_path}")

    print("\n" + "=" * 60)
    print(f"Files validated: {total_files}")
    print(f"Total errors:    {total_errors}")
    print("=" * 60)

    return 1 if total_errors > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
