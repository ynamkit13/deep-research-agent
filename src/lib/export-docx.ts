import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ExternalHyperlink,
  BorderStyle,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Source } from "@/types/research";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MdNode = any;

interface DocxTheme {
  headingColor: string;
  bodyColor: string;
  accentColor: string;
  bgShading: string;
  codeBg: string;
}

const LIGHT_THEME: DocxTheme = {
  headingColor: "1a1a2e",
  bodyColor: "333344",
  accentColor: "8b6914",
  bgShading: "f5f5f0",
  codeBg: "f0f0f0",
};

const DARK_THEME: DocxTheme = {
  headingColor: "e8e0d0",
  bodyColor: "c0b8a8",
  accentColor: "d4a844",
  bgShading: "22223a",
  codeBg: "2a2a42",
};

function getHeadingLevel(depth: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
  switch (depth) {
    case 1: return HeadingLevel.HEADING_1;
    case 2: return HeadingLevel.HEADING_2;
    case 3: return HeadingLevel.HEADING_3;
    case 4: return HeadingLevel.HEADING_4;
    default: return HeadingLevel.HEADING_5;
  }
}

function extractTextRuns(node: MdNode, theme: DocxTheme, opts: { bold?: boolean; italic?: boolean } = {}): TextRun[] {
  const runs: TextRun[] = [];

  if (node.type === "text") {
    runs.push(new TextRun({
      text: node.value,
      bold: opts.bold,
      italics: opts.italic,
      color: theme.bodyColor,
      font: "Calibri",
      size: 22,
    }));
  } else if (node.type === "strong") {
    for (const child of node.children) {
      runs.push(...extractTextRuns(child, theme, { ...opts, bold: true }));
    }
  } else if (node.type === "emphasis") {
    for (const child of node.children) {
      runs.push(...extractTextRuns(child, theme, { ...opts, italic: true }));
    }
  } else if (node.type === "inlineCode") {
    runs.push(new TextRun({
      text: node.value,
      font: "Consolas",
      size: 20,
      color: theme.accentColor,
      shading: { type: ShadingType.SOLID, color: theme.codeBg, fill: theme.codeBg },
    }));
  } else if (node.type === "link") {
    const linkText = node.children?.map((c: MdNode) => c.value || "").join("") || node.url;
    runs.push(new TextRun({
      text: linkText,
      color: theme.bodyColor,
      font: "Calibri",
      size: 22,
    }));
  } else if (node.children) {
    for (const child of node.children) {
      runs.push(...extractTextRuns(child, theme, opts));
    }
  }

  return runs;
}

function convertNodes(nodes: MdNode[], theme: DocxTheme): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case "heading":
        elements.push(new Paragraph({
          heading: getHeadingLevel(node.depth),
          children: extractTextRuns(node, { ...theme, bodyColor: theme.headingColor }, {}),
          spacing: { before: 300, after: 120 },
        }));
        break;

      case "paragraph":
        elements.push(new Paragraph({
          children: extractTextRuns(node, theme),
          spacing: { after: 200, line: 360 },
        }));
        break;

      case "blockquote": {
        const bqChildren = node.children?.flatMap((c: MdNode) =>
          c.type === "paragraph" ? extractTextRuns(c, theme, { italic: true }) : []
        ) || [];
        elements.push(new Paragraph({
          children: bqChildren,
          indent: { left: 720 },
          spacing: { before: 200, after: 200, line: 340 },
          border: { left: { style: BorderStyle.SINGLE, size: 6, color: theme.accentColor } },
        }));
        break;
      }

      case "list":
        for (const [idx, item] of (node.children || []).entries()) {
          const itemRuns = item.children?.flatMap((c: MdNode) =>
            c.type === "paragraph" ? extractTextRuns(c, theme) : []
          ) || [];
          const bullet = node.ordered ? `${idx + 1}. ` : "\u2022 ";
          elements.push(new Paragraph({
            children: [
              new TextRun({ text: bullet, color: theme.accentColor, font: "Calibri", size: 22 }),
              ...itemRuns,
            ],
            indent: { left: 720 },
            spacing: { after: 80, line: 340 },
          }));
        }
        break;

      case "code": {
        const lines = (node.value || "").split("\n");
        for (const line of lines) {
          elements.push(new Paragraph({
            children: [new TextRun({ text: line || " ", font: "Consolas", size: 18, color: theme.bodyColor })],
            shading: { type: ShadingType.SOLID, color: theme.codeBg, fill: theme.codeBg },
            spacing: { line: 280 },
            indent: { left: 360 },
          }));
        }
        elements.push(new Paragraph({ spacing: { after: 200 } }));
        break;
      }

      case "table": {
        const rows = (node.children || []).map((row: MdNode, rowIdx: number) => {
          const cells = (row.children || []).map((cell: MdNode) => {
            const runs = cell.children?.flatMap((c: MdNode) => extractTextRuns(c, theme)) || [];
            return new TableCell({
              children: [new Paragraph({ children: runs })],
              shading: rowIdx === 0
                ? { type: ShadingType.SOLID, color: theme.codeBg, fill: theme.codeBg }
                : rowIdx % 2 === 0
                  ? { type: ShadingType.SOLID, color: theme.bgShading, fill: theme.bgShading }
                  : undefined,
            });
          });
          return new TableRow({ children: cells });
        });
        if (rows.length > 0) {
          elements.push(new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }));
          elements.push(new Paragraph({ spacing: { after: 200 } }));
        }
        break;
      }

      case "thematicBreak":
        elements.push(new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: theme.accentColor } },
          spacing: { before: 300, after: 300 },
        }));
        break;

      default:
        if (node.children) {
          elements.push(...convertNodes(node.children, theme));
        }
        break;
    }
  }

  return elements;
}

export async function exportAsDocx(
  markdown: string,
  sources: Source[],
  filename: string,
  theme: "dark" | "light"
) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const docxTheme = theme === "dark" ? DARK_THEME : LIGHT_THEME;

  const children = convertNodes(tree.children as MdNode[], docxTheme);

  // Sources section
  if (sources.length > 0) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: "Sources", color: docxTheme.headingColor, font: "Calibri" })],
      spacing: { before: 400, after: 200 },
    }));

    for (const [i, source] of sources.entries()) {
      const domain = new URL(source.url).hostname.replace("www.", "");
      children.push(new Paragraph({
        children: [
          new TextRun({
            text: `[${i + 1}] ${source.title || domain}`,
            bold: true,
            color: docxTheme.bodyColor,
            font: "Calibri",
            size: 22,
          }),
          new TextRun({ text: " \u2014 ", color: docxTheme.bodyColor, font: "Calibri", size: 22 }),
          new TextRun({
            text: source.url,
            color: docxTheme.accentColor,
            underline: {},
            font: "Calibri",
            size: 20,
          }),
        ],
        spacing: { after: 80 },
      }));
    }
  }

  const bgColor = theme === "dark" ? "1a1a2e" : "ffffff";

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
    background: { color: bgColor },
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}
