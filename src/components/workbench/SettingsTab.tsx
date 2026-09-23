import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  Check, 
  Terminal, 
  AlertCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import type { ModelStatus } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface SettingsTabProps {
  modelStatus: ModelStatus;
  onRefreshModel: () => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  modelStatus,
  onRefreshModel
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshModel();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[920px] mx-auto py-2">
      {/* Header */}
      <div className="bg-gallery-white border border-border-hairline p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" size="sm">Local-First Architecture</Badge>
            <Badge variant={modelStatus.state === 'connected' ? 'green' : 'slate'} size="sm">
              {modelStatus.state === 'connected' ? 'Local Gemma Connected' : 'Deterministic Offline Mode'}
            </Badge>
          </div>
          <h2 className="text-[17px] font-semibold text-ink">
            Model Diagnostics &amp; Security Boundaries
          </h2>
          <p className="text-[12px] text-ink-slate mt-0.5">
            Manage local Ollama bridge, detect Gemma 4 tags, and verify zero-cloud data containment.
          </p>
        </div>

        <button
          disabled={isRefreshing}
          onClick={handleRefresh}
          className="text-[12px] font-medium px-3.5 py-1.5 rounded-full-pill bg-gallery-paper border border-border-hairline hover:bg-gallery-mist text-ink transition-colors flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Test Connection</span>
        </button>
      </div>

      {/* Model Status Card */}
      <div className="bg-gallery-white border border-border-hairline rounded-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${modelStatus.state === 'connected' ? 'bg-proofline-green animate-pulse' : 'bg-ink-steel'}`} />
            <h3 className="text-[15px] font-semibold text-ink">
              {modelStatus.state === 'connected' ? 'Ollama Bridge: Connected' : 'Ollama Bridge: Offline / Disconnected'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-ink-steel">
            Endpoint: {modelStatus.endpoint}
          </span>
        </div>

        {modelStatus.errorMessage && (
          <div className="p-3 bg-gallery-mist/80 rounded-xl border border-border-hairline text-[12px] text-ink-slate flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-ink-steel shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-ink">Connection Status:</span>
              <span>{modelStatus.errorMessage}</span>
            </div>
          </div>
        )}

        {/* Diagnostic Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[12px]">
          <div className="p-3 bg-gallery-paper rounded-xl border border-border-hairline">
            <div className="text-ink-steel text-[11px]">Active Model Tag</div>
            <div className="font-mono font-medium text-ink mt-0.5">{modelStatus.modelTag}</div>
          </div>
          <div className="p-3 bg-gallery-paper rounded-xl border border-border-hairline">
            <div className="text-ink-steel text-[11px]">Loopback Latency</div>
            <div className="font-mono font-medium text-ink mt-0.5">
              {modelStatus.latencyMs ? `${modelStatus.latencyMs} ms` : 'N/A (Offline)'}
            </div>
          </div>
          <div className="p-3 bg-gallery-paper rounded-xl border border-border-hairline">
            <div className="text-ink-steel text-[11px]">Detected Installed Tags</div>
            <div className="font-mono font-medium text-ink mt-0.5">
              {modelStatus.detectedTags.length > 0 ? modelStatus.detectedTags.join(', ') : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Copyable Setup Terminal Commands */}
      <div className="bg-gallery-white border border-border-hairline rounded-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-proofline-blue" />
          <h3 className="text-[15px] font-semibold text-ink">
            Local Gemma 4 Setup Commands (Ollama)
          </h3>
        </div>
        <p className="text-[13px] text-ink-slate leading-relaxed">
          To run live inference locally on your machine with Google’s Gemma 4 model, execute the following commands in your terminal:
        </p>

        <div className="space-y-2 font-mono text-[12px]">
          <div className="p-3 bg-gallery-paper border border-border-hairline rounded-xl flex items-center justify-between">
            <code>ollama pull gemma4:e4b</code>
            <button
              onClick={() => handleCopy('ollama pull gemma4:e4b')}
              className="text-proofline-blue hover:underline flex items-center gap-1 text-[11px]"
            >
              {copiedCmd === 'ollama pull gemma4:e4b' ? <Check className="w-3 h-3 text-proofline-green" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCmd === 'ollama pull gemma4:e4b' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3 bg-gallery-paper border border-border-hairline rounded-xl flex items-center justify-between">
            <code>ollama serve</code>
            <button
              onClick={() => handleCopy('ollama serve')}
              className="text-proofline-blue hover:underline flex items-center gap-1 text-[11px]"
            >
              {copiedCmd === 'ollama serve' ? <Check className="w-3 h-3 text-proofline-green" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCmd === 'ollama serve' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-ink-steel">
          Supported variants on RTX 3050 (6GB VRAM): <code>gemma4:e2b</code> (lightweight, ~2GB VRAM), <code>gemma4:e4b</code> (recommended, ~3.8GB VRAM).
        </div>
      </div>

      {/* Honest Hosted Web App vs Local Build Architecture Disclosure */}
      <div className="bg-gallery-white border border-border-hairline rounded-card p-6 shadow-xs space-y-3 text-[13px]">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <Lock className="w-4 h-4 text-proofline-green" />
          <span>Zero-Cloud Privacy &amp; Deployment Truth</span>
        </div>
        <div className="space-y-2 text-ink-slate leading-relaxed">
          <p>
            <strong>Hosted Web Demo:</strong> When visiting Proofline on a public web URL, standard browser cross-origin security prevents a remote website from directly reaching a visitor’s private <code>127.0.0.1:11434</code> without a companion desktop agent. Therefore, the public hosted version operates strictly in <strong>Verified Deterministic Offline Mode</strong> on synthetic matter data.
          </p>
          <p>
            <strong>Local Build:</strong> When running Proofline locally (`npm run dev`), the local development server binds strictly to loopback (`127.0.0.1`), enabling seamless, private requests to your local Ollama runtime. Case documents never leave your physical device.
          </p>
        </div>
      </div>
    </div>
  );
};
