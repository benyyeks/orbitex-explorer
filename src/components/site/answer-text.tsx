// Renders assistant answers as React elements. The model returns a light
// Markdown subset, so this parser handles headings, lists, tables, blockquotes,
// code blocks and inline emphasis and links. Nothing is ever injected as HTML,
// so an answer cannot smuggle markup or script into the page.
import type { ReactNode } from "react";

type Block =
  | { kind: "heading"; level: 2 | 3 | 4; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "code"; lines: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "rule" };

const HEADING = /^(#{2,4})\s+(.*)$/;
const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;
const RULE = /^\s*([-*_])\s*(\1\s*){2,}$/;
const TABLE_DIVIDER = /^\s*\|?[\s:-]*[-]{2,}[\s:|-]*\|?\s*$/;

function splitRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";

    if (line.trim().startsWith("```")) {
      flushParagraph();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
        body.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push({ kind: "code", lines: body });
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    if (RULE.test(line)) {
      flushParagraph();
      blocks.push({ kind: "rule" });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flushParagraph();
      const level = Math.min(4, Math.max(2, (heading[1] ?? "##").length)) as 2 | 3 | 4;
      blocks.push({ kind: "heading", level, text: heading[2] ?? "" });
      continue;
    }

    // A table needs a header row followed by a divider row.
    if (line.includes("|") && TABLE_DIVIDER.test(lines[i + 1] ?? "")) {
      flushParagraph();
      const head = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && (lines[i] ?? "").includes("|")) {
        rows.push(splitRow(lines[i] ?? ""));
        i += 1;
      }
      i -= 1;
      blocks.push({ kind: "table", head, rows });
      continue;
    }

    const quote = QUOTE.exec(line);
    if (quote) {
      flushParagraph();
      blocks.push({ kind: "quote", text: quote[1] ?? "" });
      continue;
    }

    const bullet = BULLET.exec(line);
    const numbered = NUMBERED.exec(line);
    if (bullet || numbered) {
      flushParagraph();
      const ordered = !bullet;
      const items: string[] = [(bullet ? bullet[1] : numbered?.[1]) ?? ""];
      while (i + 1 < lines.length) {
        const nextLine = lines[i + 1] ?? "";
        const nextBullet = BULLET.exec(nextLine);
        const nextNumbered = NUMBERED.exec(nextLine);
        const matches = ordered ? nextNumbered : nextBullet;
        if (!matches) break;
        items.push(matches[1] ?? "");
        i += 1;
      }
      const last = blocks[blocks.length - 1];
      if (last && last.kind === "list" && last.ordered === ordered) last.items.push(...items);
      else blocks.push({ kind: "list", ordered, items });
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  return blocks;
}

// Inline emphasis, inline code and links. Only http and https links render as
// anchors; anything else stays plain text.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern =
    /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|(?<!\*)\*(?!\s)[^*]+\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) out.push(text.slice(cursor, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${index}`;
    index += 1;

    if (token.startsWith("`")) {
      out.push(
        <code key={key} className="answer-code-inline">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("***")) {
      out.push(
        <strong key={key}>
          <em>{token.slice(3, -3)}</em>
        </strong>,
      );
    } else if (token.startsWith("**") || token.startsWith("__")) {
      out.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("[")) {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("(") + 1, -1);
      if (/^https?:\/\//i.test(href)) {
        out.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>,
        );
      } else {
        out.push(label);
      }
    } else {
      out.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    cursor = match.index + token.length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export function AnswerText({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className="answer-body">
      {blocks.map((block, i) => {
        const key = `b${i}`;
        switch (block.kind) {
          case "heading": {
            const inline = renderInline(block.text, key);
            if (block.level === 2) return <h3 key={key}>{inline}</h3>;
            if (block.level === 3) return <h4 key={key}>{inline}</h4>;
            return <h5 key={key}>{inline}</h5>;
          }
          case "quote":
            return <blockquote key={key}>{renderInline(block.text, key)}</blockquote>;
          case "rule":
            return <hr key={key} />;
          case "code":
            return (
              <pre key={key} className="answer-code-block">
                <code>{block.lines.join("\n")}</code>
              </pre>
            );
          case "list":
            return block.ordered ? (
              <ol key={key}>
                {block.items.map((item, j) => (
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ol>
            ) : (
              <ul key={key}>
                {block.items.map((item, j) => (
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ul>
            );
          case "table":
            return (
              <div key={key} className="answer-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      {block.head.map((cell, j) => (
                        <th key={`${key}-h${j}`}>{renderInline(cell, `${key}-h${j}`)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={`${key}-r${j}`}>
                        {row.map((cell, k) => (
                          <td key={`${key}-r${j}-${k}`}>
                            {renderInline(cell, `${key}-r${j}-${k}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return <p key={key}>{renderInline(block.text, key)}</p>;
        }
      })}
    </div>
  );
}
