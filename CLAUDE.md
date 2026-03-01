# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in chat; Claude generates code using tool calls that operate on a virtual in-memory file system, with results rendered live in an iframe.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server (Turbopack) at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run Vitest tests
npm run db:reset     # Reset SQLite database to initial state
```

To run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Architecture

### State Management
Two React contexts drive the app:
- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`) — owns the `VirtualFileSystem` instance, selected file, and preview/code view toggle
- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK's `useChat` hook; bridges incoming tool calls to file system mutations

### Virtual File System
`VirtualFileSystem` (`src/lib/file-system.ts`) is a fully in-memory implementation — no disk I/O. Files are stored in a plain object tree and serialized to JSON for database persistence. All file operations (create, read, update, delete, rename) happen through this class.

### AI Integration Flow
1. User sends a message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. Server calls Claude (`claude-haiku-4-5`) via Vercel AI SDK `streamText` with two tools:
   - **`str_replace_editor`** (`src/lib/tools/str-replace.ts`) — create/view/edit files via string replacement
   - **`file_manager`** (`src/lib/tools/file-manager.ts`) — rename and delete files
3. Tool call results stream back to the client and are applied to the virtual file system
4. `PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) re-renders the iframe after each file system change

Without an `ANTHROPIC_API_KEY` in `.env`, the app falls back to a mock provider (`src/lib/provider.ts`) that returns static code.

### Live Preview
`PreviewFrame` uses `jsx-transformer.ts` (`src/lib/transform/jsx-transformer.ts`) to compile JSX → JS in the browser via Babel standalone, builds an import map, and injects the result into a sandboxed iframe.

### Persistence (Registered Users Only)
SQLite via Prisma. Schema: `User` (email, bcrypt password) → `Project` (name, messages JSON, file system JSON). Anonymous users' work is tracked client-side via `anon-work-tracker.ts` and saved upon sign-up.

### Authentication
JWT stored in httpOnly cookies (7-day expiry). `src/middleware.ts` protects `/[projectId]` routes. Server actions in `src/actions/` handle sign-up/sign-in/sign-out.

## Key Files

| File | Role |
|------|------|
| `src/app/api/chat/route.ts` | Streams Claude responses with tool use |
| `src/lib/file-system.ts` | In-memory VirtualFileSystem class |
| `src/lib/contexts/file-system-context.tsx` | File system state + UI state |
| `src/lib/contexts/chat-context.tsx` | Chat state, tool call routing |
| `src/lib/transform/jsx-transformer.ts` | Babel JSX→JS for browser preview |
| `src/lib/prompts/generation.tsx` | System prompt for component generation |
| `src/components/preview/PreviewFrame.tsx` | Live iframe preview |
| `prisma/schema.prisma` | Database schema — reference when understanding stored data structure |

## Code Style

Use comments sparingly — only for complex or non-obvious logic.

## Tech Stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4, Radix UI / Shadcn components
- Monaco Editor for code editing
- Vercel AI SDK + Anthropic Claude (`claude-haiku-4-5`)
- Prisma + SQLite
- Vitest + jsdom for testing

