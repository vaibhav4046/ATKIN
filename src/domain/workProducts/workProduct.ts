/**
 * ATKIN Work Products Subsystem
 * Sections 19, 21, 22: Persistent Legal Work Products & Source Dependency Graph
 */

export type WorkProductType =
  | 'legal_memo'
  | 'advice_note'
  | 'contract_review'
  | 'chronology'
  | 'witness_comparison'
  | 'draft_letter'
  | 'pleading_outline'
  | 'evidence_matrix'
  | 'hearing_brief'
  | 'bundle_index'
  | 'research_report'
  | 'custom_document';

export type BlockStatus = 'active' | 'SOURCE_CHANGED' | 'needs_review' | 'verified';

export interface GeneratedBlock {
  id: string;
  productVersionId: string;
  heading?: string;
  text: string;
  sourceSpanIds: string[];
  sourceDocumentIds: string[];
  authorityIds?: string[];
  generatedAt: string;
  status: BlockStatus;
  statusNote?: string;
}

export interface WorkProductVersion {
  id: string;
  productId: string;
  version: number;
  title: string;
  blocks: GeneratedBlock[];
  body: string; // Markdown synthesized from blocks
  createdBy: 'ai' | 'user' | 'lawyer_approved';
  modelRunId?: string;
  sourceRefs: string[]; // Document or Span IDs
  createdAt: string;
}

export interface WorkProduct {
  id: string;
  matterId: string;
  workspaceId: string;
  type: WorkProductType;
  title: string;
  currentVersionId: string;
  versions: WorkProductVersion[];
  sourceRefs: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Factory for creating a new WorkProduct with version 1.
 */
export function createWorkProduct(params: {
  matterId: string;
  workspaceId: string;
  type: WorkProductType;
  title: string;
  blocks?: GeneratedBlock[];
  body?: string;
  createdBy?: 'ai' | 'user' | 'lawyer_approved';
  sourceRefs?: string[];
}): WorkProduct {
  const productId = `wp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const versionId = `${productId}-v1`;
  const now = new Date().toISOString();

  const blocks: GeneratedBlock[] = params.blocks || [
    {
      id: `blk-${Date.now()}-1`,
      productVersionId: versionId,
      heading: params.title,
      text: params.body || 'Draft content initialized.',
      sourceSpanIds: [],
      sourceDocumentIds: params.sourceRefs || [],
      generatedAt: now,
      status: 'active'
    }
  ];

  const synthesizedBody = params.body || blocks.map(b => (b.heading ? `### ${b.heading}\n\n${b.text}` : b.text)).join('\n\n');

  const initialVersion: WorkProductVersion = {
    id: versionId,
    productId,
    version: 1,
    title: params.title,
    blocks,
    body: synthesizedBody,
    createdBy: params.createdBy || 'user',
    sourceRefs: params.sourceRefs || [],
    createdAt: now
  };

  return {
    id: productId,
    matterId: params.matterId,
    workspaceId: params.workspaceId,
    type: params.type,
    title: params.title,
    currentVersionId: versionId,
    versions: [initialVersion],
    sourceRefs: params.sourceRefs || [],
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Creates a new version of an existing WorkProduct without overwriting history.
 */
export function appendProductVersion(
  product: WorkProduct,
  params: {
    blocks: GeneratedBlock[];
    body?: string;
    createdBy: 'ai' | 'user' | 'lawyer_approved';
    modelRunId?: string;
    sourceRefs?: string[];
  }
): WorkProduct {
  const nextVersionNum = product.versions.length + 1;
  const versionId = `${product.id}-v${nextVersionNum}`;
  const now = new Date().toISOString();

  const blocksWithVersionId = params.blocks.map(b => ({
    ...b,
    productVersionId: versionId
  }));

  const body = params.body || blocksWithVersionId.map(b => (b.heading ? `### ${b.heading}\n\n${b.text}` : b.text)).join('\n\n');

  const newVersion: WorkProductVersion = {
    id: versionId,
    productId: product.id,
    version: nextVersionNum,
    title: product.title,
    blocks: blocksWithVersionId,
    body,
    createdBy: params.createdBy,
    modelRunId: params.modelRunId,
    sourceRefs: params.sourceRefs || product.sourceRefs,
    createdAt: now
  };

  return {
    ...product,
    currentVersionId: versionId,
    versions: [...product.versions, newVersion],
    sourceRefs: Array.from(new Set([...product.sourceRefs, ...(params.sourceRefs || [])])),
    updatedAt: now
  };
}

/**
 * Section 22: Source Dependency Graph & Drift Detection.
 * When source documents change or are varied, flags dependent blocks as SOURCE_CHANGED.
 */
export function detectSourceDrift(
  currentVersion: WorkProductVersion,
  staleDocumentIds: string[]
): {
  hasDrift: boolean;
  driftedBlockIds: string[];
  updatedVersion: WorkProductVersion;
} {
  const staleSet = new Set(staleDocumentIds);
  const driftedBlockIds: string[] = [];

  const updatedBlocks = currentVersion.blocks.map(block => {
    const isAffected = block.sourceDocumentIds.some(docId => staleSet.has(docId));
    if (isAffected) {
      driftedBlockIds.push(block.id);
      return {
        ...block,
        status: 'SOURCE_CHANGED' as BlockStatus,
        statusNote: 'Referenced source document was modified or superseded by a variation.'
      };
    }
    return block;
  });

  return {
    hasDrift: driftedBlockIds.length > 0,
    driftedBlockIds,
    updatedVersion: {
      ...currentVersion,
      blocks: updatedBlocks
    }
  };
}
