from __future__ import annotations

import unittest

from agent_loop import (
    Decision,
    LocalActionExecutor,
    RunStatus,
    ScriptedDecisionProvider,
    run_agent,
)


class AgentLoopTests(unittest.TestCase):
    def setUp(self) -> None:
        self.executor = LocalActionExecutor()

    def test_completes_after_recording_observation(self) -> None:
        provider = ScriptedDecisionProvider(
            [
                Decision.act("inspect", "current-state"),
                Decision.finish("done"),
            ]
        )

        state = run_agent("test task", provider, self.executor)

        self.assertEqual(RunStatus.COMPLETED, state.status)
        self.assertEqual("done", state.final_answer)
        self.assertEqual(2, state.step)
        self.assertEqual("observed:current-state", state.observations[0].output)
        self.assertIn(
            "observation_recorded", [event.event_type for event in state.trace]
        )
        self.assertEqual("run_completed", state.trace[-1].event_type)

    def test_stops_at_max_steps(self) -> None:
        provider = ScriptedDecisionProvider(
            [Decision.act("inspect", "repeat")], repeat_last=True
        )

        state = run_agent("test task", provider, self.executor, max_steps=2)

        self.assertEqual(RunStatus.MAX_STEPS, state.status)
        self.assertEqual(2, state.step)
        self.assertEqual(2, len(state.observations))
        self.assertEqual("max_steps_reached", state.trace[-1].event_type)

    def test_rejects_invalid_decision(self) -> None:
        provider = ScriptedDecisionProvider([{"kind": "act"}])

        state = run_agent("test task", provider, self.executor)

        self.assertEqual(RunStatus.FAILED, state.status)
        self.assertIn("unsupported decision", state.error or "")
        self.assertEqual("decide", state.trace[-1].phase)
        self.assertEqual("run_failed", state.trace[-1].event_type)

    def test_records_action_failure(self) -> None:
        provider = ScriptedDecisionProvider(
            [Decision.act("fail", "controlled-error")]
        )

        state = run_agent("test task", provider, self.executor)

        self.assertEqual(RunStatus.FAILED, state.status)
        self.assertIn("controlled action failure", state.error or "")
        self.assertEqual("act", state.trace[-1].phase)
        self.assertEqual("fail", state.trace[-1].payload["action_name"])
        self.assertEqual("run_failed", state.trace[-1].event_type)


if __name__ == "__main__":
    unittest.main()
