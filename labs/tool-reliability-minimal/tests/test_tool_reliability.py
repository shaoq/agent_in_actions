from __future__ import annotations

import unittest

from tool_reliability import (
    Approval,
    EffectReceipt,
    FakeTicketService,
    RunStatus,
    Subject,
    TicketAction,
    action_digest,
    idempotency_key,
    run_reliable_action,
)


class ToolReliabilityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.subject = Subject("agent-operator", frozenset({"ticket:update"}))
        self.action = TicketAction(
            "add_internal_note", "T-100", {"note": "交给二线处理"}
        )

    def test_authorized_action_records_receipt(self) -> None:
        service = FakeTicketService()
        run = run_reliable_action(self.subject, self.action, service)

        self.assertEqual(RunStatus.COMPLETED, run.status)
        self.assertIsNotNone(run.receipt)
        self.assertEqual(1, service.effect_count)
        self.assertEqual("effect_receipt_recorded", run.trace[-1].event_type)

    def test_unauthorized_action_has_zero_effects(self) -> None:
        service = FakeTicketService()
        run = run_reliable_action(
            Subject("reader", frozenset()), self.action, service
        )

        self.assertEqual(RunStatus.DENIED, run.status)
        self.assertEqual(0, service.attempt_count)
        self.assertEqual(0, service.effect_count)

    def test_high_risk_action_waits_for_matching_approval(self) -> None:
        action = TicketAction("update_priority", "T-100", {"priority": 1})
        service = FakeTicketService()
        waiting = run_reliable_action(self.subject, action, service)

        self.assertEqual(RunStatus.WAITING_APPROVAL, waiting.status)
        self.assertEqual(0, service.effect_count)

        approval = Approval(
            self.subject.subject_id,
            action_digest(self.subject, action),
            approved=True,
        )
        completed = run_reliable_action(
            self.subject, action, service, approval=approval
        )
        self.assertEqual(RunStatus.COMPLETED, completed.status)
        self.assertEqual(1, service.effect_count)

    def test_mismatched_approval_is_denied(self) -> None:
        action = TicketAction("update_priority", "T-100", {"priority": 1})
        service = FakeTicketService()
        run = run_reliable_action(
            self.subject,
            action,
            service,
            approval=Approval("other-subject", "wrong", True),
        )

        self.assertEqual(RunStatus.DENIED, run.status)
        self.assertEqual(0, service.effect_count)

    def test_retry_uses_one_key_and_respects_budget(self) -> None:
        service = FakeTicketService(transient_failures=1)
        run = run_reliable_action(
            self.subject, self.action, service, max_attempts=2
        )

        self.assertEqual(RunStatus.COMPLETED, run.status)
        self.assertEqual(2, run.attempts)
        attempt_keys = [
            event.payload["idempotency_key"]
            for event in run.trace
            if event.event_type == "action_attempted"
        ]
        self.assertEqual([run.idempotency_key, run.idempotency_key], attempt_keys)
        self.assertEqual(1, service.effect_count)

        exhausted_service = FakeTicketService(transient_failures=3)
        exhausted = run_reliable_action(
            self.subject, self.action, exhausted_service, max_attempts=2
        )
        self.assertEqual(RunStatus.RETRY_EXHAUSTED, exhausted.status)
        self.assertEqual(2, exhausted_service.attempt_count)
        self.assertEqual(0, exhausted_service.effect_count)

    def test_unknown_outcome_queries_receipt_instead_of_rewriting(self) -> None:
        service = FakeTicketService(lose_response_after_commit=True)
        run = run_reliable_action(self.subject, self.action, service)

        self.assertEqual(RunStatus.COMPLETED, run.status)
        self.assertEqual(1, service.effect_count)
        self.assertEqual(1, service.attempt_count)
        self.assertEqual(1, service.ledger.query_count)
        self.assertIn(
            "unknown_outcome_detected", [event.event_type for event in run.trace]
        )
        self.assertEqual("effect_reconciled", run.trace[-1].event_type)

    def test_duplicate_request_replays_receipt_without_new_effect(self) -> None:
        service = FakeTicketService()
        first = run_reliable_action(self.subject, self.action, service)
        second = run_reliable_action(self.subject, self.action, service)

        self.assertEqual(first.receipt, second.receipt)
        self.assertEqual(1, service.effect_count)
        self.assertEqual(2, service.attempt_count)

    def test_same_key_with_different_digest_conflicts(self) -> None:
        service = FakeTicketService()
        key = idempotency_key("ticket-e3-run", self.action)
        service.ledger.commit(
            EffectReceipt(
                "existing", key, "different", "T-100", {"note": "old"}
            )
        )
        run = run_reliable_action(self.subject, self.action, service)

        self.assertEqual(RunStatus.CONFLICT, run.status)
        self.assertEqual(0, service.effect_count)
        self.assertEqual("idempotency_conflict", run.trace[-1].event_type)


if __name__ == "__main__":
    unittest.main()
