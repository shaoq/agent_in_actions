from __future__ import annotations

import unittest

from tool_calling import (
    FakeTicketReader,
    ResultClass,
    ToolRegistry,
    ToolSpec,
    build_ticket_registry,
    execute_tool,
)


class ToolCallingTests(unittest.TestCase):
    def setUp(self) -> None:
        self.reader = FakeTicketReader()
        self.registry = build_ticket_registry(self.reader)

    def test_successful_call_follows_lifecycle(self) -> None:
        run = execute_tool(
            self.registry,
            "get_ticket",
            {"ticket_id": "T-100", "include_history": True},
        )

        self.assertEqual(ResultClass.SUCCESS, run.observation.result_class)
        self.assertEqual(1, self.reader.call_count)
        self.assertEqual(
            [
                "call_prepared",
                "input_validated",
                "tool_dispatched",
                "observation_recorded",
            ],
            [event.event_type for event in run.trace],
        )

    def test_unknown_tool_never_dispatches(self) -> None:
        run = execute_tool(
            self.registry, "delete_everything", {"ticket_id": "T-100"}
        )

        self.assertEqual(ResultClass.UNKNOWN_TOOL, run.observation.result_class)
        self.assertEqual(0, self.reader.call_count)
        self.assertEqual("tool_not_found", run.trace[-1].event_type)

    def test_schema_errors_never_dispatch(self) -> None:
        invalid_arguments = (
            {},
            {"ticket_id": 100},
            {"ticket_id": "T-100", "admin": True},
        )
        for arguments in invalid_arguments:
            with self.subTest(arguments=arguments):
                run = execute_tool(self.registry, "get_ticket", arguments)
                self.assertEqual(
                    ResultClass.VALIDATION_ERROR, run.observation.result_class
                )
                self.assertEqual("input_validation_failed", run.trace[-1].event_type)
        self.assertEqual(0, self.reader.call_count)

    def test_business_rejection_is_not_execution_error(self) -> None:
        run = execute_tool(self.registry, "get_ticket", {"ticket_id": "T-403"})

        self.assertEqual(ResultClass.BUSINESS_REJECTED, run.observation.result_class)
        self.assertEqual("business_rejected", run.trace[-1].event_type)

    def test_execution_error_is_separate(self) -> None:
        run = execute_tool(self.registry, "get_ticket", {"ticket_id": "T-500"})

        self.assertEqual(ResultClass.EXECUTION_ERROR, run.observation.result_class)
        self.assertEqual("execution_failed", run.trace[-1].event_type)

    def test_registry_rejects_duplicate_names(self) -> None:
        registry = ToolRegistry()
        spec = ToolSpec("x", "x", {"type": "object"}, lambda _: None)
        registry.register(spec)
        with self.assertRaisesRegex(ValueError, "already registered"):
            registry.register(spec)


if __name__ == "__main__":
    unittest.main()
