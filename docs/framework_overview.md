# Framework Overview

## AI-Driven Cybersecurity Governance Framework

### Purpose

This framework translates selected regulatory and standards-based requirements from four sources — ISO/IEC 27001:2022, NIST CSF 2.0, Cyber Essentials, and GDPR — into structured, machine-interpretable governance logic that can be evaluated automatically against organisational evidence.

### Core Concepts

1. **Requirement Normalisation** — Each source requirement is captured in a canonical JSON structure with a unique identifier, source standard, description, control objective, and expected evidence types.

2. **Cross-Standard Mapping** — Related requirements across standards are linked through a unified control objective taxonomy (e.g., "Access Control", "Incident Response", "Data Protection"), enabling organisations to demonstrate compliance with multiple standards from a single evidence base.

3. **Rule-Based Governance Logic** — Compliance requirements are encoded as evaluable rules with conditions, thresholds, and expected evidence. The rule engine processes these against submitted evidence to produce a compliance determination.

4. **Automated Evaluation** — The evaluation engine reads rules, evidence, and mappings to produce a compliance status for each control, along with gap identification and traceability back to the originating requirement.

### Architecture (Conceptual)

```
┌─────────────────────────────────────────────────────┐
│                 Standards & Regulations              │
│  ISO 27001  │  NIST CSF 2.0  │  CE  │  GDPR        │
└──────┬──────┴───────┬────────┴──┬───┴──────┬────────┘
       │              │           │          │
       ▼              ▼           ▼          ▼
┌─────────────────────────────────────────────────────┐
│           Requirement Normalisation Layer            │
│         (schemas/ + data/ — JSON structures)         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            Cross-Standard Mapping Layer              │
│           (data/control_mappings.json)               │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│           Governance Logic / Rule Engine             │
│            (rules/ — templates + engine)             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│          Evidence & Case Study Inputs                │
│         (case_study/ — synthetic data)               │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│          Compliance Evaluation & Reporting           │
│          (scripts/ → outputs/)                       │
└─────────────────────────────────────────────────────┘
```

### Design Principles

- **Simplicity** — Prefer readable, explainable logic over complex systems.
- **Modularity** — Each layer is independent and can be extended without affecting others.
- **Traceability** — Every compliance outcome traces back to its source requirement.
- **Reproducibility** — All inputs are declarative; all outputs are deterministic.
- **Thesis-Friendliness** — All artefacts can be included or referenced in the thesis document.
