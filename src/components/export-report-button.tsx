"use client";

import { useState } from "react";
import { Download, FileText, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Source } from "@/types/research";

interface ExportReportButtonProps {
  reportRef: React.RefObject<HTMLElement | null>;
  reportMarkdown: string;
  sources: Source[];
}

export function ExportReportButton({
  reportRef,
  reportMarkdown,
  sources,
}: ExportReportButtonProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  async function handlePdf() {
    if (!reportRef.current || exporting) return;
    try {
      const { exportAsPdf } = await import("@/lib/export-pdf");
      exportAsPdf(reportRef.current, "research-report");
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Check the console for details.");
    }
  }

  async function handleDocx() {
    if (exporting) return;
    setExporting("docx");
    try {
      const { exportAsDocx } = await import("@/lib/export-docx");
      await exportAsDocx(reportMarkdown, sources, "research-report", "light");
    } catch (err) {
      console.error("DOCX export failed:", err);
      alert("DOCX export failed. Check the console for details.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        disabled={exporting !== null}
        onClick={handlePdf}
        className="gap-1.5 text-xs"
      >
        <FileText className="size-3.5" />
        {exporting === "pdf" ? "Exporting\u2026" : "PDF"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={exporting !== null}
        onClick={handleDocx}
        className="gap-1.5 text-xs"
      >
        <FileIcon className="size-3.5" />
        {exporting === "docx" ? "Exporting\u2026" : "DOCX"}
      </Button>
    </div>
  );
}
