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
  BookOpen
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
    <div className="h-[64px] bg-gallery-white border-b border-border-hairline px-6 flex items-center justify-between sticky top-[44px] z-40">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[17px] font-semibold text-ink tracking-tight">
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
                Synthetic Sample
              </Badge>
            )}
          </div>
          <div className="text-[12px] text-ink-steel">
            Client: <span className="text-ink font-medium">{matter.clientAlias}</span> · Sovereign Workspace
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Network Broker Mode Pill */}
        <div className="relative">
          <button
            onClick={() => setIsNetMenuOpen(!isNetMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full-pill border border-border-hairline hover:bg-gallery-mist text-[12px] text-ink transition-colors"
            title="Sovereign Network Broker Egress Policy"
          >
            {networkMode === 'offline' ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-proofline-green" />
                <span className="font-semibold text-proofline-green">Sovereign Offline</span>
              </>
            ) : networkMode === 'public_research' ? (
              <>
                <Globe className="w-3.5 h-3.5 text-proofline-blue" />
                <span className="font-medium text-proofline-blue">Research Whitelist</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-proofline-ochre" />
                <span className="font-medium text-proofline-ochre">Connected Imports</span>
              </>
            )}
            <ChevronDown className="w-3 h-3 text-ink-steel ml-0.5" />
          </button>

          {isNetMenuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-gallery-white border border-border-hairline rounded-card shadow-modal py-1.5 z-50 text-[12px]">
              <div className="px-3 py-1 font-semibold text-[11px] text-ink-steel uppercase tracking-wider">
                Egress Broker Mode
              </div>
              <button
                onClick={() => { onChangeNetworkMode('offline'); setIsNetMenuOpen(false); }}
                className={`w-full px-3 py-2 text-left hover:bg-gallery-mist flex items-center justify-between ${networkMode === 'offline' ? 'text-proofline-green font-semibold' : 'text-ink'}`}
              >
                <span>Sovereign (0% Egress)</span>
                {networkMode === 'offline' && <ShieldCheck className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { onChangeNetworkMode('public_research'); setIsNetMenuOpen(false); }}
                className={`w-full px-3 py-2 text-left hover:bg-gallery-mist flex items-center justify-between ${networkMode === 'public_research' ? 'text-proofline-blue font-semibold' : 'text-ink'}`}
              >
                <span>Legal Research Only</span>
                {networkMode === 'public_research' && <ShieldCheck className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { onChangeNetworkMode('connected_imports'); setIsNetMenuOpen(false); }}
                className={`w-full px-3 py-2 text-left hover:bg-gallery-mist flex items-center justify-between ${networkMode === 'connected_imports' ? 'text-proofline-ochre font-semibold' : 'text-ink'}`}
              >
                <span>OAuth Connectors Mode</span>
                {networkMode === 'connected_imports' && <ShieldCheck className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Cryptographic Vault Lock Pill */}
        <button
          onClick={onToggleVaultLock}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full-pill border text-[12px] font-medium transition-colors ${
            isVaultLocked 
              ? 'bg-proofline-crimson/10 border-proofline-crimson/30 text-proofline-crimson hover:bg-proofline-crimson/20' 
              : 'border-border-hairline text-ink hover:bg-gallery-mist'
          }`}
          title={isVaultLocked ? 'Vault is locked. Keys wiped from memory.' : 'Vault is unlocked. PBKDF2 / AES-GCM-256 active.'}
        >
          {isVaultLocked ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Vault Locked</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-proofline-green" />
              <span>Vault Unlocked</span>
            </>
          )}
        </button>

        {/* Model connection status chip */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full-pill border border-border-hairline hover:bg-gallery-mist text-[12px] text-ink transition-colors"
          title="Inspect Local Ollama connection"
        >
          {modelStatus.state === 'connected' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-proofline-green animate-pulse" />
              <span className="font-medium text-proofline-green">Local Gemma 4</span>
              <span className="text-ink-steel text-[11px]">({modelStatus.modelTag})</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-ink-steel" />
              <span className="font-medium text-ink-slate">Deterministic Core</span>
            </>
          )}
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full-pill bg-ink text-white hover:bg-ink/85 text-[12px] font-medium transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-white/70" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-gallery-white border border-border-hairline rounded-card shadow-modal py-1.5 z-50 text-[12px]">
              <button
                onClick={() => { onExportMarkdown(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-gallery-mist flex items-center gap-2 text-ink"
              >
                <FileText className="w-3.5 h-3.5 text-proofline-blue" />
                <span>Markdown Brief &amp; Index</span>
              </button>
              <button
                onClick={() => { onExportDocx(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-gallery-mist flex items-center gap-2 text-ink"
              >
                <FileText className="w-3.5 h-3.5 text-proofline-ochre" />
                <span>Word Document (DOCX / XML)</span>
              </button>
              <button
                onClick={() => { onExportBundle(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-gallery-mist flex items-center gap-2 text-ink border-t border-border-hairline/60"
              >
                <Package className="w-3.5 h-3.5 text-proofline-green" />
                <span>Encrypted Bundle (.proofline)</span>
              </button>
              <button
                onClick={() => { onExportNotebook(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-gallery-mist flex items-center gap-2 text-ink"
              >
                <BookOpen className="w-3.5 h-3.5 text-proofline-blue" />
                <span>Knowledge Notebook (.md)</span>
              </button>
              <button
                onClick={() => { onExportCalendar(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-gallery-mist flex items-center gap-2 text-ink"
              >
                <Calendar className="w-3.5 h-3.5 text-proofline-ochre" />
                <span>Court Deadlines (.ics)</span>
              </button>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-full hover:bg-gallery-mist text-ink-slate hover:text-ink transition-colors"
          aria-label="Settings"
          title="Matter & Model Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
