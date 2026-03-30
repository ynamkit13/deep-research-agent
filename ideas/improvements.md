# Deep Research Agent — Improvement Ideas

Findings from manual browser testing on 2026-03-31.

---

## Bugs

### 1. JSON Parsing Error (Intermittent, Critical)

The analyze phase sometimes fails with: `Failed to analyze results: SyntaxError: Unexpected token ... is not valid JSON`. The LLM wraps its JSON response in markdown code fences (` ```json ... ``` `) despite the prompt saying "respond with valid JSON only."

**Fix:** In `src/lib/openrouter.ts:35`, strip markdown code fences from the response before `JSON.parse()`:

```ts
.replace(/^```(?:json)?\s*|\s*```$/g, "").trim()
```

Alternatively, add a retry with a more forceful prompt.

### 2. Source Badges Overlap Report Content

When the report finishes and sources appear, the source badges at the bottom of the card visually overlap with the report text. The `ScrollArea` has `max-h-[600px]` but the sources are placed outside the scroll area yet inside the same `CardContent`, causing layout collision when the report is long.

**File:** `src/components/research-report.tsx`

---

## UX Improvements

### 3. No Empty Query Feedback

Submitting with an empty input silently does nothing. While the button is disabled when empty, there's no visual validation message. Consider adding a subtle shake animation or a "Please enter a research topic" hint.

### 4. No Way to Cancel In-Progress Research

Once started, the user must wait for the full loop to complete (could be 5 iterations). Add a cancel/abort button that calls `reader.cancel()` and resets state.

### 5. No Progress Indicator for Time Remaining

The progress shows "iteration 1/5" etc., but there's no estimated time or progress bar. A simple determinate progress bar based on `iteration / MAX_ITERATIONS` would help set expectations.

### 6. Report Not Auto-Scrollable During Streaming

The `ScrollArea` with `max-h-[600px]` doesn't auto-scroll as new content streams in. The user has to manually scroll to see new content.

### 7. Page Title is "Create Next App"

The browser tab still shows the default Next.js title. Update the metadata in `src/app/layout.tsx` to "Deep Research Agent."

### 8. No Dark Mode Toggle

The app supports `dark:prose-invert` but there's no way for users to toggle dark mode.

### 9. Previous Error Not Cleared Cleanly

When starting a new research, the old error banner persists briefly alongside new progress steps. The transition feels jarring.

### 10. Hardcoded HTTP-Referer (Wrong Port)

In `src/lib/openrouter.ts:8`, the referer is hardcoded to `http://localhost:3000` — should be 3001 or dynamic.

---

## Priority

| Priority | Item | Type |
|----------|------|------|
| High | Fix JSON parsing (strip code fences) | Bug |
| High | Fix source badges overlap layout | Bug |
| Quick win | Fix page title | UX |
| Quick win | Fix hardcoded referer port | Bug |
| Medium | Add cancel button | UX |
| Medium | Add auto-scroll during streaming | UX |
| Low | Add progress bar | UX |
