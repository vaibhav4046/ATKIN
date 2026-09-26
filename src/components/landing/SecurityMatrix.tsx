import React from 'react';
import { Shield, Lock, Cpu, Database, Network, KeyRound } from 'lucide-react';

export const SecurityMatrix: React.FC = () => {
  return (
    <section id="security" className="py-24 px-4 sm:px-8 border-b border-atkin-border max-w-[1180px] mx-auto w-full select-none">
      <div className="space-y-3 max-w-[720px] pb-16">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] text-atkin-muted">
          <span className="font-semibold text-atkin-ink">04 GOVERNANCE</span>
          <span>/</span>
          <span>SOVEREIGN PRIVACY BOUNDARIES</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-atkin-ink tracking-tight font-normal leading-tight">
          Where client matter data lives and executes.
        </h2>
        <p className="text-[15px] text-atkin-muted leading-relaxed font-sans">
          Clear, verifiable architectural boundaries. No hidden telemetry, no training on client files, and explicit user control over compute.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Local Storage */}
        <div className="rounded-[8px] bg-atkin-surface border border-atkin-border p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-atkin-border pb-3">
            <div className="flex items-center gap-2 font-mono text-[12px] text-atkin-ink font-semibold">
              <Database className="w-4 h-4 text-atkin-ink" />
              <span>Matter Storage</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-atkin-bg border border-atkin-border text-atkin-muted">
              ON-DEVICE
            </span>
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-serif text-atkin-ink font-normal">
              Local SQLite &amp; IndexedDB
            </h4>
            <p className="text-[12.5px] text-atkin-muted leading-relaxed font-sans">
              All documents, source spans, fact ledgers, and conversation histories are persisted exclusively on your local workstation or device storage.
            </p>
          </div>
          <div className="pt-2 border-t border-atkin-border/60 text-[11px] font-mono text-atkin-muted space-y-1">
            <div>· WebCrypto AES-GCM vault encryption</div>
            <div>· Zero cloud database synchronization</div>
            <div>· Complete data export and purge controls</div>
          </div>
        </div>

        {/* Tier 2: Local Compute */}
        <div className="rounded-[8px] bg-atkin-surface border border-atkin-border p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-atkin-border pb-3">
            <div className="flex items-center gap-2 font-mono text-[12px] text-atkin-ink font-semibold">
              <Cpu className="w-4 h-4 text-atkin-ink" />
              <span>Model Execution</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-atkin-bg border border-atkin-border text-atkin-muted">
              LOOPBACK
            </span>
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-serif text-atkin-ink font-normal">
              Ollama &amp; Local Engines
            </h4>
            <p className="text-[12.5px] text-atkin-muted leading-relaxed font-sans">
              Run models on your hardware via local Ollama loopback (<code>127.0.0.1:11434</code>) or deterministic offline IRAC engines. Matter text never leaves your machine.
            </p>
          </div>
          <div className="pt-2 border-t border-atkin-border/60 text-[11px] font-mono text-atkin-muted space-y-1">
            <div>· Air-gapped capable mode</div>
            <div>· No external model provider training</div>
            <div>· Deterministic offline fallback engine</div>
          </div>
        </div>

        {/* Tier 3: Connected Services */}
        <div className="rounded-[8px] bg-atkin-surface border border-atkin-border p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-atkin-border pb-3">
            <div className="flex items-center gap-2 font-mono text-[12px] text-atkin-ink font-semibold">
              <KeyRound className="w-4 h-4 text-atkin-ink" />
              <span>Connected Services</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-atkin-bg border border-atkin-border text-atkin-muted">
              EXPLICIT OPT-IN
            </span>
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-serif text-atkin-ink font-normal">
              BYOK &amp; Direct Gateways
            </h4>
            <p className="text-[12.5px] text-atkin-muted leading-relaxed font-sans">
              Connect external frontier models only when explicitly configured. API keys remain stored locally in your browser/keyring and are never transmitted to ATKIN servers.
            </p>
          </div>
          <div className="pt-2 border-t border-atkin-border/60 text-[11px] font-mono text-atkin-muted space-y-1">
            <div>· Bring-your-own-key configuration</div>
            <div>· Ephemeral request broker</div>
            <div>· Live per-call audit visibility</div>
          </div>
        </div>
      </div>
    </section>
  );
};
