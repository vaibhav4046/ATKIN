import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

/**
 * Format inline markdown tokens into React nodes without dangerouslySetInnerHTML.
 * Supports **bold**, *italics*, and `inline code`.
 */
function renderInline(text: string, isUser = false): React.ReactNode {
  // Regex matches **bold**, *italic*, and `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className={`font-semibold ${isUser ? 'text-white' : 'text-ink'}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className={`font-mono text-[11.5px] px-1 py-0.5 rounded ${
            isUser 
              ? 'bg-white/20 text-white' 
              : 'bg-atkin-bg text-atkin-ink border border-atkin-border'
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Lightweight, zero-dependency Markdown renderer for legal workbench notes and chat messages.
 * Prevents raw asterisks and renders structured legal blocks (headings, lists, quotes, tables).
 */
export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '', isUser = false }) => {
  if (!content) return null;

  // Split into paragraphs / blocks
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className={`space-y-2.5 leading-relaxed text-[13px] ${className}`}>
      {blocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Headings
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={blockIdx} className="text-[13.5px] font-semibold text-ink pt-1 font-sans">
              {renderInline(trimmed.replace(/^###\s+/, ''), isUser)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={blockIdx} className="text-[15px] font-serif font-semibold text-ink pt-1.5">
              {renderInline(trimmed.replace(/^##\s+/, ''), isUser)}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={blockIdx} className="text-[16.5px] font-serif font-bold text-ink pt-2">
              {renderInline(trimmed.replace(/^#\s+/, ''), isUser)}
            </h2>
          );
        }

        // Horizontal Rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={blockIdx} className="border-border-hairline my-3" />;
        }

        // Blockquotes
        if (trimmed.startsWith('>')) {
          const quoteLines = trimmed.split('\n').map(l => l.replace(/^>\s?/, ''));
          return (
            <blockquote
              key={blockIdx}
              className={`pl-3 border-l-2 py-0.5 my-1.5 italic ${
                isUser 
                  ? 'border-white/50 text-white/90' 
                  : 'border-atkin-ink/40 text-atkin-muted bg-atkin-bg'
              }`}
            >
              {quoteLines.map((line, lIdx) => (
                <p key={lIdx}>{renderInline(line, isUser)}</p>
              ))}
            </blockquote>
          );
        }

        // Unordered lists (lines starting with - , * , • )
        const lines = trimmed.split('\n');
        const isBulletList = lines.length > 0 && lines.every(l => /^[-*•]\s+/.test(l.trim()));
        if (isBulletList) {
          return (
            <ul key={blockIdx} className="list-disc pl-5 space-y-1 my-1">
              {lines.map((l, lIdx) => (
                <li key={lIdx} className="leading-snug">
                  {renderInline(l.replace(/^[-*•]\s+/, ''), isUser)}
                </li>
              ))}
            </ul>
          );
        }

        // Numbered lists (lines starting with 1. , 2. )
        const isNumberedList = lines.length > 0 && lines.every(l => /^\d+\.\s+/.test(l.trim()));
        if (isNumberedList) {
          return (
            <ol key={blockIdx} className="list-decimal pl-5 space-y-1 my-1">
              {lines.map((l, lIdx) => (
                <li key={lIdx} className="leading-snug">
                  {renderInline(l.replace(/^\d+\.\s+/, ''), isUser)}
                </li>
              ))}
            </ol>
          );
        }

        // Table (markdown pipe table)
        if (lines.length >= 2 && lines[0].includes('|') && lines[1].includes('|')) {
          const headerCells = lines[0].split('|').map(c => c.trim()).filter(Boolean);
          const bodyRows = lines.slice(2).filter(l => l.includes('|')).map(l => l.split('|').map(c => c.trim()).filter(Boolean));

          if (headerCells.length > 0) {
            return (
              <div key={blockIdx} className="overflow-x-auto my-2">
                <table className="min-w-full text-[11.5px] border border-border-hairline rounded">
                  <thead>
                    <tr className="bg-canvas-subtle border-b border-border-hairline text-left">
                      {headerCells.map((h, hIdx) => (
                        <th key={hIdx} className="px-2.5 py-1.5 font-semibold text-ink">
                          {renderInline(h, isUser)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bodyRows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-border-hairline/60 last:border-b-0 hover:bg-slate-50/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-2.5 py-1.5 text-ink-slate">
                            {renderInline(cell, isUser)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // Default paragraph
        return (
          <p key={blockIdx} className="leading-relaxed">
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {lineIdx > 0 && <br />}
                {renderInline(line, isUser)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};
