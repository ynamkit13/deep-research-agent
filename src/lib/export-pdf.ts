export function exportAsPdf(element: HTMLElement, filename: string) {
  const clone = element.cloneNode(true) as HTMLElement;

  // Strip any classes and apply clean inline styles
  clone.removeAttribute("class");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export as PDF.");
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a2e;
      background: #fff;
      padding: 48px 56px;
      line-height: 1.8;
      font-size: 15px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { font-size: 1.5rem; font-weight: 700; margin-top: 2em; margin-bottom: 0.6em; padding-bottom: 0.4em; border-bottom: 1px solid #e0e0e0; }
    h1:first-child { margin-top: 0; }
    h2 { font-size: 1.25rem; font-weight: 700; margin-top: 1.8em; margin-bottom: 0.5em; }
    h3 { font-size: 1.1rem; font-weight: 600; margin-top: 1.4em; margin-bottom: 0.4em; }
    h4 { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #8b6914; margin-top: 1.4em; margin-bottom: 0.4em; }
    p { margin-bottom: 1em; }
    a { color: inherit; text-decoration: none; pointer-events: none; }
    strong { font-weight: 600; color: #1a1a2e; }
    em { font-style: italic; }
    ul, ol { padding-left: 1.5em; margin-bottom: 1em; }
    li { margin-bottom: 0.3em; line-height: 1.7; }
    li::marker { color: #8b6914; }
    blockquote { border-left: 3px solid #8b6914; background: #f8f7f4; border-radius: 0 6px 6px 0; padding: 0.75em 1.25em; margin: 1.2em 0; font-style: italic; color: #555; }
    code { background: #f0f0f0; padding: 0.15em 0.4em; border-radius: 3px; font-size: 0.85em; color: #8b6914; font-family: 'SF Mono', Consolas, monospace; }
    pre { background: #f8f7f4; border: 1px solid #e8e8e8; border-radius: 6px; padding: 1em; overflow-x: auto; font-size: 0.85em; line-height: 1.6; margin: 1.2em 0; }
    pre code { background: transparent; padding: 0; color: #333; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; margin: 1.2em 0; }
    thead { border-bottom: 2px solid #e0e0e0; }
    th { font-weight: 600; text-align: left; padding: 0.5em 0.75em; background: #f5f5f5; }
    td { padding: 0.5em 0.75em; border-bottom: 1px solid #eee; }
    tr:nth-child(even) { background: #fafafa; }
    hr { border: none; height: 1px; background: #e0e0e0; margin: 2em 0; }
    @media print {
      body { padding: 0; }
      @page { margin: 2cm; }
    }
  </style>
</head>
<body>
  ${clone.innerHTML}
</body>
</html>`);
  printWindow.document.close();

  // Wait for content to render, then trigger print once
  let printed = false;
  function triggerPrint() {
    if (printed) return;
    printed = true;
    printWindow.print();
  }
  printWindow.onload = triggerPrint;
  setTimeout(triggerPrint, 600);
}
