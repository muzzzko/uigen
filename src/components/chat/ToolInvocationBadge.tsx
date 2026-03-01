"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

function getLabel(toolInvocation: ToolInvocation): string {
  const { toolName, state } = toolInvocation;
  const args = toolInvocation.args as Record<string, unknown>;
  const isDone = state === "result";

  const path = typeof args?.path === "string" ? args.path : undefined;
  const command = typeof args?.command === "string" ? args.command : undefined;
  const fileName = path ? getFileName(path) : undefined;

  if (toolName === "str_replace_editor") {
    if (!fileName) return isDone ? "File updated" : "Updating file...";
    switch (command) {
      case "create":    return isDone ? `Created ${fileName}` : `Creating ${fileName}...`;
      case "str_replace":
      case "insert":    return isDone ? `Edited ${fileName}` : `Editing ${fileName}...`;
      case "view":      return isDone ? `Read ${fileName}` : `Reading ${fileName}...`;
      case "undo_edit": return isDone ? `Undid edit in ${fileName}` : `Undoing edit in ${fileName}...`;
      default:          return isDone ? `Updated ${fileName}` : `Updating ${fileName}...`;
    }
  }

  if (toolName === "file_manager") {
    if (!fileName) return isDone ? "File processed" : "Processing file...";
    switch (command) {
      case "rename": return isDone ? `Renamed ${fileName}` : `Renaming ${fileName}...`;
      case "delete": return isDone ? `Deleted ${fileName}` : `Deleting ${fileName}...`;
      default:       return isDone ? `Processed ${fileName}` : `Processing ${fileName}...`;
    }
  }

  return isDone ? toolName : `${toolName}...`;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const isDone = toolInvocation.state === "result";
  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{getLabel(toolInvocation)}</span>
    </div>
  );
}
