"""Deterministic structured-decision validation for the E1 learning lab."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Mapping, Protocol


class DecisionKind(str, Enum):
    ACT = "act"
    FINISH = "finish"
    CLARIFY = "clarify"


class RunStatus(str, Enum):
    ACTION_READY = "action_ready"
    COMPLETED = "completed"
    WAITING_CLARIFICATION = "waiting_clarification"
    FAILED = "failed"


@dataclass(frozen=True)
class Decision:
    kind: DecisionKind
    action_name: str | None = None
    arguments: dict[str, Any] | None = None
    answer: str | None = None
    question_id: str | None = None
    question: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self) | {"kind": self.kind.value}


@dataclass(frozen=True)
class TraceEvent:
    run_id: str
    step: int
    phase: str
    event_type: str
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class RunState:
    run_id: str
    status: RunStatus
    decision: Decision | None = None
    error: str | None = None
    trace: list[TraceEvent] = field(default_factory=list)

    def record(
        self,
        phase: str,
        event_type: str,
        payload: dict[str, Any] | None = None,
    ) -> None:
        self.trace.append(
            TraceEvent(
                run_id=self.run_id,
                step=1,
                phase=phase,
                event_type=event_type,
                payload=payload or {},
            )
        )


class ActionIntentSink(Protocol):
    def accept(self, decision: Decision) -> None:
        """Accept a validated action intent without executing the real tool."""


class RecordingActionIntentSink:
    """A probe proving invalid decisions never reach the action boundary."""

    def __init__(self) -> None:
        self.accepted: list[Decision] = []

    def accept(self, decision: Decision) -> None:
        self.accepted.append(decision)


class DecisionValidationError(ValueError):
    """Raised when untrusted model-like output violates the decision contract."""


def _require_exact_fields(
    raw: Mapping[str, Any], required: set[str], *, kind: str
) -> None:
    actual = set(raw)
    missing = sorted(required - actual)
    extra = sorted(actual - required)
    if missing:
        raise DecisionValidationError(
            f"{kind} decision is missing required fields: {', '.join(missing)}"
        )
    if extra:
        raise DecisionValidationError(
            f"{kind} decision contains unsupported fields: {', '.join(extra)}"
        )


def _require_non_empty_string(raw: Mapping[str, Any], field_name: str) -> str:
    value = raw[field_name]
    if not isinstance(value, str) or not value.strip():
        raise DecisionValidationError(f"{field_name} must be a non-empty string")
    return value


def parse_decision(raw: object) -> Decision:
    """Convert an untrusted mapping into one of three typed control decisions."""

    if not isinstance(raw, Mapping):
        raise DecisionValidationError("decision must be an object")

    raw_kind = raw.get("kind")
    if not isinstance(raw_kind, str):
        raise DecisionValidationError("kind must be a string")
    try:
        kind = DecisionKind(raw_kind)
    except ValueError as exc:
        raise DecisionValidationError(f"unsupported decision kind: {raw_kind}") from exc

    if kind is DecisionKind.ACT:
        _require_exact_fields(raw, {"kind", "action_name", "arguments"}, kind=raw_kind)
        action_name = _require_non_empty_string(raw, "action_name")
        arguments = raw["arguments"]
        if not isinstance(arguments, dict):
            raise DecisionValidationError("arguments must be an object")
        return Decision(kind=kind, action_name=action_name, arguments=dict(arguments))

    if kind is DecisionKind.FINISH:
        _require_exact_fields(raw, {"kind", "answer"}, kind=raw_kind)
        return Decision(kind=kind, answer=_require_non_empty_string(raw, "answer"))

    _require_exact_fields(raw, {"kind", "question_id", "question"}, kind=raw_kind)
    return Decision(
        kind=kind,
        question_id=_require_non_empty_string(raw, "question_id"),
        question=_require_non_empty_string(raw, "question"),
    )


def evaluate_decision(
    raw: object,
    sink: ActionIntentSink,
    *,
    run_id: str = "ticket-e1-run",
) -> RunState:
    """Validate one decision and expose the resulting orchestration branch."""

    state = RunState(run_id=run_id, status=RunStatus.FAILED)
    state.record("orchestrate", "run_started")
    state.record("decide", "decision_received")
    try:
        decision = parse_decision(raw)
    except DecisionValidationError as exc:
        state.error = str(exc)
        state.record(
            "decide",
            "decision_validation_failed",
            {"reason": state.error},
        )
        return state

    state.decision = decision
    state.record("decide", "decision_validated", {"kind": decision.kind.value})

    if decision.kind is DecisionKind.ACT:
        sink.accept(decision)
        state.status = RunStatus.ACTION_READY
        state.record("orchestrate", "action_ready", {"action_name": decision.action_name})
    elif decision.kind is DecisionKind.FINISH:
        state.status = RunStatus.COMPLETED
        state.record("finish", "run_completed")
    else:
        state.status = RunStatus.WAITING_CLARIFICATION
        state.record(
            "clarify",
            "clarification_requested",
            {"question_id": decision.question_id},
        )
    return state
