"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ResearchFormProps {
  onSubmit: (query: string) => void;
  onCancel: () => void;
  disabled: boolean;
}

export function ResearchForm({ onSubmit, onCancel, disabled }: ResearchFormProps) {
  const [query, setQuery] = useState("");
  const [showHint, setShowHint] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      setShowHint(true);
      return;
    }
    setShowHint(false);
    onSubmit(query.trim());
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="research-input rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-2 flex items-center gap-2 transition-all duration-300">
        <div className="flex-1 flex items-center gap-3 pl-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-dim shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="What would you like to research?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) setShowHint(false);
            }}
            disabled={disabled}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base py-2.5 outline-none disabled:opacity-50"
          />
        </div>
        {disabled ? (
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={onCancel}
            className="rounded-xl px-5 font-medium"
          >
            Cancel
          </Button>
        ) : (
          <Button
            type="submit"
            size="lg"
            className="rounded-xl px-5 font-medium bg-amber text-background hover:bg-amber/90 border-0"
          >
            Research
          </Button>
        )}
      </form>
      {showHint && (
        <p className="text-sm text-destructive pl-4">Please enter a research topic.</p>
      )}
    </div>
  );
}
