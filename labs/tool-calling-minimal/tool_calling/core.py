"""A deterministic tool-contract and lifecycle implementation for the E2 lab."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Callable, Mapping


class ResultClass(str, Enum):
    SUCCESS = "success"
    UNKNOWN_TOOL = "unknown_tool"
    VALIDATION_ERROR = "validation_error"
    BUSINESS_REJECTED = "business_rejected"
    EXECUTION_ERROR = "execution_error"


class SchemaValidationError(ValueError):
    pass


class ToolBusinessRejection(RuntimeError):
    pass


@dataclass(frozen=True)
class ToolSpec:
    name: str
    description: str
    input_schema: dict[str, Any]
    handler: Callable[[dict[str, Any]], Any]
    risk: str = "read_only"


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, ToolSpec] = {}

    def register(self, spec: ToolSpec) -> None:
        if spec.name in self._tools:
            raise ValueError(f"tool already registered: {spec.name}")
        self._tools[spec.name] = spec

    def get(self, name: str) -> ToolSpec | None:
        return self._tools.get(name)

    def list_specs(self) -> tuple[ToolSpec, ...]:
        return tuple(self._tools[name] for name in sorted(self._tools))


@dataclass(frozen=True)
class TraceEvent:
    run_id: str
    step: int
    phase: str
    event_type: str
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class Observation:
    call_id: str
    tool_name: str
    result_class: ResultClass
    output: Any = None
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self) | {"result_class": self.result_class.value}


@dataclass(frozen=True)
class ToolRun:
    observation: Observation
    trace: tuple[TraceEvent, ...]


def _matches_type(value: Any, expected: str) -> bool:
    if expected == "string":
        return isinstance(value, str)
    if expected == "integer":
        return type(value) is int
    if expected == "boolean":
        return type(value) is bool
    if expected == "object":
        return isinstance(value, Mapping)
    raise SchemaValidationError(f"unsupported teaching schema type: {expected}")


def validate_input(schema: Mapping[str, Any], arguments: object) -> dict[str, Any]:
    """Validate the small JSON-Schema subset used by this teaching lab."""

    if schema.get("type") != "object":
        raise SchemaValidationError("root schema type must be object")
    if not isinstance(arguments, Mapping):
        raise SchemaValidationError("tool arguments must be an object")

    properties = schema.get("properties", {})
    required = schema.get("required", [])
    if not isinstance(properties, Mapping) or not isinstance(required, list):
        raise SchemaValidationError("schema properties or required is invalid")

    missing = sorted(name for name in required if name not in arguments)
    if missing:
        raise SchemaValidationError(
            f"missing required fields: {', '.join(str(name) for name in missing)}"
        )

    if schema.get("additionalProperties") is False:
        extras = sorted(set(arguments) - set(properties))
        if extras:
            raise SchemaValidationError(
                f"unsupported fields: {', '.join(str(name) for name in extras)}"
            )

    normalized = dict(arguments)
    for name, value in normalized.items():
        property_schema = properties.get(name)
        if property_schema is None:
            continue
        expected = property_schema.get("type")
        if not isinstance(expected, str) or not _matches_type(value, expected):
            raise SchemaValidationError(f"field {name} must be {expected}")
        if expected == "string" and not value.strip():
            raise SchemaValidationError(f"field {name} must not be empty")
    return normalized


def execute_tool(
    registry: ToolRegistry,
    tool_name: str,
    arguments: object,
    *,
    run_id: str = "ticket-e2-run",
    call_id: str = "call-e2-001",
) -> ToolRun:
    trace: list[TraceEvent] = []

    def record(phase: str, event_type: str, payload: dict[str, Any] | None = None) -> None:
        trace.append(TraceEvent(run_id, 1, phase, event_type, payload or {}))

    record("prepare", "call_prepared", {"call_id": call_id, "tool_name": tool_name})
    spec = registry.get(tool_name)
    if spec is None:
        observation = Observation(
            call_id, tool_name, ResultClass.UNKNOWN_TOOL, error="tool is not registered"
        )
        record("prepare", "tool_not_found", {"call_id": call_id})
        return ToolRun(observation, tuple(trace))

    try:
        normalized = validate_input(spec.input_schema, arguments)
    except SchemaValidationError as exc:
        observation = Observation(
            call_id,
            tool_name,
            ResultClass.VALIDATION_ERROR,
            error=str(exc),
        )
        record(
            "validate",
            "input_validation_failed",
            {"call_id": call_id, "reason": str(exc)},
        )
        return ToolRun(observation, tuple(trace))

    record("validate", "input_validated", {"call_id": call_id})
    record("dispatch", "tool_dispatched", {"call_id": call_id})
    try:
        output = spec.handler(normalized)
    except ToolBusinessRejection as exc:
        observation = Observation(
            call_id,
            tool_name,
            ResultClass.BUSINESS_REJECTED,
            error=str(exc),
        )
        record("observe", "business_rejected", {"call_id": call_id})
    except Exception as exc:
        observation = Observation(
            call_id,
            tool_name,
            ResultClass.EXECUTION_ERROR,
            error=f"tool execution failed: {exc}",
        )
        record("observe", "execution_failed", {"call_id": call_id})
    else:
        observation = Observation(
            call_id, tool_name, ResultClass.SUCCESS, output=output
        )
        record("observe", "observation_recorded", {"call_id": call_id})
    return ToolRun(observation, tuple(trace))


class FakeTicketReader:
    """A local read-only tool with deterministic business and execution failures."""

    def __init__(self) -> None:
        self.call_count = 0
        self._tickets = {
            "T-100": {"ticket_id": "T-100", "status": "in_progress", "priority": 2},
            "T-200": {"ticket_id": "T-200", "status": "waiting_user", "priority": 1},
        }

    def get_ticket(self, arguments: dict[str, Any]) -> dict[str, Any]:
        self.call_count += 1
        ticket_id = arguments["ticket_id"]
        if ticket_id == "T-403":
            raise ToolBusinessRejection("ticket is outside the subject scope")
        if ticket_id == "T-500":
            raise RuntimeError("ticket store is unavailable")
        ticket = self._tickets.get(ticket_id)
        if ticket is None:
            raise ToolBusinessRejection("ticket does not exist")
        result = dict(ticket)
        if arguments.get("include_history"):
            result["history"] = ["created", "assigned"]
        return result


def build_ticket_registry(reader: FakeTicketReader) -> ToolRegistry:
    registry = ToolRegistry()
    registry.register(
        ToolSpec(
            name="get_ticket",
            description="Read one ticket visible to the current subject.",
            risk="read_only",
            input_schema={
                "type": "object",
                "properties": {
                    "ticket_id": {"type": "string"},
                    "include_history": {"type": "boolean"},
                },
                "required": ["ticket_id"],
                "additionalProperties": False,
            },
            handler=reader.get_ticket,
        )
    )
    return registry
