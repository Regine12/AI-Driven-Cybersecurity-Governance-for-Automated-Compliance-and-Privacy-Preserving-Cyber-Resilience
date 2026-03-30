"""
Compliance Evaluator – runs all rules against case study evidence.

Usage:
    python scripts/evaluate_compliance.py
"""

import sys
from pathlib import Path

# Add project root to path so we can import the rule engine
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from rules.rule_engine import evaluate_all_rules, load_json, save_json
from datetime import datetime, timezone


BASE = Path(__file__).resolve().parent.parent


def main() -> None:
    print("=" * 60)
    print("Compliance Evaluation Engine")
    print("=" * 60)

    # Load rules
    rules_data = load_json(BASE / "rules" / "rule_templates.json")
    rules = rules_data["rules"]
    print(f"\nLoaded {len(rules)} rules.")

    # Load evidence
    evidence_dir = BASE / "case_study" / "evidence"
    evidence_files = sorted(evidence_dir.glob("*.json"))
    evidence_list = [load_json(p) for p in evidence_files]
    print(f"Loaded {len(evidence_list)} evidence files.")

    # Load scenario metadata
    scenario = load_json(BASE / "case_study" / "scenario.json")
    print(f"Scenario: {scenario['title']}")

    # Evaluate
    print(f"\nRunning evaluation...")
    results = evaluate_all_rules(rules, evidence_list)

    # Summarise
    status_counts = {}
    for r in results:
        status_counts[r["status"]] = status_counts.get(r["status"], 0) + 1

    print(f"\n--- Results Summary ---")
    print(f"Total evaluations: {len(results)}")
    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")

    # Detailed per-requirement output
    print(f"\n--- Per-Requirement Status ---")
    for r in results:
        icon = {
            "compliant": "✓",
            "partially_compliant": "◐",
            "non_compliant": "✗",
            "not_assessed": "○",
        }.get(r["status"], "?")
        print(f"  {icon} {r['requirement_id']:<20} [{r['source_standard']:<22}] → {r['status']}")
        if r.get("missing_evidence"):
            print(f"    Missing: {', '.join(r['missing_evidence'])}")

    # Save
    output = {
        "evaluation_run": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "scenario": scenario["scenario_id"],
            "rules_evaluated": len(rules),
            "evidence_files_loaded": len(evidence_list),
            "total_evaluations": len(results),
            "summary": status_counts,
        },
        "results": results,
    }

    out_path = BASE / "outputs" / "evaluation_results.json"
    save_json(output, out_path)
    print(f"\nResults saved to {out_path}")


if __name__ == "__main__":
    main()
