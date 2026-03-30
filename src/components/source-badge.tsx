import { Source } from "@/types/research";

export function SourceBadge({ source, index }: { source: Source; index: number }) {
  const domain = new URL(source.url).hostname.replace("www.", "");

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="source-card group flex items-start gap-3 rounded-xl border border-border bg-card/40 px-3.5 py-3 no-underline"
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-[11px] font-semibold text-muted-foreground tabular-nums shrink-0 mt-0.5">
        {index}
      </span>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground/90 truncate leading-snug group-hover:text-amber transition-colors">
          {source.title || domain}
        </p>
        <div className="flex items-center gap-1.5">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt=""
            width={12}
            height={12}
            className="rounded-sm opacity-60"
          />
          <span className="text-xs text-muted-foreground truncate">{domain}</span>
        </div>
      </div>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground/40 group-hover:text-amber/60 transition-colors shrink-0 mt-1"
      >
        <path d="M7 17L17 7" />
        <path d="M7 7h10v10" />
      </svg>
    </a>
  );
}
