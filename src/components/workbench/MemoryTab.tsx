import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Check, 
  X, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  FileText, 
  Lock,
  Layers
} from 'lucide-react';
import type { MemoryRecord, MemoryScope } from '../../types/index.ts';
import { MemoryEngine } from '../../engine/memory/memoryEngine.ts';
import { Badge } from '../common/Badge.tsx';

interface MemoryTabProps {
  matterId: string;
  memoryEngine: MemoryEngine;
}

export const MemoryTab: React.FC<MemoryTabProps> = ({
  matterId,
  memoryEngine
}) => {
  const [activeScopeTab, setActiveScopeTab] = useState<'matter_facts' | 'user_preferences' | 'workspace_playbooks' | 'suggested'>('matter_facts');
  const [newText, setNewText] = useState('');
  const [newKind, setNewKind] = useState<MemoryRecord['kind']>('fact');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const allMemories = memoryEngine.getMemoriesForMatter(matterId);

  const filteredMemories = allMemories.filter(m => {
    if (activeScopeTab === 'suggested') {
      return m.reviewState === 'suggested';
    }
    return m.scope === activeScopeTab && m.reviewState === 'accepted';
  });

  const handleApprove = (id: string) => {
    memoryEngine.approveMemory(id);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReject = (id: string) => {
    memoryEngine.rejectMemory(id);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    memoryEngine.suggestMemory({
      vaultId: 'default-vault',
      matterId: activeScopeTab === 'user_preferences' ? undefined : matterId,
      scope: activeScopeTab === 'suggested' ? 'matter_facts' : activeScopeTab,
      kind: newKind,
      text: newText.trim(),
      createdBy: 'human'
    });

    setNewText('');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-8 max-w-[1080px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border-hairline">
        <div>
          <h2 className="text-[22px] font-semibold text-ink tracking-tight flex items-center gap-2.5">
            <BrainCircuit className="w-5 h-5 text-proofline-blue" />
            Sovereign Memory Ledger
          </h2>
          <p className="text-[13px] text-ink-slate mt-1">
            Scoped, attributable, and cryptographically isolated memory across sessions. Matters never share private evidential facts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="green" size="md">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Strict Cross-Matter Isolation Active
          </Badge>
        </div>
      </div>

      {/* Scope Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border-hairline pb-2">
        <button
          onClick={() => setActiveScopeTab('matter_facts')}
          className={`px-3 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors ${
            activeScopeTab === 'matter_facts'
              ? 'bg-ink text-white'
              : 'text-ink-slate hover:text-ink hover:bg-gallery-mist'
          }`}
        >
          This Matter Facts ({allMemories.filter(m => m.scope === 'matter_facts' && m.reviewState === 'accepted').length})
        </button>
        <button
          onClick={() => setActiveScopeTab('user_preferences')}
          className={`px-3 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors ${
            activeScopeTab === 'user_preferences'
              ? 'bg-ink text-white'
              : 'text-ink-slate hover:text-ink hover:bg-gallery-mist'
          }`}
        >
          My Style Preferences ({allMemories.filter(m => m.scope === 'user_preferences' && m.reviewState === 'accepted').length})
        </button>
        <button
          onClick={() => setActiveScopeTab('workspace_playbooks')}
          className={`px-3 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors ${
            activeScopeTab === 'workspace_playbooks'
              ? 'bg-ink text-white'
              : 'text-ink-slate hover:text-ink hover:bg-gallery-mist'
          }`}
        >
          Playbooks &amp; Guidelines ({allMemories.filter(m => m.scope === 'workspace_playbooks' && m.reviewState === 'accepted').length})
        </button>
        <button
          onClick={() => setActiveScopeTab('suggested')}
          className={`px-3 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors flex items-center gap-1.5 ${
            activeScopeTab === 'suggested'
              ? 'bg-proofline-ochre text-white'
              : 'text-proofline-ochre hover:bg-proofline-ochre/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Pending Approvals ({allMemories.filter(m => m.reviewState === 'suggested').length})
        </button>
      </div>

      {/* Add Memory Form */}
      {activeScopeTab !== 'suggested' && (
        <form onSubmit={handleAddMemory} className="p-4 bg-gallery-white border border-border-hairline rounded-[6px] shadow-subtle flex gap-3">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={`Add explicit memory record to ${activeScopeTab.replace(/_/g, ' ')}...`}
            className="flex-1 px-3 py-2 text-[13px] border border-border-hairline rounded-[4px] focus:outline-none focus:ring-1 focus:ring-proofline-blue bg-gallery-mist/30"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-ink text-white rounded-[4px] text-[13px] font-medium flex items-center gap-1.5 hover:bg-ink/85 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record</span>
          </button>
        </form>
      )}

      {/* Memory List */}
      <div className="space-y-3">
        {filteredMemories.length === 0 ? (
          <div className="p-8 text-center bg-gallery-white border border-dashed border-border-hairline rounded-[6px] text-ink-steel text-[13px]">
            No memory records found under this scope.
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-4 bg-gallery-white border border-border-hairline rounded-[6px] shadow-subtle flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-[11px]">
                  <Badge variant={mem.createdBy === 'human' ? 'green' : 'ochre'} size="sm">
                    {mem.createdBy === 'human' ? 'Human Verified' : 'AI Suggested'}
                  </Badge>
                  <span className="text-ink-steel">
                    Recorded {new Date(mem.createdAt).toLocaleDateString('en-GB')}
                  </span>
                  {mem.matterId ? (
                    <span className="text-ink-steel">· Scoped to Matter {mem.matterId}</span>
                  ) : (
                    <span className="text-proofline-blue font-medium">· Global Scope (Cross-Matter Safe)</span>
                  )}
                  {mem.status === 'invalidated' && (
                    <Badge variant="red" size="sm">Invalidated (Source Drift)</Badge>
                  )}
                </div>

                <p className="text-[13.5px] text-ink font-normal leading-relaxed">
                  {mem.text}
                </p>

                {mem.sourceDocumentVersions.length > 0 && (
                  <div className="text-[11px] text-ink-steel flex items-center gap-1 pt-1">
                    <FileText className="w-3 h-3 text-proofline-blue" />
                    <span>Dependency: {mem.sourceDocumentVersions.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {mem.reviewState === 'suggested' ? (
                  <>
                    <button
                      onClick={() => handleApprove(mem.id)}
                      className="p-1.5 rounded-[4px] bg-proofline-green/10 text-proofline-green hover:bg-proofline-green hover:text-white transition-colors"
                      title="Approve Memory"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(mem.id)}
                      className="p-1.5 rounded-[4px] bg-proofline-crimson/10 text-proofline-crimson hover:bg-proofline-crimson hover:text-white transition-colors"
                      title="Reject Memory"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleReject(mem.id)}
                    className="p-1.5 rounded-[4px] text-ink-steel hover:text-proofline-crimson hover:bg-gallery-mist transition-colors"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
