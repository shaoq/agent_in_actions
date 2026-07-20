"""Reliable side-effect controls for the deterministic E3 learning lab."""

from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any


class RunStatus(str, Enum):
    COMPLETED = "completed"
    WAITING_APPROVAL = "waiting_approval"
    DENIED = "denied"
    RETRY_EXHAUSTED = "retry_exhausted"
    UNKNOWN_OUTCOME = "unknown_outcome"
    CONFLICT = "conflict"
    FAILED = "failed"


class RiskLevel(str, Enum):
    CONTROLLED_WRITE = "controlled_write"
    HIGH = "high"


class TransientBeforeDispatch(RuntimeError):
    pass


class UnknownOutcome(RuntimeError):
    pass


class BusinessConflict(RuntimeError):
    pass


class IdempotencyConflict(RuntimeError):
    pass


@dataclass(frozen=True)
class Subject:
    subject_id: str
    permissions: frozenset[str]


@dataclass(frozen=True)
class TicketAction:
    action_name: str
    ticket_id: str
    parameters: dict[str, Any]


@dataclass(frozen=True)
class Approval:
    subject_id: str
    action_digest: str
    approved: bool


@dataclass(frozen=True)
class EffectReceipt:
    effect_id: str
    idempotency_key: str
    request_digest: str
    ticket_id: str
    result: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


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
class ReliableRun:
    run_id: str
    status: RunStatus
    idempotency_key: str
    action_digest: str
    attempts: int = 0
    receipt: EffectReceipt | None = None
    error: str | None = None
    trace: list[TraceEvent] = field(default_factory=list)

    def record(
        self,
        phase: str,
        event_type: str,
        payload: dict[str, Any] | None = None,
    ) -> None:
        self.trace.append(
            TraceEvent(self.run_id, 1, phase, event_type, payload or {})
        )


def action_digest(subject: Subject, action: TicketAction) -> str:
    canonical = json.dumps(
        {
            "subject_id": subject.subject_id,
            "action_name": action.action_name,
            "ticket_id": action.ticket_id,
            "parameters": action.parameters,
        },
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def idempotency_key(run_id: str, action: TicketAction) -> str:
    logical = f"{run_id}:1:{action.action_name}:{action.ticket_id}"
    return "idem-" + hashlib.sha256(logical.encode("utf-8")).hexdigest()[:16]


class EffectLedger:
    def __init__(self) -> None:
        self._records: dict[str, EffectReceipt] = {}
        self.query_count = 0

    def lookup(
        self, key: str, request_digest: str, *, count_query: bool = False
    ) -> EffectReceipt | None:
        if count_query:
            self.query_count += 1
        receipt = self._records.get(key)
        if receipt and receipt.request_digest != request_digest:
            raise IdempotencyConflict("same idempotency key was used with different parameters")
        return receipt

    def commit(self, receipt: EffectReceipt) -> None:
        existing = self._records.get(receipt.idempotency_key)
        if existing and existing.request_digest != receipt.request_digest:
            raise IdempotencyConflict("cannot overwrite an idempotency record")
        self._records[receipt.idempotency_key] = receipt


class FakeTicketService:
    """Scriptable ticket service with a queryable effect ledger."""

    def __init__(
        self,
        *,
        transient_failures: int = 0,
        lose_response_after_commit: bool = False,
        force_business_conflict: bool = False,
    ) -> None:
        self.ledger = EffectLedger()
        self.transient_failures = transient_failures
        self.lose_response_after_commit = lose_response_after_commit
        self.force_business_conflict = force_business_conflict
        self.attempt_count = 0
        self.effect_count = 0
        self._lost_once = False

    def apply(
        self,
        action: TicketAction,
        *,
        key: str,
        request_digest: str,
    ) -> EffectReceipt:
        self.attempt_count += 1
        existing = self.ledger.lookup(key, request_digest)
        if existing:
            return existing
        if self.transient_failures > 0:
            self.transient_failures -= 1
            raise TransientBeforeDispatch("connection unavailable before dispatch")
        if self.force_business_conflict:
            raise BusinessConflict("ticket version changed")

        self.effect_count += 1
        receipt = EffectReceipt(
            effect_id=f"effect-{self.effect_count:03d}",
            idempotency_key=key,
            request_digest=request_digest,
            ticket_id=action.ticket_id,
            result={"action_name": action.action_name, **action.parameters},
        )
        self.ledger.commit(receipt)
        if self.lose_response_after_commit and not self._lost_once:
            self._lost_once = True
            raise UnknownOutcome("response was lost after dispatch")
        return receipt


def classify_risk(action: TicketAction) -> RiskLevel:
    if action.action_name == "update_priority":
        return RiskLevel.HIGH
    return RiskLevel.CONTROLLED_WRITE


def run_reliable_action(
    subject: Subject,
    action: TicketAction,
    service: FakeTicketService,
    *,
    approval: Approval | None = None,
    max_attempts: int = 2,
    run_id: str = "ticket-e3-run",
) -> ReliableRun:
    if max_attempts < 1:
        raise ValueError("max_attempts must be at least 1")

    digest = action_digest(subject, action)
    key = idempotency_key(run_id, action)
    risk = classify_risk(action)
    run = ReliableRun(run_id, RunStatus.FAILED, key, digest)
    run.record(
        "govern",
        "authorization_requested",
        {"subject_id": subject.subject_id, "risk_level": risk.value},
    )

    if "ticket:update" not in subject.permissions:
        run.status = RunStatus.DENIED
        run.error = "subject lacks ticket:update permission"
        run.record("govern", "authorization_denied")
        return run
    run.record("govern", "authorization_allowed")

    if risk is RiskLevel.HIGH:
        if approval is None:
            run.status = RunStatus.WAITING_APPROVAL
            run.record(
                "govern",
                "approval_required",
                {"subject_id": subject.subject_id, "action_digest": digest},
            )
            return run
        if (
            not approval.approved
            or approval.subject_id != subject.subject_id
            or approval.action_digest != digest
        ):
            run.status = RunStatus.DENIED
            run.error = "approval is denied or does not match the pending action"
            run.record("govern", "approval_rejected")
            return run
        run.record("govern", "approval_validated", {"action_digest": digest})

    for attempt in range(1, max_attempts + 1):
        run.attempts = attempt
        run.record(
            "dispatch",
            "action_attempted",
            {"attempt": attempt, "idempotency_key": key},
        )
        try:
            receipt = service.apply(action, key=key, request_digest=digest)
        except TransientBeforeDispatch as exc:
            run.record(
                "observe",
                "transient_before_dispatch",
                {"attempt": attempt, "reason": str(exc)},
            )
            if attempt == max_attempts:
                run.status = RunStatus.RETRY_EXHAUSTED
                run.error = str(exc)
                run.record("terminate", "retry_budget_exhausted")
                return run
            run.record("orchestrate", "retry_scheduled", {"next_attempt": attempt + 1})
        except UnknownOutcome as exc:
            run.status = RunStatus.UNKNOWN_OUTCOME
            run.error = str(exc)
            run.record("observe", "unknown_outcome_detected", {"reason": str(exc)})
            try:
                receipt = service.ledger.lookup(key, digest, count_query=True)
            except IdempotencyConflict as conflict:
                run.status = RunStatus.CONFLICT
                run.error = str(conflict)
                run.record("reconcile", "idempotency_conflict")
                return run
            run.record(
                "reconcile",
                "effect_status_queried",
                {"found": receipt is not None},
            )
            if receipt is None:
                return run
            run.receipt = receipt
            run.status = RunStatus.COMPLETED
            run.error = None
            run.record("reconcile", "effect_reconciled", {"effect_id": receipt.effect_id})
            return run
        except IdempotencyConflict as exc:
            run.status = RunStatus.CONFLICT
            run.error = str(exc)
            run.record("observe", "idempotency_conflict")
            return run
        except BusinessConflict as exc:
            run.status = RunStatus.CONFLICT
            run.error = str(exc)
            run.record("observe", "business_conflict")
            return run
        else:
            run.receipt = receipt
            run.status = RunStatus.COMPLETED
            run.record("observe", "effect_receipt_recorded", {"effect_id": receipt.effect_id})
            return run

    raise AssertionError("retry loop must return")
