"""Run deterministic scenarios for the minimal agent loop lab."""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict

from agent_loop import Decision, LocalActionExecutor, ScriptedDecisionProvider, run_agent


def build_scenario(name: str) -> tuple[ScriptedDecisionProvider, int]:
    scenarios: dict[str, tuple[ScriptedDecisionProvider, int]] = {
        "success": (
            ScriptedDecisionProvider(
                [
                    Decision.act("inspect", "orchestration-state"),
                    Decision.finish("The loop completed after one observation."),
                ]
            ),
            4,
        ),
        "max-steps": (
            ScriptedDecisionProvider(
                [Decision.act("inspect", "still-working")], repeat_last=True
            ),
            2,
        ),
        "invalid": (ScriptedDecisionProvider([{"kind": "act"}]), 4),
        "action-error": (
            ScriptedDecisionProvider([Decision.act("fail", "demonstrate-failure")]),
            4,
        ),
    }
    return scenarios[name]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--scenario",
        choices=("success", "max-steps", "invalid", "action-error"),
        default="success",
    )
    args = parser.parse_args()

    provider, max_steps = build_scenario(args.scenario)
    state = run_agent(
        "Learn the orchestration loop",
        provider,
        LocalActionExecutor(),
        max_steps=max_steps,
    )

    output = {
        "status": state.status.value,
        "step": state.step,
        "final_answer": state.final_answer,
        "error": state.error,
        "observations": [asdict(item) for item in state.observations],
        "trace": [event.to_dict() for event in state.trace],
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
