"""A deterministic decide-act-observe loop for learning orchestration semantics."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Protocol, Sequence


class DecisionType(str, Enum):
    ACT = "act"
    FINISH = "finish"


class RunStatus(str, Enum):
    READY = "ready"
    RUNNING = "running"
    COMPLETED = "completed"
    MAX_STEPS = "max_steps"
    FAILED = "failed"


@dataclass(frozen=True)
class Decision:
    kind: DecisionType
    action_name: str | None = None
    action_input: str | None = None
    answer: str | None = None

    @classmethod
    def act(cls, action_name: str, action_input: str) -> Decision:
        return cls(
            kind=DecisionType.ACT,
            action_name=action_name,
            action_input=action_input,
        )

    @classmethod
    def finish(cls, answer: str) -> Decision:
        return cls(kind=DecisionType.FINISH, answer=answer)


@dataclass(frozen=True)
class Observation:
    step: int
    action_name: str
    action_input: str
    output: str


@dataclass(frozen=True)
class TraceEvent:
    run_id: str
    step: int
    phase: str
    event_type: str
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "run_id": self.run_id,
            "step": self.step,
            "phase": self.phase,
            "event_type": self.event_type,
            "payload": self.payload,
        }


@dataclass
class LoopState:
    task: str
    run_id: str = "ticket-e0-run"
    max_steps: int = 4
    step: int = 0
    observations: list[Observation] = field(default_factory=list)
    status: RunStatus = RunStatus.READY
    final_answer: str | None = None
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
                step=self.step,
                phase=phase,
                event_type=event_type,
                payload=payload or {},
            )
        )


class DecisionProvider(Protocol):
    def decide(self, state: LoopState) -> object:
        """Return the next decision based on the current state."""


class ActionExecutor(Protocol):
    def execute(self, action_name: str, action_input: str) -> str:
        """Execute one controlled action and return an observation."""


class ScriptedDecisionProvider:
    """Return predefined decisions so orchestration tests stay deterministic."""

    def __init__(self, decisions: Sequence[object], *, repeat_last: bool = False):
        if not decisions:
            raise ValueError("decisions must not be empty")
        self._decisions = list(decisions)
        self._repeat_last = repeat_last
        self._index = 0

    def decide(self, state: LoopState) -> object:
        del state
        if self._index < len(self._decisions):
            decision = self._decisions[self._index]
            self._index += 1
            return decision
        if self._repeat_last:
            return self._decisions[-1]
        raise RuntimeError("scripted decisions exhausted before the loop finished")


class LocalActionExecutor:
    """A narrow action placeholder; tool schemas and permissions are out of scope."""

    def execute(self, action_name: str, action_input: str) -> str:
        if action_name == "inspect":
            return f"observed:{action_input}"
        if action_name == "fail":
            raise RuntimeError("controlled action failure")
        raise ValueError(f"unknown action: {action_name}")


def _validate_decision(decision: object) -> str | None:
    if not isinstance(decision, Decision):
        return "decision provider returned an unsupported decision object"
    if decision.kind is DecisionType.ACT:
        if not decision.action_name or decision.action_input is None:
            return "act decision requires action_name and action_input"
        return None
    if decision.kind is DecisionType.FINISH:
        if decision.answer is None:
            return "finish decision requires answer"
        return None
    return f"unknown decision type: {decision.kind!r}"


def _fail(state: LoopState, phase: str, reason: str, **payload: Any) -> LoopState:
    state.status = RunStatus.FAILED
    state.error = reason
    state.record(phase, "run_failed", {"reason": reason, **payload})
    return state


def run_agent(
    task: str,
    provider: DecisionProvider,
    executor: ActionExecutor,
    *,
    max_steps: int = 4,
    run_id: str = "ticket-e0-run",
) -> LoopState:
    """Run a bounded agent loop and return all state needed for diagnosis."""

    if max_steps < 1:
        raise ValueError("max_steps must be at least 1")

    state = LoopState(
        task=task,
        run_id=run_id,
        max_steps=max_steps,
        status=RunStatus.RUNNING,
    )
    state.record("orchestrate", "run_started", {"task": task, "max_steps": max_steps})

    while state.step < state.max_steps:
        state.step += 1
        state.record("decide", "decision_requested")

        try:
            decision = provider.decide(state)
        except Exception as exc:  # The lab converts provider failures into state.
            return _fail(state, "decide", f"decision provider failed: {exc}")

        validation_error = _validate_decision(decision)
        if validation_error:
            return _fail(state, "decide", validation_error)

        assert isinstance(decision, Decision)
        state.record("decide", "decision_made", {"kind": decision.kind.value})

        if decision.kind is DecisionType.FINISH:
            state.final_answer = decision.answer
            state.status = RunStatus.COMPLETED
            state.record("finish", "run_completed", {"answer": decision.answer})
            return state

        assert decision.action_name is not None
        assert decision.action_input is not None
        state.record(
            "act",
            "action_started",
            {"action_name": decision.action_name, "action_input": decision.action_input},
        )
        try:
            output = executor.execute(decision.action_name, decision.action_input)
        except Exception as exc:
            return _fail(
                state,
                "act",
                f"action execution failed: {exc}",
                action_name=decision.action_name,
            )

        state.observations.append(
            Observation(
                step=state.step,
                action_name=decision.action_name,
                action_input=decision.action_input,
                output=output,
            )
        )
        state.record(
            "observe",
            "observation_recorded",
            {"action_name": decision.action_name, "output": output},
        )

    state.status = RunStatus.MAX_STEPS
    state.error = f"maximum step limit reached: {state.max_steps}"
    state.record("terminate", "max_steps_reached", {"max_steps": state.max_steps})
    return state
