from __future__ import annotations

import unittest

from decision_contract import (
    DecisionKind,
    DecisionValidationError,
    RecordingActionIntentSink,
    RunStatus,
    evaluate_decision,
    parse_decision,
)


class DecisionContractTests(unittest.TestCase):
    def test_accepts_valid_action_intent(self) -> None:
        sink = RecordingActionIntentSink()
        state = evaluate_decision(
            {
                "kind": "act",
                "action_name": "get_ticket",
                "arguments": {"ticket_id": "T-100"},
            },
            sink,
        )

        self.assertEqual(RunStatus.ACTION_READY, state.status)
        self.assertEqual(DecisionKind.ACT, state.decision.kind)
        self.assertEqual(1, len(sink.accepted))
        self.assertEqual("action_ready", state.trace[-1].event_type)

    def test_finish_is_not_an_action(self) -> None:
        sink = RecordingActionIntentSink()
        state = evaluate_decision(
            {"kind": "finish", "answer": "工单正在处理中。"}, sink
        )

        self.assertEqual(RunStatus.COMPLETED, state.status)
        self.assertEqual(0, len(sink.accepted))
        self.assertEqual("run_completed", state.trace[-1].event_type)

    def test_clarify_enters_waiting_state(self) -> None:
        sink = RecordingActionIntentSink()
        state = evaluate_decision(
            {
                "kind": "clarify",
                "question_id": "q-ticket-id",
                "question": "请提供工单编号。",
            },
            sink,
        )

        self.assertEqual(RunStatus.WAITING_CLARIFICATION, state.status)
        self.assertEqual(0, len(sink.accepted))
        self.assertEqual("clarification_requested", state.trace[-1].event_type)

    def test_invalid_kind_fails_before_action_boundary(self) -> None:
        sink = RecordingActionIntentSink()
        state = evaluate_decision({"kind": "guess", "answer": "maybe"}, sink)

        self.assertEqual(RunStatus.FAILED, state.status)
        self.assertEqual(0, len(sink.accepted))
        self.assertEqual("decision_validation_failed", state.trace[-1].event_type)

    def test_missing_and_extra_fields_are_rejected(self) -> None:
        for raw in (
            {"kind": "act", "action_name": "get_ticket"},
            {"kind": "finish", "answer": "done", "unexpected": True},
        ):
            with self.subTest(raw=raw):
                with self.assertRaises(DecisionValidationError):
                    parse_decision(raw)

    def test_arguments_must_be_an_object(self) -> None:
        with self.assertRaisesRegex(DecisionValidationError, "arguments"):
            parse_decision(
                {
                    "kind": "act",
                    "action_name": "get_ticket",
                    "arguments": "T-100",
                }
            )


if __name__ == "__main__":
    unittest.main()
