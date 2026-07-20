"""Run deterministic E2 tool-calling scenarios."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from tool_calling import FakeTicketReader, build_ticket_registry, execute_tool


SCENARIO_PATH = Path(__file__).with_name("fixtures") / "scenarios.json"


def main() -> None:
    scenarios = json.loads(SCENARIO_PATH.read_text(encoding="utf-8"))
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", choices=tuple(scenarios), default="success")
    args = parser.parse_args()

    reader = FakeTicketReader()
    registry = build_ticket_registry(reader)
    scenario = scenarios[args.scenario]
    run = execute_tool(registry, scenario["tool_name"], scenario["arguments"])
    print(
        json.dumps(
            {
                "scenario": args.scenario,
                "observation": run.observation.to_dict(),
                "dispatch_count": reader.call_count,
                "trace": [event.to_dict() for event in run.trace],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
