import React, { useState } from 'react';
import { 
  Download, 
  Cpu, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Globe, 
  WifiOff, 
  SlidersHorizontal, 
  ChevronDown, 
  FileText, 
  Package, 
  Calendar, 
  BookOpen,
  Award
} from 'lucide-react';
import type { Matter, ModelStatus, NetworkMode } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface TopRailProps {
  matter: Matter;
  modelStatus: ModelStatus;
  networkMode: NetworkMode;
  isVaultLocked: boolean;
  onToggleVaultLock: () => void;
  onChangeNetworkMode: (mode: NetworkMode) => void;
  onExportMarkdown: () => void;
  onExportDocx: () => void;
  onExportBundle: () => void;
  onExportNotebook: () => void;
  onExportCalendar: () => void;
  onOpenSettings: () => void;
}

export const TopRail: React.FC<TopRailProps> = ({
  matter,
  modelStatus,
  networkMode,
  isVaultLocked,
  onToggleVaultLock,
  onChangeNetworkMode,
  onExportMarkdown,
  onExportDocx,
  onExportBundle,
  onExportNotebook,
  onExportCalendar,
  onOpenSettings
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isNetMenuOpen, setIsNetMenuOpen] = useState(false);

  return (
    <div className="h-[58px] bg-white border-b border-border-hairline px-6 flex items-center justify-between sticky top-[48px] z-40 select-none">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold text-ink tracking-tight">
              {matter.title}
            </h1>
            <Badge variant="slate" size="sm">
              {matter.jurisdiction}
            </Badge>
            {matter.matterType && (
              <Badge variant="blue" size="sm">
                {matter.matterType.toUpperCase()}
              </Badge>
            )}
            {matter.isDemo && (
              <Badge variant="ochre" size="sm">
                Sample
              </Badge>
            )}
          </div>
          <div className="text-[11px] text-ink-steel mt-0.5">
            Client: <span className="text-ink font-medium">{matter.clientAlias}</span> · Sovereign Vault Encrypted
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Network Broker Mode Button */}
        <div className="relative">
          <button
            onClick={() => setIsNetMenuOpen(!isNetMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-border-hairline hover:bg-canvas-subtle text-[12px] text-ink transition-colors"
            title="Sovereign Network Broker Egress Policy"
            aria-expanded={isNetMenuOpen}
          >
            {networkMode === 'offline' ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-proofline-green" />
                <span className="font-medium text-proofline-green">Offline (0% Egress)</span>
              </>
            ) : networkMode === 'public_research' ? (
              <>
                <Globe className="w-3.5 h-3.5 text-proofline-blue" />
                <span className="font-medium text-proofline-blue">Research Whitelist</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-proofline-ochre" />
                <span className="font-medium text-proofline-ochre">Connected Mode</span>
              </>
            )}
            <ChevronDown className="w-3 h-3 text-ink-steel ml-0.5" />
          </button>

          {isNetMenuOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-border-hairline rounded-[4px] shadow-modal py-1 z-50 text-[12px]">
              <div className="px-3 py-1 font-semibold text-[10px] text-ink-steel uppercase tracking-wider border-b border-border-hairline">
                Egress Broker Mode
              </div>
              <button
                onClick={() => { onChangeNetworkMode('offline'); setIsNetMenuOpen(false); }}
                className={`w-full px-3 py-2 text-left hover:bg-canvas-subtle flex items-center justify-between ${networkMode === 'offline' ? 'text-proofline-green font-semibold bg-emerald-50/50' : 'text-ink'}`}
              >
                <div>
                  <div className="font-medium">Sovereign Offline</div>
                  <div className="text-[11px] text-ink-steel">Strict zero packet egress. Local only.</div>
                </div>
                {networkMode === 'offline' && <ShieldCheck className="w-3.5 h-3.5 text-proofline-green shrink-0 ml-2" />}
              </button>
              <button
                onClick={() => { onChangeNetworkMode('public_research'); setIsNetMenuOpen(false); }}
                className={`w-full px-3 py-2 text-left hover:bg-canvas-subtle flex items-center justify-between ${networkMode === 'public_research' ? 'text-proofline-blue font-semibold bg-blue-50/50' : 'text-ink'}`}
              >
                <div>
                  <div className="font-medium">Public Research Only</div>
                  <div className="text-[11px] text-ink-steel">legislation.gov.uk &amp; Find Case Law.</div>
                </div>
                {networkMode === 'public_research' && <ShieldCheck className="w-3.5 h-3.5 text-proofline-blue shrink-0 ml-2" />}
              </button>
              <button
                onClick={() => { onChangeNetworkMode('connected_imports'); setIsNetMenuOpen(false); }}
                className={`w-full px-3 py-2 text-left hover:bg-canvas-subtle flex items-center justify-between ${networkMode === 'connected_imports' ? 'text-proofline-ochre font-semibold bg-amber-50/50' : 'text-ink'}`}
              >
                <div>
                  <div className="font-medium">Connected Imports</div>
                  <div className="text-[11px] text-ink-steel">User-authorized connector ingestion.</div>
                </div>
                {networkMode === 'connected_imports' && <ShieldCheck className="w-3.5 h-3.5 text-proofline-ochre shrink-0 ml-2" />}
              </button>
            </div>
          )}
        </div>

        {/* Cryptographic Vault Lock Button */}
        <button
          onClick={onToggleVaultLock}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-[12px] font-medium transition-colors ${
            isVaultLocked 
              ? 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100' 
              : 'border-border-hairline text-ink hover:bg-canvas-subtle'
          }`}
          title={isVaultLocked ? 'Vault is locked. Keys zeroized from memory.' : 'Vault is unlocked. PBKDF2 / AES-GCM-256 active.'}
        >
          {isVaultLocked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-rose-800" />
              <span>Vault Locked</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-proofline-green" />
              <span>Vault Active</span>
            </>
          )}
        </button>

        {/* Model connection status chip */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-border-hairline hover:bg-canvas-subtle text-[12px] text-ink transition-colors"
          title="Inspect Local Inference Runtime"
        >
          {modelStatus.state === 'connected' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-proofline-green" />
              <span className="font-medium text-proofline-green">Gemma 4</span>
              <span className="text-ink-steel text-[11px]">({modelStatus.modelTag})</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="font-medium text-ink-slate">Deterministic Core</span>
            </>
          )}
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center gap-1 px-3 py-1 rounded-[4px] bg-ink text-white hover:bg-ink-light text-[12px] font-medium transition-colors shadow-subtle"
            aria-expanded={isExportMenuOpen}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Deliverables</span>
            <ChevronDown className="w-3 h-3 text-white/70 ml-0.5" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-1 w-60 bg-white border border-border-hairline rounded-[4px] shadow-modal py-1 z-50 text-[12px]">
              <div className="px-3 py-1 font-semibold text-[10px] text-ink-steel uppercase tracking-wider border-b border-border-hairline">
                Court &amp; Office Deliverables
              </div>
              <button
                onClick={() => { onExportMarkdown(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-canvas-subtle flex items-center gap-2 text-ink"
              >
                <FileText className="w-3.5 h-3.5 text-proofline-blue shrink-0" />
                <div>
                  <div className="font-medium">Court Brief (Markdown)</div>
                  <div className="text-[11px] text-ink-steel">With CEA 1995 s.9 Certificate of Authenticity</div>
                </div>
              </button>
              <button
                onClick={() => { onExportDocx(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-canvas-subtle flex items-center gap-2 text-ink"
              >
                <FileText className="w-3.5 h-3.5 text-proofline-ochre shrink-0" />
                <div>
                  <div className="font-medium">Word Document (DOCX / XML)</div>
                  <div className="text-[11px] text-ink-steel">With anchored footnotes &amp; citation table</div>
                </div>
              </button>
              <button
                onClick={() => { onExportBundle(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-canvas-subtle flex items-center gap-2 text-ink border-t border-border-hairline"
              >
                <Package className="w-3.5 h-3.5 text-proofline-green shrink-0" />
                <div>
                  <div className="font-medium">Encrypted Bundle (.proofline)</div>
                  <div className="text-[11px] text-ink-steel">Complete client matter archive with checksum</div>
                </div>
              </button>
              <button
                onClick={() => { onExportNotebook(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-canvas-subtle flex items-center gap-2 text-ink"
              >
                <BookOpen className="w-3.5 h-3.5 text-proofline-blue shrink-0" />
                <div>
                  <div className="font-medium">Obsidian Vault Notes (.md)</div>
                  <div className="text-[11px] text-ink-steel">Bidirectional wikilinks for evidence</div>
                </div>
              </button>
              <button
                onClick={() => { onExportCalendar(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-canvas-subtle flex items-center gap-2 text-ink"
              >
                <Calendar className="w-3.5 h-3.5 text-proofline-ochre shrink-0" />
                <div>
                  <div className="font-medium">Court Calendar (.ics)</div>
                  <div className="text-[11px] text-ink-steel">RFC 5545 statutory limitation deadlines</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-1 rounded-[4px] hover:bg-canvas-subtle text-ink-steel hover:text-ink transition-colors"
          aria-label="Matter & Model Settings"
          title="Matter & Model Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
