export interface ParsedDocumentResult {
  filename: string;
  mime: string;
  sha256: string;
  sourceDate: string | null;
  text: string;
  pageCount: number;
}

export async function computeSHA256(content: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Simple deterministic fallback for non-crypto environments
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export function parseEMLContent(rawContent: string): { headers: Record<string, string>; body: string; date: string | null } {
  const lines = rawContent.split(/\r?\n/);
  const headers: Record<string, string> = {};
  let bodyStartIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      bodyStartIndex = i + 1;
      break;
    }
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim().toLowerCase();
      const val = line.slice(colonIndex + 1).trim();
      headers[key] = val;
    }
  }

  const body = lines.slice(bodyStartIndex).join('\n').trim();
  let date: string | null = null;
  if (headers['date']) {
    try {
      const parsedDate = new Date(headers['date']);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().slice(0, 10);
      }
    } catch {
      date = null;
    }
  }

  return { headers, body, date };
}

export async function parseDocumentFile(file: { name: string; type?: string; content: string }): Promise<ParsedDocumentResult> {
  const filename = file.name;
  const rawText = file.content;
  const sha256 = await computeSHA256(rawText);

  let mime = file.type || 'text/plain';
  let extractedText = rawText;
  let sourceDate: string | null = null;

  if (filename.toLowerCase().endsWith('.eml')) {
    mime = 'message/rfc822';
    const eml = parseEMLContent(rawText);
    sourceDate = eml.date;
    extractedText = rawText; // Preserve complete raw content with headers for verifiable byte offsets
  } else if (filename.toLowerCase().endsWith('.md')) {
    mime = 'text/markdown';
  } else if (filename.toLowerCase().endsWith('.pdf')) {
    mime = 'application/pdf';
  }

  // Conservative date discovery in first 500 characters if no EML date found
  if (!sourceDate) {
    const dateMatch = rawText.slice(0, 500).match(/(\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b)|(\b\d{4}-\d{2}-\d{2}\b)/i);
    if (dateMatch) {
      try {
        const d = new Date(dateMatch[0]);
        if (!isNaN(d.getTime())) {
          sourceDate = d.toISOString().slice(0, 10);
        }
      } catch {
        sourceDate = null;
      }
    }
  }

  return {
    filename,
    mime,
    sha256,
    sourceDate,
    text: extractedText,
    pageCount: 1
  };
}
