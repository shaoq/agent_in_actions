"""Run deterministic E3 reliable-side-effect scenarios."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from tool_reliability import (
    EffectReceipt,
    FakeTicketService,
    Subject,
    TicketAction,
    action_digest,
    idempotency_key,
    run_reliable_action,
)


SCENARIO_PATH = Path(__file__).with_name("fixtures") / "scenarios.json"


def main() -> None:
    scenarios = json.loads(SCENARIO_PATH.read_text(encoding="utf-8"))
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", choices=tuple(scenarios), default="success")
    args = parser.parse_args()
    config = scenarios[args.scenario]

    subject = Subject(config["subject_id"], frozenset(config["permissions"]))
    action = TicketAction(
        config["action_name"], config["ticket_id"], config["parameters"]
    )
    service = FakeTicketService(
        transient_failures=config.get("transient_failures", 0),
        lose_response_after_commit=config.get("lose_response_after_commit", False),
    )
    if config.get("preload_conflict"):
        key = idempotency_key("ticket-e3-run", action)
        service.ledger.commit(
            EffectReceipt(
                "effect-existing",
                key,
                "different-request-digest",
                action.ticket_id,
                {"note": "旧参数"},
            )
        )

    run = run_reliable_action(
        subject,
        action,
        service,
        max_attempts=config["max_attempts"],
    )
    print(
        json.dumps(
            {
                "scenario": args.scenario,
                "status": run.status.value,
                "idempotency_key": run.idempotency_key,
                "action_digest": run.action_digest,
                "attempts": run.attempts,
                "receipt": run.receipt.to_dict() if run.receipt else None,
                "error": run.error,
                "service_attempts": service.attempt_count,
                "effect_count": service.effect_count,
                "ledger_queries": service.ledger.query_count,
                "trace": [event.to_dict() for event in run.trace],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
