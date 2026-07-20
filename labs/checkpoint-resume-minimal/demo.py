"""Run deterministic E4 checkpoint and resume scenarios."""

from __future__ import annotations

import argparse
import json
import tempfile
from pathlib import Path

from checkpoint_resume import (
    CheckpointStore,
    FakeActionExecutor,
    WaitReason,
    pause_run,
    resume_run,
)


SCENARIO_PATH = Path(__file__).with_name("fixtures") / "scenarios.json"


def serialize(run: object) -> dict[str, object]:
    return {
        "status": run.status.value,
        "checkpoint": run.checkpoint.to_dict(),
        "result": run.result,
        "error": run.error,
        "trace": [event.to_dict() for event in run.trace],
    }


def main() -> None:
    scenarios = json.loads(SCENARIO_PATH.read_text(encoding="utf-8"))
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", choices=tuple(scenarios), default="valid-resume")
    args = parser.parse_args()
    config = scenarios[args.scenario]

    with tempfile.TemporaryDirectory(prefix="checkpoint-e4-") as directory:
        store = CheckpointStore(directory)
        executor = FakeActionExecutor()
        if config.get("clarification"):
            action = {"question_id": "q-priority", "question": "优先级应调整为几级？"}
            wait_reason = WaitReason.CLARIFICATION
            response = {"answer": "调整为一级"}
        else:
            action = {
                "action_name": "update_priority",
                "ticket_id": "T-100",
                "parameters": {"priority": 1},
            }
            wait_reason = WaitReason.APPROVAL
            response = {"approved": True}

        paused = pause_run(
            store,
            wait_reason=wait_reason,
            pending_action=action,
            subject_id="agent-operator",
            environment_fingerprint="policy-v1:ticket-v7",
        )
        expected_action = dict(action)
        if config.get("change_action"):
            expected_action["parameters"] = {"priority": 0}
        resumed = resume_run(
            store,
            paused.checkpoint.checkpoint_id,
            executor,
            subject_id=config["subject_id"],
            environment_fingerprint=config["environment"],
            response=response,
            expected_action=expected_action,
            now=config["now"],
        )
        repeated = None
        if config.get("resume_twice"):
            repeated = resume_run(
                store,
                paused.checkpoint.checkpoint_id,
                executor,
                subject_id=config["subject_id"],
                environment_fingerprint=config["environment"],
                response=response,
                now=config["now"],
            )
        print(
            json.dumps(
                {
                    "scenario": args.scenario,
                    "paused": serialize(paused),
                    "resumed": serialize(resumed),
                    "repeated": serialize(repeated) if repeated else None,
                    "effect_count": executor.effect_count,
                },
                ensure_ascii=False,
                indent=2,
            )
        )


if __name__ == "__main__":
    main()
