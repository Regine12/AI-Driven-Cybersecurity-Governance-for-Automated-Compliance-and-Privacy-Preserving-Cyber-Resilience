"""
Cross-Standard Mapping Analysis – analyses coverage across standards.

Usage:
    python scripts/cross_map_analysis.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from rules.rule_engine import load_json, save_json


BASE = Path(__file__).resolve().parent.parent


def load_all_requirements() -> dict[str, dict]:
    """Load all requirements from all standards into a dict keyed by requirement_id."""
    all_reqs: dict[str, dict] = {}
    data_dir = BASE / "data"

    for req_file in data_dir.glob("*_requirements.json"):
        data = load_json(req_file)
        for req in data.get("requirements", []):
            all_reqs[req["requirement_id"]] = req

    return all_reqs


def main() -> None:
    print("=" * 60)
    print("Cross-Standard Mapping Analysis")
    print("=" * 60)

    # Load mappings
    mappings_data = load_json(BASE / "data" / "control_mappings.json")
    mappings = mappings_data["mappings"]

    # Load all requirements
    all_reqs = load_all_requirements()
    all_req_ids = set(all_reqs.keys())

    # Track which requirements are mapped
    mapped_req_ids: set[str] = set()
    standards_coverage: dict[str, dict] = {}

    print(f"\nTotal requirements loaded: {len(all_reqs)}")
    print(f"Total mapping groups: {len(mappings)}")

    print(f"\n--- Mapping Groups ---")
    for mapping in mappings:
        print(f"\n  {mapping['mapping_id']}: {mapping['control_domain']}")
        print(f"    Objective: {mapping['unified_objective'][:80]}...")
        print(f"    Standards linked: {len(mapping['mapped_requirements'])}")

        for mr in mapping["mapped_requirements"]:
            req_id = mr["requirement_id"]
            standard = mr["source_standard"]
            relationship = mr.get("relationship", "unspecified")
            mapped_req_ids.add(req_id)

            if standard not in standards_coverage:
                standards_coverage[standard] = {"total": 0, "mapped": 0, "ids": []}

            print(f"      → {req_id} ({standard}) [{relationship}]")

    # Calculate coverage
    print(f"\n--- Coverage by Standard ---")
    for req_id, req in all_reqs.items():
        standard = req["source_standard"]
        if standard not in standards_coverage:
            standards_coverage[standard] = {"total": 0, "mapped": 0, "ids": []}
        standards_coverage[standard]["total"] += 1
        standards_coverage[standard]["ids"].append(req_id)
        if req_id in mapped_req_ids:
            standards_coverage[standard]["mapped"] += 1

    for standard, info in sorted(standards_coverage.items()):
        pct = (info["mapped"] / info["total"] * 100) if info["total"] > 0 else 0
        print(f"  {standard:<24} {info['mapped']}/{info['total']} mapped ({pct:.0f}%)")

    # Unmapped requirements
    unmapped = all_req_ids - mapped_req_ids
    if unmapped:
        print(f"\n--- Unmapped Requirements ({len(unmapped)}) ---")
        for req_id in sorted(unmapped):
            req = all_reqs[req_id]
            print(f"  {req_id} ({req['source_standard']}) — {req['control_domain']}")

    # Domain coverage
    print(f"\n--- Domain Coverage ---")
    domain_map: dict[str, list[str]] = {}
    for mapping in mappings:
        domain = mapping["control_domain"]
        standards = list({mr["source_standard"] for mr in mapping["mapped_requirements"]})
        domain_map[domain] = standards

    for domain, standards in sorted(domain_map.items()):
        print(f"  {domain}: {', '.join(sorted(standards))}")

    # Save analysis
    analysis = {
        "total_requirements": len(all_reqs),
        "total_mappings": len(mappings),
        "mapped_requirements": len(mapped_req_ids),
        "unmapped_requirements": sorted(unmapped),
        "coverage_by_standard": {
            std: {"mapped": info["mapped"], "total": info["total"]}
            for std, info in standards_coverage.items()
        },
        "domain_coverage": domain_map,
    }

    out_path = BASE / "outputs" / "cross_mapping_analysis.json"
    save_json(analysis, out_path)
    print(f"\nAnalysis saved to {out_path}")


if __name__ == "__main__":
    main()
