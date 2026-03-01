import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result",
  result?: unknown
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "1", toolName, args, state, result } as ToolInvocation;
  }
  return { toolCallId: "1", toolName, args, state } as ToolInvocation;
}

// str_replace_editor — create
test("shows 'Creating <file>...' for str_replace_editor create in-progress", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/Card.tsx" }, "call")}
    />
  );
  expect(screen.getByText("Creating Card.tsx...")).toBeDefined();
});

test("shows 'Created <file>' for str_replace_editor create done", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/Card.tsx" }, "result", "ok")}
    />
  );
  expect(screen.getByText("Created Card.tsx")).toBeDefined();
});

// str_replace_editor — str_replace
test("shows 'Editing <file>...' for str_replace_editor str_replace in-progress", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "src/Button.tsx" }, "call")}
    />
  );
  expect(screen.getByText("Editing Button.tsx...")).toBeDefined();
});

test("shows 'Edited <file>' for str_replace_editor str_replace done", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "src/Button.tsx" }, "result", "ok")}
    />
  );
  expect(screen.getByText("Edited Button.tsx")).toBeDefined();
});

// str_replace_editor — insert (same label as str_replace)
test("shows 'Edited <file>' for str_replace_editor insert done", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "src/Button.tsx" }, "result", "ok")}
    />
  );
  expect(screen.getByText("Edited Button.tsx")).toBeDefined();
});

// str_replace_editor — view
test("shows 'Reading <file>...' for str_replace_editor view in-progress", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "src/App.tsx" }, "call")}
    />
  );
  expect(screen.getByText("Reading App.tsx...")).toBeDefined();
});

test("shows 'Read <file>' for str_replace_editor view done", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "src/App.tsx" }, "result", "ok")}
    />
  );
  expect(screen.getByText("Read App.tsx")).toBeDefined();
});

// str_replace_editor — undo_edit
test("shows 'Undid edit in <file>' for str_replace_editor undo_edit done", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "src/App.tsx" }, "result", "ok")}
    />
  );
  expect(screen.getByText("Undid edit in App.tsx")).toBeDefined();
});

// str_replace_editor — no path yet (partial streaming)
test("shows generic 'Updating file...' for str_replace_editor with no path", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", {}, "call")}
    />
  );
  expect(screen.getByText("Updating file...")).toBeDefined();
});

// file_manager — rename
test("shows 'Renaming <file>...' for file_manager rename in-progress", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("file_manager", { command: "rename", path: "src/OldName.tsx" }, "call")}
    />
  );
  expect(screen.getByText("Renaming OldName.tsx...")).toBeDefined();
});

test("shows 'Renamed <file>' for file_manager rename done", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("file_manager", { command: "rename", path: "src/OldName.tsx" }, "result", "ok")}
    />
  );
  expect(screen.getByText("Renamed OldName.tsx")).toBeDefined();
});

// file_manager — delete
test("shows 'Deleted <file>' for file_manager delete done", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("file_manager", { command: "delete", path: "src/OldName.tsx" }, "result", "ok")}
    />
  );
  expect(screen.getByText("Deleted OldName.tsx")).toBeDefined();
});

// Unknown tool
test("shows 'some_tool...' for unknown tool in-progress", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("some_tool", {}, "call")}
    />
  );
  expect(screen.getByText("some_tool...")).toBeDefined();
});

test("shows tool name for unknown tool done", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("some_tool", {}, "result", "ok")}
    />
  );
  expect(screen.getByText("some_tool")).toBeDefined();
});

// Spinner vs green dot
test("shows spinner when in-progress", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/Card.tsx" }, "call")}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeTruthy();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when done", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/Card.tsx" }, "result", "ok")}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
