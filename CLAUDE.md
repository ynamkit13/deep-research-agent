# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` - Start dev server on port 3001
- `npm run build` - Production build
- `npm run lint` - ESLint

## Architecture

This is a **Deep Research Agent** — a Next.js 16 App Router application that iteratively searches the web (Exa API) and reasons (OpenRouter LLM) to produce streamed markdown research reports with cited sources.

### Data Flow

1. User submits query via `POST /api/research`
2. API route creates an SSE (Server-Sent Events) stream and runs the research loop
3. **Research loop** (`src/lib/research-agent.ts`) — the core orchestrator:
   - **Plan**: LLM generates 2-4 search queries (JSON mode via OpenRouter)
   - **Search**: Queries executed in parallel via Exa `searchAndContents`
   - **Analyze**: LLM reviews sources, decides to search more or finalize (max 5 iterations)
   - **Report**: LLM streams a markdown report with inline citations
4. Each phase emits typed SSE events (`step`, `sources`, `report_chunk`, `done`, `error`)
5. Frontend parses SSE via `fetch` + `getReader()` and dispatches to a `useReducer` state machine (`idle → researching → streaming → done`)

### Key Integration Points

- **OpenRouter** (`src/lib/openrouter.ts`): Two modes — `chatCompletionJSON<T>()` for structured planning/analysis, `chatCompletionStream()` for report generation. Uses OpenAI-compatible endpoint with raw `fetch`.
- **Exa** (`src/lib/exa.ts`): `searchWeb()` wraps `exa.searchAndContents()` returning `Source[]` with titles, URLs, and snippets. Sources are deduped by URL and capped at 20.
- **Prompts** (`src/lib/prompts.ts`): Three prompt templates (PLAN, ANALYZE, REPORT) control agent behavior. Plan/Analyze prompts expect JSON output; Report prompt expects markdown.

### Frontend State

Single `"use client"` boundary in `ResearchClient` owns all state via `useReducer`. Child components (`ResearchForm`, `ResearchProgress`, `ResearchReport`, `SourceBadge`) are pure presentational.

## Environment Variables

Stored in `.env.local` (server-side only):
- `OPENROUTER_API_KEY` — OpenRouter API key
- `EXA_API_KEY` — Exa search API key
- `OPENROUTER_MODEL` — Model ID (defaults to `anthropic/claude-sonnet-4`)

## Tech Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict)
- shadcn/ui (base-nova style, neutral base color) — components in `src/components/ui/`
- Tailwind CSS 4 with oklch color system
- `react-markdown` + `remark-gfm` for report rendering
- Path alias: `@/*` → `./src/*`
