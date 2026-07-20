from __future__ import annotations

import tempfile
import unittest
from dataclasses import replace

from checkpoint_resume import (
    CheckpointStore,
    FakeActionExecutor,
    ResumeStatus,
    WaitReason,
    pause_run,
    resume_run,
)


class CheckpointResumeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory(prefix="checkpoint-test-")
        self.addCleanup(self.temporary.cleanup)
        self.store = CheckpointStore(self.temporary.name)
        self.executor = FakeActionExecutor()
        self.action = {
            "action_name": "update_priority",
            "ticket_id": "T-100",
            "parameters": {"priority": 1},
        }
        self.paused = pause_run(
            self.store,
            wait_reason=WaitReason.APPROVAL,
            pending_action=self.action,
            subject_id="agent-operator",
            environment_fingerprint="policy-v1:ticket-v7",
        )

    def resume(self, **overrides: object):
        arguments = {
            "subject_id": "agent-operator",
            "environment_fingerprint": "policy-v1:ticket-v7",
            "response": {"approved": True},
            "now": 1_100,
        }
        arguments.update(overrides)
        return resume_run(
            self.store,
            self.paused.checkpoint.checkpoint_id,
            self.executor,
            **arguments,
        )

    def test_pause_persists_before_any_effect(self) -> None:
        self.assertEqual(ResumeStatus.WAITING_APPROVAL, self.paused.status)
        self.assertTrue(
            self.store.path_for(self.paused.checkpoint.checkpoint_id).exists()
        )
        self.assertEqual(0, self.executor.effect_count)
        self.assertEqual("run_paused", self.paused.trace[-1].event_type)

    def test_valid_resume_links_trace_and_executes_once(self) -> None:
        resumed = self.resume()

        self.assertEqual(ResumeStatus.COMPLETED, resumed.status)
        self.assertEqual(1, self.executor.effect_count)
        self.assertEqual(
            self.paused.trace[0].correlation_id, resumed.trace[0].correlation_id
        )
        self.assertIn("checkpoint_revalidated", [e.event_type for e in resumed.trace])
        self.assertEqual("run_completed", resumed.trace[-1].event_type)

    def test_subject_and_environment_are_revalidated(self) -> None:
        subject_rejected = self.resume(subject_id="other-user")
        self.assertEqual(ResumeStatus.REJECTED, subject_rejected.status)
        self.assertEqual("subject_revalidation_failed", subject_rejected.trace[-1].event_type)

        environment_rejected = self.resume(environment_fingerprint="policy-v2")
        self.assertEqual(ResumeStatus.REJECTED, environment_rejected.status)
        self.assertEqual(
            "environment_revalidation_failed", environment_rejected.trace[-1].event_type
        )
        self.assertEqual(0, self.executor.effect_count)

    def test_expired_checkpoint_cannot_resume(self) -> None:
        resumed = self.resume(now=1_400)

        self.assertEqual(ResumeStatus.EXPIRED, resumed.status)
        self.assertEqual(0, self.executor.effect_count)

    def test_changed_action_digest_is_rejected(self) -> None:
        changed = dict(self.action)
        changed["parameters"] = {"priority": 0}
        resumed = self.resume(expected_action=changed)

        self.assertEqual(ResumeStatus.REJECTED, resumed.status)
        self.assertEqual("action_digest_mismatch", resumed.trace[-1].event_type)
        self.assertEqual(0, self.executor.effect_count)

    def test_checkpoint_version_is_checked(self) -> None:
        incompatible = replace(self.paused.checkpoint, schema_version=99)
        self.store.save(incompatible)
        resumed = self.resume()

        self.assertEqual(ResumeStatus.REJECTED, resumed.status)
        self.assertEqual("checkpoint_version_rejected", resumed.trace[-1].event_type)

    def test_duplicate_resume_has_no_duplicate_effect(self) -> None:
        first = self.resume()
        second = self.resume()

        self.assertEqual(ResumeStatus.COMPLETED, first.status)
        self.assertEqual(ResumeStatus.ALREADY_COMPLETED, second.status)
        self.assertEqual(first.result, second.result)
        self.assertEqual(1, self.executor.effect_count)

    def test_clarification_resume_consumes_without_action_effect(self) -> None:
        clarification = pause_run(
            self.store,
            wait_reason=WaitReason.CLARIFICATION,
            pending_action={"question_id": "q-priority", "question": "优先级？"},
            subject_id="agent-operator",
            environment_fingerprint="policy-v1:ticket-v7",
            checkpoint_id="cp-clarification",
        )
        resumed = resume_run(
            self.store,
            clarification.checkpoint.checkpoint_id,
            self.executor,
            subject_id="agent-operator",
            environment_fingerprint="policy-v1:ticket-v7",
            response={"answer": "一级"},
        )

        self.assertEqual(ResumeStatus.COMPLETED, resumed.status)
        self.assertEqual(0, self.executor.effect_count)
        self.assertEqual("一级", resumed.result["answer"])


if __name__ == "__main__":
    unittest.main()
