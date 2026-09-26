import React, { useState } from 'react';
import type { WorkProduct, WorkProductVersion, GeneratedBlock } from '../../domain/workProducts/workProduct.ts';
import { appendProductVersion } from '../../domain/workProducts/workProduct.ts';

interface WorkProductPanelProps {
  product: WorkProduct | null;
  onClose: () => void;
  onUpdateProduct: (updated: WorkProduct) => void;
}

export const WorkProductPanel: React.FC<WorkProductPanelProps> = ({
  product,
  onClose,
  onUpdateProduct
}) => {
  if (!product) return null;

  const currentVersion = product.versions.find(v => v.id === product.currentVersionId) || product.versions[product.versions.length - 1];
  const [selectedVersionId, setSelectedVersionId] = useState<string>(currentVersion.id);
  const activeVersion = product.versions.find(v => v.id === selectedVersionId) || currentVersion;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedBody, setEditedBody] = useState<string>(activeVersion.body);

  const hasSourceChanged = activeVersion.blocks.some(b => b.status === 'SOURCE_CHANGED');

  const handleSaveVersion = (asApproved: boolean = false) => {
    const updatedBlocks: GeneratedBlock[] = [
      {
        id: `blk-${Date.now()}`,
        productVersionId: '',
        text: editedBody,
        sourceSpanIds: [],
        sourceDocumentIds: activeVersion.sourceRefs,
        generatedAt: new Date().toISOString(),
        status: asApproved ? 'verified' : 'active'
      }
    ];

    const updatedProduct = appendProductVersion(product, {
      blocks: updatedBlocks,
      body: editedBody,
      createdBy: asApproved ? 'lawyer_approved' : 'user'
    });

    onUpdateProduct(updatedProduct);
    setSelectedVersionId(updatedProduct.currentVersionId);
    setIsEditing(false);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([activeVersion.body], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${product.title.replace(/\s+/g, '_')}_v${activeVersion.version}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <aside
      className="w-full md:w-[480px] lg:w-[540px] h-full flex flex-col bg-atkin-surface-light dark:bg-atkin-surface-dark border-l border-atkin-border-light dark:border-atkin-border-dark shadow-2xl transition-all duration-200 z-30"
      aria-label="Work Product Side Panel"
    >
      {/* Top Header */}
      <div className="p-4 border-b border-atkin-border-light dark:border-atkin-border-dark flex items-center justify-between bg-atkin-paper dark:bg-atkin-ink">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-atkin-border-light dark:border-atkin-border-dark bg-atkin-surface-light dark:bg-atkin-surface-dark text-atkin-ink dark:text-atkin-paper">
            {product.type.replace('_', ' ')}
          </span>
          <h2 className="text-sm font-sans font-semibold text-atkin-ink dark:text-atkin-paper truncate">
            {product.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-atkin-muted-light dark:text-atkin-muted-dark hover:text-atkin-ink dark:hover:text-atkin-paper transition-colors"
          title="Close Work Product Panel"
          aria-label="Close Work Product Panel"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Version & Authorship Bar */}
      <div className="px-4 py-2 border-b border-atkin-border-light dark:border-atkin-border-dark flex items-center justify-between text-xs font-mono bg-atkin-surface-light/50 dark:bg-atkin-surface-dark/50">
        <div className="flex items-center gap-2">
          <span className="text-atkin-muted-light dark:text-atkin-muted-dark">Version:</span>
          <select
            value={selectedVersionId}
            onChange={(e) => {
              setSelectedVersionId(e.target.value);
              const v = product.versions.find(x => x.id === e.target.value);
              if (v) setEditedBody(v.body);
            }}
            className="bg-transparent border border-atkin-border-light dark:border-atkin-border-dark rounded px-2 py-0.5 text-atkin-ink dark:text-atkin-paper font-mono focus:outline-none"
          >
            {product.versions.map((ver) => (
              <option key={ver.id} value={ver.id} className="bg-atkin-paper dark:bg-atkin-ink">
                v{ver.version} ({new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-mono ${
              activeVersion.createdBy === 'lawyer_approved'
                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                : activeVersion.createdBy === 'user'
                ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`}
          >
            {activeVersion.createdBy.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Drift Alert Banner */}
      {hasSourceChanged && (
        <div className="p-3 bg-amber-500/15 border-b border-amber-600/40 text-amber-300 text-xs font-sans flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-semibold block font-mono text-[11px] tracking-wide">SOURCE VARIATION DRIFT DETECTED</span>
            <span>One or more referenced contractual clauses have been amended or superseded by a variation deed. Check marked blocks before client delivery.</span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isEditing ? (
          <div className="h-full flex flex-col gap-2">
            <textarea
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              className="flex-1 w-full p-3 font-mono text-xs bg-atkin-paper dark:bg-atkin-ink border border-atkin-border-light dark:border-atkin-border-dark rounded text-atkin-ink dark:text-atkin-paper focus:outline-none resize-none leading-relaxed"
              placeholder="Edit draft work product..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setEditedBody(activeVersion.body);
                  setIsEditing(false);
                }}
                className="px-3 py-1 text-xs font-mono rounded border border-atkin-border-light dark:border-atkin-border-dark text-atkin-muted-light dark:text-atkin-muted-dark hover:text-atkin-ink dark:hover:text-atkin-paper"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveVersion(false)}
                className="px-3 py-1 text-xs font-mono rounded bg-atkin-ink dark:bg-atkin-paper text-atkin-paper dark:text-atkin-ink hover:opacity-90 font-medium"
              >
                Save New Version
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeVersion.blocks.map((block) => (
              <div
                key={block.id}
                className={`p-3 rounded border text-xs leading-relaxed transition-all ${
                  block.status === 'SOURCE_CHANGED'
                    ? 'border-l-4 border-amber-500 bg-amber-500/10 border-amber-600/30'
                    : 'border-atkin-border-light dark:border-atkin-border-dark bg-atkin-paper dark:bg-atkin-ink'
                }`}
              >
                {block.heading && (
                  <h3 className="font-sans font-semibold text-sm mb-1.5 text-atkin-ink dark:text-atkin-paper flex items-center justify-between">
                    <span>{block.heading}</span>
                    {block.status === 'SOURCE_CHANGED' && (
                      <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                        SOURCE_CHANGED
                      </span>
                    )}
                  </h3>
                )}
                <div className="text-atkin-ink/90 dark:text-atkin-paper/90 whitespace-pre-wrap font-sans">
                  {block.text}
                </div>
                {block.statusNote && (
                  <p className="mt-2 text-[10px] font-mono text-amber-400 italic">
                    Note: {block.statusNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-atkin-border-light dark:border-atkin-border-dark flex items-center justify-between bg-atkin-paper dark:bg-atkin-ink">
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-mono rounded border border-atkin-border-light dark:border-atkin-border-dark hover:bg-atkin-surface-light dark:hover:bg-atkin-surface-dark text-atkin-ink dark:text-atkin-paper flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          ) : null}

          <button
            onClick={handleExportMarkdown}
            className="px-3 py-1.5 text-xs font-mono rounded border border-atkin-border-light dark:border-atkin-border-dark hover:bg-atkin-surface-light dark:hover:bg-atkin-surface-dark text-atkin-muted-light dark:text-atkin-muted-dark hover:text-atkin-ink dark:hover:text-atkin-paper flex items-center gap-1.5"
            title="Export as Markdown"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export .md
          </button>
        </div>

        {activeVersion.createdBy !== 'lawyer_approved' && (
          <button
            onClick={() => handleSaveVersion(true)}
            className="px-3 py-1.5 text-xs font-mono rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium flex items-center gap-1.5 shadow-sm transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve Work Product
          </button>
        )}
      </div>
    </aside>
  );
};
