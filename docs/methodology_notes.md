# Methodology Notes

## Design Decisions

### Why JSON over YAML?
- JSON is natively supported by Python's standard library.
- JSON Schema is a mature validation standard (Draft 7+).
- JSON is unambiguous in structure — no indentation-sensitive parsing issues.
- JSON is more widely supported for machine-to-machine interoperability.

### Why a custom rule engine over an existing tool?
- Keeps the prototype self-contained and explainable.
- Avoids dependency on external compliance tools that may impose their own data models.
- Allows full control over rule semantics for thesis documentation.
- A simple dict-based engine is sufficient for proof-of-concept scope.

### Why selected controls rather than full standard coverage?
- Full coverage of any one standard would be infeasible in the thesis timeframe.
- Selected controls are chosen to demonstrate cross-standard mapping across key governance domains (access control, incident response, data protection, risk management).
- Selection criteria are documented and justified in the thesis.

### Why synthetic evidence?
- Real organisational data raises confidentiality and ethics concerns.
- Synthetic data allows full control over test scenarios (compliant, partially compliant, non-compliant cases).
- The prototype's value is in the framework logic, not the data itself.

## Standards Selection Rationale

| Standard | Rationale |
|----------|-----------|
| ISO/IEC 27001:2022 | Leading international ISMS standard; Annex A controls are widely adopted |
| NIST CSF 2.0 | US federal framework; function-based structure is complementary to ISO 27001 |
| Cyber Essentials | UK-focused baseline; provides a practical minimum-security perspective |
| GDPR | EU data protection regulation; adds privacy dimension to governance |

## Evaluation Approach

The prototype will be evaluated on:
1. **Correctness** — Does the rule engine produce expected compliance outcomes for known inputs?
2. **Coverage** — How many cross-standard control relationships are captured?
3. **Traceability** — Can each outcome be traced to its source requirement?
4. **Extensibility** — How easily can new standards or rules be added?
