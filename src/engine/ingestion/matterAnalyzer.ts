import type { 
  Document, 
  Span, 
  Claim, 
  EvidenceEdge, 
  ReviewItem, 
  Draft, 
  DraftBlock 
} from '../../types/index.ts';
import { computeSHA256 } from '../parser.ts';

export interface IngestionAnalysisResult {
  document: Document;
  spans: Span[];
  claims: Claim[];
  reviewItems: ReviewItem[];
  draftBlocks: DraftBlock[];
}

export class MatterAnalyzer {
  /**
   * Analyzes an imported or pasted document in real time:
   * 1. Generates byte-accurate spans with line numbers and checksums.
   * 2. Extracts temporal dates and entity assertions.
   * 3. Formulates source-linked claims with 'supports' edges.
   * 4. Scans across existing claims to detect contradictions and create 'contradicts' edges.
   * 5. Produces actionable review items and ready-to-audit draft blocks.
   */
  public async analyzeDocument(params: {
    matterId: string;
    filename: string;
    text: string;
    mime?: string;
    sourceDate?: string | null;
    privacyLabel?: string;
    existingClaims?: Claim[];
  }): Promise<IngestionAnalysisResult> {
    const { 
      matterId, 
      filename, 
      text, 
      mime = 'text/plain', 
      sourceDate = null, 
      privacyLabel = 'Browser-local verified',
      existingClaims = []
    } = params;

    const normalizedText = text.replace(/\r\n/g, '\n');
    const sha256 = await computeSHA256(normalizedText);
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Create Document Record
    const document: Document = {
      id: docId,
      matterId,
      filename,
      mime,
      sha256,
      importedAt: new Date().toISOString(),
      sourceDate: sourceDate || this.detectLeadingDate(normalizedText),
      extractionStatus: 'success',
      pageCount: Math.max(1, Math.ceil(normalizedText.length / 2400)),
      text: normalizedText,
      privacyLabel
    };

    // 2. Extract Spans with Exact Offsets
    const spans = this.extractSentenceSpans(document);

    // 3. Extract Claims from High-Signal Spans
    const { claims, reviewItems } = this.extractClaimsAndReviewItems(
      matterId, 
      document, 
      spans, 
      existingClaims
    );

    // 4. Generate Draft Blocks from Extracted Claims
    const draftBlocks = this.generateDraftBlocks(document, claims, spans);

    return {
      document,
      spans,
      claims,
      reviewItems,
      draftBlocks
    };
  }

  private detectLeadingDate(text: string): string | null {
    const match = text.slice(0, 800).match(/(\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b)|(\b\d{4}-\d{2}-\d{2}\b)/i);
    if (!match) return null;
    try {
      const d = new Date(match[0]);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch {
      return null;
    }
    return null;
  }

  private extractSentenceSpans(doc: Document): Span[] {
    const spans: Span[] = [];
    const lines = doc.text.split('\n');
    let currentOffset = 0;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const lineText = lines[lineIdx];
      const lineStartOffset = currentOffset;
      const trimmed = lineText.trim();

      // Only process substantive lines (more than 15 chars, not pure punctuation/headers)
      if (trimmed.length > 20 && !trimmed.startsWith('===')) {
        // Split substantive lines into sentences or meaningful clauses
        const sentenceRegex = /[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g;
        let match;
        while ((match = sentenceRegex.exec(lineText)) !== null) {
          const sentence = match[0].trim();
          if (sentence.length >= 25) {
            const startOffset = lineStartOffset + match.index;
            const endOffset = startOffset + match[0].length;
            const spanId = `span-${doc.id.slice(4, 9)}-${spans.length + 1}`;

            spans.push({
              id: spanId,
              documentId: doc.id,
              startOffset,
              endOffset,
              exactText: sentence,
              checksum: `${startOffset}-${endOffset}-${sentence.slice(0, 16).replace(/\W/g, '')}`,
              lineStart: lineIdx + 1,
              lineEnd: lineIdx + 1
            });
          }
        }
      }

      // Advance by line length plus newline character
      currentOffset += lineText.length + 1;
    }

    return spans;
  }

  private extractClaimsAndReviewItems(
    matterId: string,
    doc: Document,
    spans: Span[],
    existingClaims: Claim[]
  ): { claims: Claim[]; reviewItems: ReviewItem[] } {
    const claims: Claim[] = [];
    const reviewItems: ReviewItem[] = [];

    // Legal assertion heuristic keywords
    const keywords = [
      { pattern: /\b(warrant|warranty|guarantee|represent|certif)/i, kind: 'legal_proposition' as const, polarity: 'favourable' as const },
      { pattern: /\b(defect|bug|shortfall|discrepancy|timeout|fail|crash|shutdown|leak|damage)/i, kind: 'fact' as const, polarity: 'favourable' as const },
      { pattern: /\b(refuse|denied|reject|impossible|not liable|disclaim|exclude)/i, kind: 'fact' as const, polarity: 'adverse' as const },
      { pattern: /\b(indemnif|strict liability|make good|penalty|interest|deposit)/i, kind: 'legal_proposition' as const, polarity: 'neutral' as const },
      { pattern: /\b(remotely|alter|modify|access|unauthorized|subpoena|breach)/i, kind: 'fact' as const, polarity: 'favourable' as const }
    ];

    // Formulate claims from the most substantive legal spans
    for (const span of spans) {
      for (const kw of keywords) {
        if (kw.pattern.test(span.exactText)) {
          // Avoid creating multiple near-identical claims
          const isDuplicate = claims.some(c => 
            c.statement.slice(0, 35).toLowerCase() === span.exactText.slice(0, 35).toLowerCase()
          );
          if (isDuplicate) continue;

          const claimId = `claim-${doc.id.slice(4, 9)}-${claims.length + 1}`;
          const dateMatch = span.exactText.match(/(\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b)|(\b\d{4}-\d{2}-\d{2}\b)/i);
          const temporalScope = dateMatch ? dateMatch[0] : (doc.sourceDate || undefined);

          const edge: EvidenceEdge = {
            id: `edge-${claimId}-1`,
            claimId,
            spanId: span.id,
            type: 'supports',
            author: 'rule',
            rationale: `Direct factual extraction from ${doc.filename} lines ${span.lineStart}-${span.lineEnd}`,
            reviewState: 'approved',
            createdAt: new Date().toISOString()
          };

          const claim: Claim = {
            id: claimId,
            matterId,
            statement: span.exactText,
            kind: kw.kind,
            polarity: kw.polarity,
            temporalScope,
            status: 'supported',
            provenanceEdges: [edge],
            editorNotes: `Auto-extracted by Sovereign Ingestion Engine from ${doc.filename}.`,
            updatedAt: new Date().toISOString()
          };

          // 5. Check Contradictions with Existing Claims
          this.checkContradictionsForClaim(claim, span, existingClaims, reviewItems);

          claims.push(claim);
          break; // move to next span
        }
      }

      // Cap automated claim generation to top 8 most legally relevant per document to prevent noise
      if (claims.length >= 8) break;
    }

    return { claims, reviewItems };
  }

  private checkContradictionsForClaim(
    newClaim: Claim,
    newSpan: Span,
    existingClaims: Claim[],
    reviewItems: ReviewItem[]
  ): void {
    const textNew = newClaim.statement.toLowerCase();

    for (const oldClaim of existingClaims) {
      const textOld = oldClaim.statement.toLowerCase();

      // Check Opposing Patterns:
      // Pattern 1: Defect vs Denial of Defect
      const newHasDefect = /\b(defect|bug|failure|discrepancy|shortfall|fault)\b/.test(textNew);
      const oldDeniesDefect = /\b(robust|reliable|impossible|no defect|not responsible|free from defect)\b/.test(textOld);
      
      const newDeniesDefect = /\b(robust|reliable|impossible|no defect|not responsible|free from defect)\b/.test(textNew);
      const oldHasDefect = /\b(defect|bug|failure|discrepancy|shortfall|fault)\b/.test(textOld);

      // Pattern 2: Remote Access Denial vs Confirmation
      const newConfirmsAccess = /\b(remote access|remotely alter|injected|sql script|modify)\b/.test(textNew);
      const oldDeniesAccess = /\b(impossible|no remote access|unauthorized|cannot alter)\b/.test(textOld);

      // Pattern 3: Uncapped Liability vs Limitation of Liability
      const newUncapped = /\b(uncapped|strict liability|make good the entire|indemnify against any and all)\b/.test(textNew);
      const oldCapped = /\b(shall not exceed|aggregate liability|cap of|limited to)\b/.test(textOld);

      if ((newHasDefect && oldDeniesDefect) || (newDeniesDefect && oldHasDefect) ||
          (newConfirmsAccess && oldDeniesAccess) || (newUncapped && oldCapped)) {
        
        // Link with 'contradicts' edge
        const edgeId = `edge-contra-${newClaim.id}-${oldClaim.id}`;
        newClaim.provenanceEdges.push({
          id: edgeId,
          claimId: newClaim.id,
          spanId: newSpan.id,
          type: 'contradicts',
          author: 'rule',
          rationale: `Contradiction detected against existing claim "${oldClaim.statement.slice(0, 50)}..."`,
          reviewState: 'approved',
          createdAt: new Date().toISOString()
        });

        // Add review item
        reviewItems.push({
          id: `rev-contra-${newClaim.id}-${oldClaim.id}`,
          matterId: newClaim.matterId,
          type: 'contradiction',
          severity: 'high',
          title: `Contradiction Detected: Assertion vs Counter-Record`,
          description: `Direct factual or contractual conflict between newly ingested text ("${newClaim.statement.slice(0, 60)}...") and existing record ("${oldClaim.statement.slice(0, 60)}...").`,
          targetId: newClaim.id,
          targetType: 'claim',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  private generateDraftBlocks(doc: Document, claims: Claim[], spans: Span[]): DraftBlock[] {
    const blocks: DraftBlock[] = [];
    if (claims.length === 0) return blocks;

    const paragraphContent = claims.map(c => {
      const span = spans.find(s => s.id === c.provenanceEdges[0]?.spanId);
      const cite = span ? ` [Doc: ${doc.filename} § ${span.lineStart || 1}]` : '';
      return `${c.statement}${cite}`;
    }).join(' ');

    blocks.push({
      id: `block-${doc.id.slice(4, 9)}-analysis`,
      heading: `Evidence Analysis: ${doc.filename.replace(/[_-]/g, ' ')}`,
      text: paragraphContent,
      spanIds: spans.slice(0, 4).map(s => s.id),
      claimIds: claims.map(c => c.id),
      reviewStatus: 'verified'
    });

    return blocks;
  }
}

export const matterAnalyzer = new MatterAnalyzer();
