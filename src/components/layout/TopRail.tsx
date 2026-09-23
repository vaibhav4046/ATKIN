import React from 'react';
import { Download, Cpu, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react';
import type { Matter, ModelStatus } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface TopRailProps {
  matter: Matter;
  modelStatus: ModelStatus;
  onExport: () => void;
  onOpenSettings: () => void;
}

export const TopRail: React.FC<TopRailProps> = ({
  matter,
  modelStatus,
  onExport,
  onOpenSettings
}) => {
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
            {matter.isDemo && (
              <Badge variant="ochre" size="sm">
                Synthetic Sample
              </Badge>
            )}
          </div>
          <div className="text-[12px] text-ink-steel">
            Client: <span className="text-ink font-medium">{matter.clientAlias}</span> · Ref: EV-8812
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Model connection mode indicator */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full-pill border border-border-hairline hover:bg-gallery-mist text-[12px] text-ink transition-colors"
          title="Click to inspect model connection diagnostics"
        >
          {modelStatus.state === 'connected' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-proofline-green animate-pulse" />
              <span className="font-medium text-proofline-green">Local Gemma 4 Connected</span>
              <span className="text-ink-steel text-[11px]">({modelStatus.modelTag})</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-ink-steel" />
              <span className="font-medium text-ink-slate">Offline Mode (Deterministic Verifier)</span>
            </>
          )}
        </button>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full-pill bg-ink text-white hover:bg-ink/85 text-[12px] font-medium transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Markdown &amp; Index</span>
        </button>

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
