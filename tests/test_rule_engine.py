"""
Unit tests for the rule engine.

Usage:
    pytest tests/test_rule_engine.py -v
"""

import sys
from pathlib import Path

# Ensure project root is on the path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from rules.rule_engine import evaluate_condition, extract_properties, evaluate_rule


# ---------------------------------------------------------------------------
# evaluate_condition tests
# ---------------------------------------------------------------------------

class TestEvaluateCondition:
    """Tests for individual condition evaluation."""

    def test_equals_true(self):
        cond = {"field": "mfa_enabled", "operator": "equals", "value": True}
        props = {"mfa_enabled": True}
        assert evaluate_condition(cond, props) is True

    def test_equals_false(self):
        cond = {"field": "mfa_enabled", "operator": "equals", "value": True}
        props = {"mfa_enabled": False}
        assert evaluate_condition(cond, props) is False

    def test_missing_field_returns_false(self):
        cond = {"field": "nonexistent", "operator": "equals", "value": True}
        props = {"other_field": True}
        assert evaluate_condition(cond, props) is False

    def test_greater_than_or_equal_pass(self):
        cond = {"field": "coverage", "operator": "greater_than_or_equal", "value": 90}
        props = {"coverage": 95}
        assert evaluate_condition(cond, props) is True

    def test_greater_than_or_equal_fail(self):
        cond = {"field": "coverage", "operator": "greater_than_or_equal", "value": 90}
        props = {"coverage": 85}
        assert evaluate_condition(cond, props) is False

    def test_less_than_or_equal(self):
        cond = {"field": "hours", "operator": "less_than_or_equal", "value": 72}
        props = {"hours": 48}
        assert evaluate_condition(cond, props) is True

    def test_not_equals(self):
        cond = {"field": "status", "operator": "not_equals", "value": "disabled"}
        props = {"status": "enabled"}
        assert evaluate_condition(cond, props) is True

    def test_equals_zero(self):
        cond = {"field": "risks_without_treatment", "operator": "equals", "value": 0}
        props = {"risks_without_treatment": 0}
        assert evaluate_condition(cond, props) is True

    def test_equals_zero_fail(self):
        cond = {"field": "risks_without_treatment", "operator": "equals", "value": 0}
        props = {"risks_without_treatment": 2}
        assert evaluate_condition(cond, props) is False


# ---------------------------------------------------------------------------
# extract_properties tests
# ---------------------------------------------------------------------------

class TestExtractProperties:
    """Tests for flattening artefact properties."""

    def test_single_artefact(self):
        evidence = {
            "artefacts": [
                {"name": "test", "content_summary": "test", "properties": {"a": 1, "b": 2}}
            ]
        }
        props = extract_properties(evidence)
        assert props == {"a": 1, "b": 2}

    def test_multiple_artefacts_merged(self):
        evidence = {
            "artefacts": [
                {"name": "a", "content_summary": "a", "properties": {"x": 1}},
                {"name": "b", "content_summary": "b", "properties": {"y": 2}},
            ]
        }
        props = extract_properties(evidence)
        assert props == {"x": 1, "y": 2}

    def test_empty_artefacts(self):
        evidence = {"artefacts": []}
        props = extract_properties(evidence)
        assert props == {}

    def test_no_properties_key(self):
        evidence = {
            "artefacts": [
                {"name": "test", "content_summary": "test"}
            ]
        }
        props = extract_properties(evidence)
        assert props == {}


# ---------------------------------------------------------------------------
# evaluate_rule tests
# ---------------------------------------------------------------------------

class TestEvaluateRule:
    """Tests for full rule evaluation."""

    def _make_rule(self, conditions, domain="Access Control"):
        return {
            "rule_id": "TEST-01",
            "control_domain": domain,
            "target_requirement_ids": ["TEST-REQ-01"],
            "conditions": conditions,
        }

    def _make_evidence(self, properties, domain="Access Control"):
        return {
            "evidence_id": "EV-TEST-01",
            "control_domain": domain,
            "artefacts": [
                {"name": "test", "content_summary": "test", "properties": properties}
            ],
        }

    def test_fully_compliant(self):
        rule = self._make_rule([
            {"field": "mfa_enabled", "operator": "equals", "value": True},
            {"field": "coverage", "operator": "greater_than_or_equal", "value": 90},
        ])
        evidence = [self._make_evidence({"mfa_enabled": True, "coverage": 95})]

        result = evaluate_rule(rule, evidence)
        assert result["status"] == "compliant"

    def test_partially_compliant(self):
        rule = self._make_rule([
            {"field": "mfa_enabled", "operator": "equals", "value": True},
            {"field": "coverage", "operator": "greater_than_or_equal", "value": 90},
        ])
        evidence = [self._make_evidence({"mfa_enabled": True, "coverage": 80})]

        result = evaluate_rule(rule, evidence)
        assert result["status"] == "partially_compliant"

    def test_non_compliant(self):
        rule = self._make_rule([
            {"field": "mfa_enabled", "operator": "equals", "value": True},
        ])
        evidence = [self._make_evidence({"mfa_enabled": False})]

        result = evaluate_rule(rule, evidence)
        assert result["status"] == "non_compliant"

    def test_not_assessed_no_evidence(self):
        rule = self._make_rule([
            {"field": "mfa_enabled", "operator": "equals", "value": True},
        ], domain="Access Control")
        evidence = [self._make_evidence({"some_field": True}, domain="Data Protection")]

        result = evaluate_rule(rule, evidence)
        assert result["status"] == "not_assessed"

    def test_evaluation_has_traceability(self):
        rule = self._make_rule([
            {"field": "ok", "operator": "equals", "value": True},
        ])
        evidence = [self._make_evidence({"ok": True})]

        result = evaluate_rule(rule, evidence)
        evals = result["evaluations"]
        assert len(evals) == 1
        assert evals[0]["requirement_id"] == "TEST-REQ-01"
        assert evals[0]["rule_id"] == "TEST-01"
        assert evals[0]["matched_evidence_ids"] == ["EV-TEST-01"]
