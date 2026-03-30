# AI-Driven Cybersecurity Governance Prototype

**Thesis:** AI-Driven Cybersecurity Governance for Automated Compliance and Privacy-Preserving Cyber Resilience in Critical Infrastructures

**Degree:** MSc Applied Cybersecurity

**Purpose:** A lightweight proof-of-concept prototype demonstrating how selected requirements from ISO/IEC 27001, NIST CSF 2.0, Cyber Essentials, and GDPR can be translated into structured, machine-interpretable governance logic for automated and continuous compliance monitoring.

---

## Repository Structure

```
├── README.md                          # This file – project overview and folder guide
│
├── schemas/                           # Canonical data schemas
│   ├── requirement_schema.json        # Schema for individual regulatory/standard requirements
│   ├── control_mapping_schema.json    # Schema for cross-standard control mappings
│   ├── evidence_schema.json           # Schema for synthetic evidence inputs
│   └── evaluation_output_schema.json  # Schema for compliance evaluation results
│
├── data/                              # Structured requirement & control data
│   ├── iso27001_requirements.json     # Selected ISO/IEC 27001:2022 controls
│   ├── nist_csf2_requirements.json    # Selected NIST CSF 2.0 subcategories
│   ├── cyber_essentials_requirements.json  # Selected Cyber Essentials controls
│   ├── gdpr_requirements.json         # Selected GDPR articles (governance-relevant)
│   └── control_mappings.json          # Cross-standard mapping of selected controls
│
├── case_study/                        # Simulated critical-infrastructure case study
│   ├── scenario.json                  # Case study description and scope
│   └── evidence/                      # Synthetic evidence inputs
│       ├── access_control_evidence.json
│       ├── incident_response_evidence.json
│       ├── data_protection_evidence.json
│       └── risk_assessment_evidence.json
│
├── rules/                             # Machine-interpretable governance logic
│   ├── rule_templates.json            # Reusable rule definitions
│   └── rule_engine.py                 # Simple rule evaluation engine
│
├── scripts/                           # Analysis and evaluation scripts
│   ├── validate_schemas.py            # Validates data files against schemas
│   ├── evaluate_compliance.py         # Runs compliance checks against evidence
│   ├── generate_report.py             # Produces evaluation output / summary
│   └── cross_map_analysis.py          # Analyses cross-standard coverage
│
├── outputs/                           # Generated evaluation results (gitignored)
│   └── .gitkeep
│
├── docs/                              # Supporting documentation for thesis
│   ├── framework_overview.md          # High-level framework description
│   └── methodology_notes.md          # Notes on design decisions and methodology
│
├── tests/                             # Basic tests for rule logic
│   └── test_rule_engine.py
│
├── requirements.txt                   # Python dependencies
└── .gitignore
```

---

## Folder Roles

### `schemas/`
Contains JSON Schema files that define the **canonical structure** for all data used in the prototype. These schemas ensure that requirements, mappings, evidence, and outputs are consistently structured and machine-readable. They also serve as a formal specification appendix for the thesis.

### `data/`
Holds **structured representations** of selected requirements from each standard/regulation:
- **ISO/IEC 27001:2022** – selected Annex A controls
- **NIST CSF 2.0** – selected subcategories across functions
- **Cyber Essentials** – selected technical controls
- **GDPR** – selected governance-relevant articles

Also contains the **cross-standard control mapping** file that links equivalent or related controls across frameworks.

### `case_study/`
A **simulated critical-infrastructure scenario** (e.g., a regional energy utility) with synthetic evidence inputs. Evidence files represent what an organisation might produce to demonstrate compliance (e.g., access control logs, policy documents, incident response records). All data is synthetic/sample.

### `rules/`
The **governance logic layer** — machine-interpretable rules that encode compliance requirements as evaluable conditions. The rule engine reads rules and evidence, then determines control status (compliant / partially compliant / non-compliant / not assessed).

### `scripts/`
**Executable analysis scripts** that tie everything together:
- Schema validation
- Compliance evaluation against the case study
- Cross-standard coverage analysis
- Report generation

### `outputs/`
Stores **generated results** from running the evaluation scripts — compliance reports, gap analyses, and traceability matrices. These outputs feed directly into the thesis results chapter.

### `docs/`
**Design documentation** that supports the thesis write-up — framework overview, methodology notes, and design rationale.

### `tests/`
Basic **unit tests** for the rule engine to demonstrate correctness and support the evaluation chapter.

---

## Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Language | Python 3.10+ | Widely understood, rich ecosystem, thesis-friendly |
| Data format | JSON | Machine-readable, schema-validatable, portable |
| Schema validation | `jsonschema` | Lightweight, standards-based (JSON Schema Draft 7) |
| Rule logic | Custom Python (dict-based) | Simple, explainable, no heavy dependencies |
| Reporting | JSON + Markdown | Easy to include in thesis, human- and machine-readable |
| Testing | `pytest` | Minimal setup, clear test output |

---

## Quick Start

```bash
# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Validate all data against schemas
python scripts/validate_schemas.py

# 4. Run compliance evaluation
python scripts/evaluate_compliance.py

# 5. Generate report
python scripts/generate_report.py

# 6. Run tests
pytest tests/
```

---

## Scope & Limitations

- This is a **proof-of-concept prototype**, not a production system.
- All evidence and case study data is **synthetic/sample data**.
- The framework covers **selected** controls from each standard, not exhaustive coverage.
- AI/ML aspects are contextual (governance-level reasoning), not deep technical implementations.
- The primary contribution is the **governance framework and methodology**, not the software itself.

---

## Traceability

The prototype maintains clear traceability across four layers:

```
Requirement Source  →  Mapped Control Objective  →  Evidence  →  Compliance Outcome
(e.g., ISO 27001      (unified control ID)         (synthetic    (compliant / gap /
 A.5.1)                                             artefact)     partial)
```

Each layer is linked by identifiers, enabling end-to-end auditability from regulatory requirement to evaluation result.
