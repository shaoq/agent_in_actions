"""Versioned checkpoint and safe-resume protocol for the E4 learning lab."""

from __future__ import annotations

import hashlib
import json
import os
import tempfile
from dataclasses import asdict, dataclass, field, replace
from enum import Enum
from pathlib import Path
from typing import Any


CHECKPOINT_SCHEMA_VERSION = 1


class WaitReason(str, Enum):
    APPROVAL = "approval"
    CLARIFICATION = "clarification"


class ResumeStatus(str, Enum):
    WAITING_APPROVAL = "waiting_approval"
    WAITING_CLARIFICATION = "waiting_clarification"
    COMPLETED = "completed"
    REJECTED = "rejected"
    EXPIRED = "expired"
    ALREADY_COMPLETED = "already_completed"
    FAILED = "failed"


@dataclass(frozen=True)
class TraceEvent:
    run_id: str
    step: int
    phase: str
    event_type: str
    correlation_id: str
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class Checkpoint:
    schema_version: int
    checkpoint_id: str
    run_id: str
    step: int
    wait_reason: WaitReason
    pending_action: dict[str, Any]
    pending_action_digest: str
    subject_id: str
    environment_fingerprint: str
    correlation_id: str
    expires_at: int
    consumed: bool = False
    result: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self) | {"wait_reason": self.wait_reason.value}

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> Checkpoint:
        return cls(
            schema_version=raw["schema_version"],
            checkpoint_id=raw["checkpoint_id"],
            run_id=raw["run_id"],
            step=raw["step"],
            wait_reason=WaitReason(raw["wait_reason"]),
            pending_action=dict(raw["pending_action"]),
            pending_action_digest=raw["pending_action_digest"],
            subject_id=raw["subject_id"],
            environment_fingerprint=raw["environment_fingerprint"],
            correlation_id=raw["correlation_id"],
            expires_at=raw["expires_at"],
            consumed=raw.get("consumed", False),
            result=raw.get("result"),
        )


@dataclass
class ResumeRun:
    status: ResumeStatus
    checkpoint: Checkpoint
    result: dict[str, Any] | None = None
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
                self.checkpoint.run_id,
                self.checkpoint.step,
                phase,
                event_type,
                self.checkpoint.correlation_id,
                payload or {},
            )
        )


def action_digest(action: dict[str, Any]) -> str:
    canonical = json.dumps(
        action,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


class CheckpointStore:
    """Readable JSON store using same-directory temp files and atomic replace."""

    def __init__(self, directory: str | Path) -> None:
        self.directory = Path(directory)
        self.directory.mkdir(parents=True, exist_ok=True)

    def path_for(self, checkpoint_id: str) -> Path:
        return self.directory / f"{checkpoint_id}.json"

    def save(self, checkpoint: Checkpoint) -> None:
        target = self.path_for(checkpoint.checkpoint_id)
        fd, temporary = tempfile.mkstemp(
            prefix=f".{checkpoint.checkpoint_id}.",
            suffix=".tmp",
            dir=self.directory,
        )
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(checkpoint.to_dict(), handle, ensure_ascii=False, indent=2)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary, target)
        except Exception:
            try:
                os.unlink(temporary)
            except FileNotFoundError:
                pass
            raise

    def load(self, checkpoint_id: str) -> Checkpoint:
        raw = json.loads(self.path_for(checkpoint_id).read_text(encoding="utf-8"))
        return Checkpoint.from_dict(raw)


class FakeActionExecutor:
    """A local effect probe that deduplicates by checkpoint ID."""

    def __init__(self) -> None:
        self.effect_count = 0
        self._receipts: dict[str, dict[str, Any]] = {}

    def execute(
        self, checkpoint_id: str, action: dict[str, Any]
    ) -> dict[str, Any]:
        existing = self._receipts.get(checkpoint_id)
        if existing:
            return existing
        self.effect_count += 1
        receipt = {
            "effect_id": f"resume-effect-{self.effect_count:03d}",
            "action_name": action["action_name"],
            "ticket_id": action["ticket_id"],
        }
        self._receipts[checkpoint_id] = receipt
        return receipt


def _new_checkpoint(
    *,
    wait_reason: WaitReason,
    pending_action: dict[str, Any],
    subject_id: str,
    environment_fingerprint: str,
    now: int,
    ttl: int,
    run_id: str,
    checkpoint_id: str,
) -> Checkpoint:
    return Checkpoint(
        schema_version=CHECKPOINT_SCHEMA_VERSION,
        checkpoint_id=checkpoint_id,
        run_id=run_id,
        step=1,
        wait_reason=wait_reason,
        pending_action=dict(pending_action),
        pending_action_digest=action_digest(pending_action),
        subject_id=subject_id,
        environment_fingerprint=environment_fingerprint,
        correlation_id=f"corr-{run_id}",
        expires_at=now + ttl,
    )


def pause_run(
    store: CheckpointStore,
    *,
    wait_reason: WaitReason,
    pending_action: dict[str, Any],
    subject_id: str,
    environment_fingerprint: str,
    now: int = 1_000,
    ttl: int = 300,
    run_id: str = "ticket-e4-run",
    checkpoint_id: str = "cp-ticket-e4-001",
) -> ResumeRun:
    checkpoint = _new_checkpoint(
        wait_reason=wait_reason,
        pending_action=pending_action,
        subject_id=subject_id,
        environment_fingerprint=environment_fingerprint,
        now=now,
        ttl=ttl,
        run_id=run_id,
        checkpoint_id=checkpoint_id,
    )
    status = (
        ResumeStatus.WAITING_APPROVAL
        if wait_reason is WaitReason.APPROVAL
        else ResumeStatus.WAITING_CLARIFICATION
    )
    run = ResumeRun(status, checkpoint)
    run.record("orchestrate", "run_started")
    store.save(checkpoint)
    run.record(
        "checkpoint",
        "checkpoint_saved",
        {"checkpoint_id": checkpoint.checkpoint_id},
    )
    run.record("orchestrate", "run_paused", {"reason": wait_reason.value})
    return run


def _reject(
    run: ResumeRun,
    status: ResumeStatus,
    event_type: str,
    reason: str,
) -> ResumeRun:
    run.status = status
    run.error = reason
    run.record("resume", event_type, {"reason": reason})
    return run


def resume_run(
    store: CheckpointStore,
    checkpoint_id: str,
    executor: FakeActionExecutor,
    *,
    subject_id: str,
    environment_fingerprint: str,
    response: dict[str, Any],
    expected_action: dict[str, Any] | None = None,
    authorized: bool = True,
    precondition_ok: bool = True,
    now: int = 1_100,
) -> ResumeRun:
    checkpoint = store.load(checkpoint_id)
    run = ResumeRun(ResumeStatus.FAILED, checkpoint)
    run.record("resume", "resume_requested", {"checkpoint_id": checkpoint_id})

    if checkpoint.consumed:
        run.status = ResumeStatus.ALREADY_COMPLETED
        run.result = checkpoint.result
        run.record("resume", "checkpoint_already_consumed")
        return run
    if checkpoint.schema_version != CHECKPOINT_SCHEMA_VERSION:
        return _reject(
            run,
            ResumeStatus.REJECTED,
            "checkpoint_version_rejected",
            "unsupported checkpoint schema version",
        )
    if now > checkpoint.expires_at:
        return _reject(
            run,
            ResumeStatus.EXPIRED,
            "checkpoint_expired",
            "checkpoint has expired",
        )
    if subject_id != checkpoint.subject_id:
        return _reject(
            run,
            ResumeStatus.REJECTED,
            "subject_revalidation_failed",
            "resume subject does not match checkpoint subject",
        )
    if environment_fingerprint != checkpoint.environment_fingerprint:
        return _reject(
            run,
            ResumeStatus.REJECTED,
            "environment_revalidation_failed",
            "runtime environment changed",
        )

    action = expected_action or checkpoint.pending_action
    if action_digest(action) != checkpoint.pending_action_digest:
        return _reject(
            run,
            ResumeStatus.REJECTED,
            "action_digest_mismatch",
            "pending action changed after checkpoint",
        )
    run.record("resume", "checkpoint_revalidated")

    if checkpoint.wait_reason is WaitReason.CLARIFICATION:
        answer = response.get("answer")
        if not isinstance(answer, str) or not answer.strip():
            return _reject(
                run,
                ResumeStatus.REJECTED,
                "clarification_rejected",
                "clarification answer is missing",
            )
        result = {"question_id": action["question_id"], "answer": answer}
    else:
        if response.get("approved") is not True:
            return _reject(
                run,
                ResumeStatus.REJECTED,
                "approval_rejected",
                "approval was denied or missing",
            )
        if not authorized:
            return _reject(
                run,
                ResumeStatus.REJECTED,
                "authorization_revalidation_failed",
                "subject is no longer authorized",
            )
        if not precondition_ok:
            return _reject(
                run,
                ResumeStatus.REJECTED,
                "precondition_revalidation_failed",
                "ticket state changed while waiting",
            )
        run.record("govern", "approval_and_authorization_revalidated")
        result = executor.execute(checkpoint.checkpoint_id, action)
        run.record("act", "action_executed", {"effect_id": result["effect_id"]})

    consumed = replace(checkpoint, consumed=True, result=result)
    store.save(consumed)
    run.checkpoint = consumed
    run.result = result
    run.status = ResumeStatus.COMPLETED
    run.record("checkpoint", "checkpoint_consumed")
    run.record("finish", "run_completed")
    return run
