"""Run deterministic E1 decision-contract scenarios."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from decision_contract import RecordingActionIntentSink, evaluate_decision


SCENARIO_PATH = Path(__file__).with_name("fixtures") / "scenarios.json"


def main() -> None:
    scenarios = json.loads(SCENARIO_PATH.read_text(encoding="utf-8"))
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", choices=tuple(scenarios), default="act-success")
    args = parser.parse_args()

    sink = RecordingActionIntentSink()
    state = evaluate_decision(scenarios[args.scenario], sink)
    print(
        json.dumps(
            {
                "scenario": args.scenario,
                "status": state.status.value,
                "decision": state.decision.to_dict() if state.decision else None,
                "error": state.error,
                "accepted_action_intents": len(sink.accepted),
                "trace": [event.to_dict() for event in state.trace],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
