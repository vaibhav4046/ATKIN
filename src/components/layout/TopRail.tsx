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
  Smartphone
} from 'lucide-react';
import type { Matter, ModelStatus, NetworkMode } from '../../types/index';
import { Badge } from '../common/Badge';
import { AtkinLogo } from '../common/AtkinLogo';
import { BRAND, TERMINOLOGY } from '../../content/brand';

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
  onOpenPairing?: () => void;
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
  onOpenSettings,
  onOpenPairing
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isNetMenuOpen, setIsNetMenuOpen] = useState(false);

  return (
    // min-h rather than a fixed h: a long matter title plus the client and
    // "Active Matter" lines need ~64px, and a fixed 58px rail made that content
    // spill out of a sticky z-40 container and collide with the page beneath it.
    // min-h lets the rail grow with its content while keeping the intended
    // resting height for short titles. min-w-0 on the identity block is what
    // allows the title to wrap instead of forcing the rail wider than the
    // viewport.
    <div className="min-h-[58px] bg-atkin-surface border-b border-atkin-border px-6 py-2 flex items-center justify-between gap-4 sticky top-[52px] z-40 select-none text-atkin-ink">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex items-center shrink-0">
          <AtkinLogo className="w-8 h-8 rounded-[4px] border border-atkin-border shadow-xs" />
        </div>
        <div className="min-w-0">
          {/* min-w-0 so a long matter title can shrink and truncate. Without it
              this row refuses to shrink, pushes the badges right, and forces the
              rail taller than its own box. */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-[15px] font-semibold text-atkin-ink tracking-tight font-serif truncate" title={matter.title}>
              {matter.title}
            </h1>
            <span className="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded bg-atkin-bg border border-atkin-border text-atkin-muted">
              {matter.jurisdiction}
            </span>
            {matter.matterType && (
              <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-atkin-bg border border-atkin-border text-atkin-ink uppercase">
                {matter.matterType}
              </span>
            )}
            {(matter.isDemo || matter.id.includes('bates') || matter.id.includes('contract') || matter.id.includes('tenancy')) ? (
              <span className="shrink-0 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10.5px] font-mono font-medium">
                Demo Matter
              </span>
            ) : (
              <span className="shrink-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10.5px] font-mono font-medium">
                Private Matter
              </span>
            )}
          </div>
          <div className="text-[11px] text-atkin-muted mt-0.5 font-mono">
            Client: <span className="text-atkin-ink font-medium">{matter.clientAlias}</span> · Local device storage
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Network Broker Mode Button */}
        <div className="relative">
          <button
            onClick={() => setIsNetMenuOpen(!isNetMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-atkin-border hover:bg-atkin-bg text-[12px] text-atkin-ink transition-colors cursor-pointer"
            title="Sovereign Network Broker Egress Policy"
            aria-expanded={isNetMenuOpen}
          >
            {networkMode === 'offline' ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-atkin-ink" />
                <span className="font-medium">Offline (Local Loopback)</span>
              </>
            ) : networkMode === 'public_research' ? (
              <>
                <Globe className="w-3.5 h-3.5 text-atkin-ink" />
                <span className="font-medium">Public Research Allowed</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-medium">Connected Mode</span>
              </>
            )}
            <ChevronDown className="w-3 h-3 text-atkin-muted ml-0.5" />
          </button>

          {isNetMenuOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-atkin-surface border border-atkin-border rounded-[4px] shadow-lg py-1 z-50 text-[12px]">
              <div className="px-3 py-1 font-semibold text-[10px] text-atkin-muted uppercase tracking-wider border-b border-atkin-border">
                Network Policy Mode
              </div>
              <button
                onClick={() => { onChangeNetworkMode('offline'); setIsNetMenuOpen(false); }}
                className={`w-full px-3 py-2 text-left hover:bg-atkin-bg flex items-center justify-between cursor-pointer ${networkMode === 'offline' ? 'font-semibold bg-atkin-bg' : ''}`}
              >
                <div>
                  <div className="font-medium text-atkin-ink">Sovereign Offline</div>
                  <div className="text-[11px] text-atkin-muted">Strict local loopback compute.</div>
                </div>
                {networkMode === 'offline' && <ShieldCheck className="w-3.5 h-3.5 text-atkin-ink shrink-0 ml-2" />}
              </button>
              <button
                onClick={() => { onChangeNetworkMode('public_research'); setIsNetMenuOpen(false); }}
                className={`w-full px-3 py-2 text-left hover:bg-atkin-bg flex items-center justify-between cursor-pointer ${networkMode === 'public_research' ? 'font-semibold bg-atkin-bg' : ''}`}
              >
                <div>
                  <div className="font-medium text-atkin-ink">Public Research Whitelist</div>
                  <div className="text-[11px] text-atkin-muted">Statutes &amp; judgments research.</div>
                </div>
                {networkMode === 'public_research' && <ShieldCheck className="w-3.5 h-3.5 text-atkin-ink shrink-0 ml-2" />}
              </button>
              <button
                onClick={() => { onChangeNetworkMode('connected_imports'); setIsNetMenuOpen(false); }}
                className={`w-full px-3 py-2 text-left hover:bg-atkin-bg flex items-center justify-between cursor-pointer ${networkMode === 'connected_imports' ? 'font-semibold bg-atkin-bg' : ''}`}
              >
                <div>
                  <div className="font-medium text-atkin-ink">Connected Mode</div>
                  <div className="text-[11px] text-atkin-muted">External API gateways enabled.</div>
                </div>
                {networkMode === 'connected_imports' && <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-2" />}
              </button>
            </div>
          )}
        </div>

        {/* Cryptographic Vault Lock Button */}
        <button
          onClick={onToggleVaultLock}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-[12px] font-medium transition-colors cursor-pointer ${
            isVaultLocked 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400' 
              : 'border-atkin-border text-atkin-ink hover:bg-atkin-bg'
          }`}
          title={isVaultLocked ? 'Vault is locked. Keys zeroized from memory.' : 'Vault is unlocked. Local AES-GCM active.'}
        >
          {isVaultLocked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>Vault Locked</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-atkin-ink" />
              <span>Vault Active</span>
            </>
          )}
        </button>

        {/* Model connection status chip */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-atkin-border hover:bg-atkin-bg text-[12px] text-atkin-ink transition-colors cursor-pointer"
          title="Inspect Local Inference Runtime"
        >
          {modelStatus.state === 'connected' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span className="font-medium">Local Model</span>
              <span className="text-atkin-muted text-[11px]">({modelStatus.modelTag})</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-atkin-muted" />
              <span className="font-medium text-atkin-muted">Deterministic Core</span>
            </>
          )}
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center gap-1 px-3 py-1 rounded-[4px] bg-atkin-ink text-atkin-bg hover:opacity-90 text-[12px] font-medium transition-opacity shadow-sm cursor-pointer"
            aria-expanded={isExportMenuOpen}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-atkin-bg/70 ml-0.5" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-1 w-60 bg-atkin-surface border border-atkin-border rounded-[4px] shadow-lg py-1 z-50 text-[12px]">
              <div className="px-3 py-1 font-semibold text-[10px] text-atkin-muted uppercase tracking-wider border-b border-atkin-border">
                Export Deliverables
              </div>
              <button
                onClick={() => { onExportMarkdown(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-atkin-bg flex items-center gap-2 text-atkin-ink cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-atkin-ink shrink-0" />
                <div>
                  <div className="font-medium">Court Brief (Markdown)</div>
                  <div className="text-[11px] text-atkin-muted">With CPR 32 Statement of Truth</div>
                </div>
              </button>
              <button
                onClick={() => { onExportDocx(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-atkin-bg flex items-center gap-2 text-atkin-ink cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-atkin-ink shrink-0" />
                <div>
                  <div className="font-medium">Word Document (DOCX)</div>
                  <div className="text-[11px] text-atkin-muted">With footnotes &amp; citation table</div>
                </div>
              </button>
              <button
                onClick={() => { onExportBundle(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-atkin-bg flex items-center gap-2 text-atkin-ink border-t border-atkin-border cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-atkin-ink shrink-0" />
                <div>
                  <div className="font-medium">Encrypted Bundle (.atkin)</div>
                  <div className="text-[11px] text-atkin-muted">Complete matter archive with checksum</div>
                </div>
              </button>
              <button
                onClick={() => { onExportNotebook(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-atkin-bg flex items-center gap-2 text-atkin-ink cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-atkin-ink shrink-0" />
                <div>
                  <div className="font-medium">Obsidian Vault Notes (.md)</div>
                  <div className="text-[11px] text-atkin-muted">Bidirectional wikilinks for evidence</div>
                </div>
              </button>
              <button
                onClick={() => { onExportCalendar(); setIsExportMenuOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-atkin-bg flex items-center gap-2 text-atkin-ink cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-atkin-ink shrink-0" />
                <div>
                  <div className="font-medium">Court Calendar (.ics)</div>
                  <div className="text-[11px] text-atkin-muted">Statutory deadlines and hearings</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Device Pairing Button */}
        {onOpenPairing && (
          <button
            onClick={onOpenPairing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-atkin-border hover:bg-atkin-bg text-[12px] text-atkin-ink transition-colors cursor-pointer"
            title="Pair Mobile Companion (LAN)"
          >
            <Smartphone className="w-3.5 h-3.5 text-atkin-ink" />
            <span className="hidden sm:inline">Pair Phone</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-1 rounded-[4px] hover:bg-atkin-bg text-atkin-muted hover:text-atkin-ink transition-colors cursor-pointer border border-atkin-border"
          aria-label="Matter & Model Settings"
          title="Matter & Model Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
