"""
Rule Engine for AI-Driven Cybersecurity Governance Prototype.

Evaluates compliance rules against submitted evidence and produces
structured evaluation results with full traceability.
"""

import json
from datetime import datetime, timezone
from pathlib import Path


# ---------------------------------------------------------------------------
# Operator evaluation
# ---------------------------------------------------------------------------

OPERATORS = {
    "equals": lambda actual, expected: actual == expected,
    "not_equals": lambda actual, expected: actual != expected,
    "greater_than": lambda actual, expected: actual > expected,
    "greater_than_or_equal": lambda actual, expected: actual >= expected,
    "less_than": lambda actual, expected: actual < expected,
    "less_than_or_equal": lambda actual, expected: actual <= expected,
    "contains": lambda actual, expected: expected in actual,
    "exists": lambda actual, _expected: actual is not None,
}


def evaluate_condition(condition: dict, evidence_properties: dict) -> bool:
    """Evaluate a single rule condition against evidence properties.

    Args:
        condition: dict with keys ``field``, ``operator``, ``value``.
        evidence_properties: flat dict of key-value pairs drawn from
            all artefacts in an evidence submission.

    Returns:
        ``True`` if the condition is satisfied, ``False`` otherwise.
    """
    field = condition["field"]
    operator = condition["operator"]
    expected = condition["value"]

    actual = evidence_properties.get(field)
    if actual is None:
        return False

    op_func = OPERATORS.get(operator)
    if op_func is None:
        raise ValueError(f"Unknown operator: {operator}")

    try:
        return op_func(actual, expected)
    except TypeError:
        return False


# ---------------------------------------------------------------------------
# Evidence property extraction
# ---------------------------------------------------------------------------

def extract_properties(evidence: dict) -> dict:
    """Flatten all artefact properties from an evidence file into one dict.

    Later artefacts overwrite earlier ones if keys collide, which is
    acceptable for this proof-of-concept scope.
    """
    props: dict = {}
    for artefact in evidence.get("artefacts", []):
        artefact_props = artefact.get("properties", {})
        props.update(artefact_props)
    return props


# ---------------------------------------------------------------------------
# Rule evaluation
# ---------------------------------------------------------------------------

def evaluate_rule(rule: dict, evidence_list: list[dict]) -> dict:
    """Evaluate a single rule against a list of evidence files.

    The engine:
    1. Collects all evidence whose ``control_domain`` matches the rule.
    2. Merges their properties into a single flat dict.
    3. Checks every condition in the rule against the merged properties.
    4. Determines compliance status based on how many conditions pass.

    Returns:
        An evaluation result dict conforming to ``evaluation_output_schema``.
    """
    domain = rule["control_domain"]

    # Gather matching evidence
    matched_evidence: list[dict] = [
        ev for ev in evidence_list if ev.get("control_domain") == domain
    ]
    matched_ids = [ev["evidence_id"] for ev in matched_evidence]

    # Merge properties
    merged_props: dict = {}
    for ev in matched_evidence:
        merged_props.update(extract_properties(ev))

    # Evaluate conditions
    conditions = rule.get("conditions", [])
    results = []
    failed_fields = []

    for cond in conditions:
        passed = evaluate_condition(cond, merged_props)
        results.append(passed)
        if not passed:
            failed_fields.append(cond["field"])

    # Determine status
    total = len(results)
    passed_count = sum(results)

    if total == 0:
        status = "not_assessed"
        details = "No conditions defined for this rule."
    elif passed_count == total:
        status = "compliant"
        details = f"All {total} conditions met."
    elif passed_count > 0:
        status = "partially_compliant"
        details = (
            f"{passed_count}/{total} conditions met. "
            f"Failed checks: {', '.join(failed_fields)}."
        )
    else:
        if matched_ids:
            status = "non_compliant"
            details = f"Evidence found but none of the {total} conditions met."
        else:
            status = "not_assessed"
            details = f"No evidence found for domain '{domain}'."

    # Build evaluation result for each target requirement
    evaluation_results = []
    for req_id in rule.get("target_requirement_ids", []):
        evaluation_results.append({
            "evaluation_id": f"EVAL-{rule['rule_id']}-{req_id}",
            "requirement_id": req_id,
            "source_standard": _infer_standard(req_id),
            "control_domain": domain,
            "status": status,
            "matched_evidence_ids": matched_ids,
            "missing_evidence": failed_fields,
            "rule_id": rule["rule_id"],
            "details": details,
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
        })

    return {
        "rule_id": rule["rule_id"],
        "status": status,
        "details": details,
        "evaluations": evaluation_results,
    }


# ---------------------------------------------------------------------------
# Batch evaluation
# ---------------------------------------------------------------------------

def evaluate_all_rules(rules: list[dict], evidence_list: list[dict]) -> list[dict]:
    """Evaluate all rules and return a flat list of evaluation results."""
    all_evaluations: list[dict] = []
    for rule in rules:
        result = evaluate_rule(rule, evidence_list)
        all_evaluations.extend(result["evaluations"])
    return all_evaluations


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_STANDARD_PREFIXES = {
    "ISO27001": "ISO/IEC 27001:2022",
    "NIST": "NIST CSF 2.0",
    "CE": "Cyber Essentials",
    "GDPR": "GDPR",
}


def _infer_standard(requirement_id: str) -> str:
    """Infer the source standard from a requirement ID prefix."""
    for prefix, standard in _STANDARD_PREFIXES.items():
        if requirement_id.startswith(prefix):
            return standard
    return "Unknown"


# ---------------------------------------------------------------------------
# File I/O helpers
# ---------------------------------------------------------------------------

def load_json(path: str | Path) -> dict | list:
    """Load and return parsed JSON from *path*."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(data, path: str | Path, indent: int = 2) -> None:
    """Write *data* as pretty-printed JSON to *path*."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=indent, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Standalone execution
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent

    # Load rules
    rules_data = load_json(base / "rules" / "rule_templates.json")
    rules = rules_data["rules"]

    # Load evidence
    evidence_dir = base / "case_study" / "evidence"
    evidence_list = [load_json(p) for p in sorted(evidence_dir.glob("*.json"))]

    # Evaluate
    results = evaluate_all_rules(rules, evidence_list)

    # Output
    output = {
        "evaluation_run": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "rules_evaluated": len(rules),
            "evidence_files_loaded": len(evidence_list),
            "total_evaluations": len(results),
        },
        "results": results,
    }

    out_path = base / "outputs" / "evaluation_results.json"
    save_json(output, out_path)
    print(f"Evaluation complete. {len(results)} results written to {out_path}")
