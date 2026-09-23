import type { Span } from '../types/index.ts';

export function calculateLineNumbers(text: string, startOffset: number, endOffset: number): { lineStart: number; lineEnd: number } {
  const textBeforeStart = text.slice(0, startOffset);
  const textBeforeEnd = text.slice(0, endOffset);
  const lineStart = (textBeforeStart.match(/\n/g) || []).length + 1;
  const lineEnd = (textBeforeEnd.match(/\n/g) || []).length + 1;
  return { lineStart, lineEnd };
}

export function computeSpanChecksum(exactText: string, startOffset: number, endOffset: number): string {
  let hash = 0;
  const str = `${startOffset}:${endOffset}:${exactText.trim()}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `chk-${Math.abs(hash).toString(16)}`;
}

export function createSpanFromOffsets(
  documentId: string,
  docText: string,
  startOffset: number,
  endOffset: number,
  page = 1
): { span: Span; isValid: boolean } {
  if (startOffset < 0 || endOffset > docText.length || startOffset >= endOffset) {
    return {
      span: {
        id: `span-err-${Date.now()}`,
        documentId,
        page,
        startOffset: 0,
        endOffset: 0,
        exactText: '',
        checksum: 'invalid'
      },
      isValid: false
    };
  }

  const exactText = docText.slice(startOffset, endOffset);
  const { lineStart, lineEnd } = calculateLineNumbers(docText, startOffset, endOffset);
  const checksum = computeSpanChecksum(exactText, startOffset, endOffset);

  const span: Span = {
    id: `span-${documentId.slice(-6)}-${startOffset}-${endOffset}`,
    documentId,
    page,
    startOffset,
    endOffset,
    exactText,
    checksum,
    lineStart,
    lineEnd
  };

  return { span, isValid: true };
}

export function findSpansForPhrase(
  documentId: string,
  docText: string,
  phrase: string,
  page = 1
): Span[] {
  const spans: Span[] = [];
  if (!phrase || phrase.length < 3) return spans;

  let index = docText.indexOf(phrase);
  while (index !== -1) {
    const endOffset = index + phrase.length;
    const { span, isValid } = createSpanFromOffsets(documentId, docText, index, endOffset, page);
    if (isValid) {
      spans.push(span);
    }
    index = docText.indexOf(phrase, index + 1);
  }

  return spans;
}
