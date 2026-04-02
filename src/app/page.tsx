import { ResearchClient } from "@/components/research-client";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero section */}
      <header className="relative overflow-hidden border-b border-border/50 px-4 pt-16 pb-12">
        <div className="hero-glow" />
        <div className="relative z-10 mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber/20 bg-amber-glow px-3 py-1 text-xs tracking-wide text-amber-dim uppercase">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber" />
            AI-Powered Research
          </div>
          <h1 className="font-heading text-5xl md:text-6xl tracking-tight text-gradient leading-[1.1]">
            Deep Research Agent
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Enter a topic and the agent will iteratively search the web,
            synthesize findings, and compile a comprehensive report with cited sources.
          </p>
        </div>
      </header>

      {/* Research area */}
      <div className="flex-1">
        <ResearchClient />
      </div>
    </main>
  );
}
