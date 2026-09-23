import React from 'react';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Badge } from '../common/Badge.tsx';

interface FeatureStageProps {
  onOpenWorkbench: () => void;
}

export const FeatureStage: React.FC<FeatureStageProps> = ({ onOpenWorkbench }) => {
  return (
    <div className="w-full max-w-[1180px] mx-auto bg-gallery-white border border-border-hairline rounded-card shadow-stage overflow-hidden">
      {/* Mini App Header Mockup */}
      <div className="h-11 bg-gallery-paper border-b border-border-hairline px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-border-hairline" />
            <div className="w-2.5 h-2.5 rounded-full bg-border-hairline" />
            <div className="w-2.5 h-2.5 rounded-full bg-border-hairline" />
          </div>
          <span className="text-[11px] font-mono text-ink-steel pl-2">
            Proofline Workbench · Vance v ZenithTech Retail Ltd (England and Wales)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="ochre" size="sm">
            1 Contradiction Detected
          </Badge>
          <Badge variant="green" size="sm">
            Deterministic Verifier Active
          </Badge>
        </div>
      </div>

      {/* Interactive Workbench Stage Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left Mini Sidebar (3 cols) */}
        <div className="lg:col-span-3 bg-gallery-mist/40 border-r border-border-hairline p-3.5 space-y-3 hidden sm:block">
          <div className="text-[11px] font-semibold text-ink-steel uppercase tracking-wider">
            Evidence Files (5)
          </div>
          <div className="space-y-1.5 text-[12px]">
            <div className="p-2 rounded-lg bg-gallery-white border border-border-hairline font-medium text-ink shadow-xs">
              📄 Receipt_INV-8492.txt
            </div>
            <div className="p-2 rounded-lg bg-gallery-white border border-border-hairline font-medium text-ink shadow-xs">
              📝 Client_Statement.md
            </div>
            <div className="p-2 rounded-lg bg-proofline-ochre/10 border border-proofline-ochre/30 font-medium text-proofline-ochre">
              ⚠️ Intake_CRM_CALL4491.eml
            </div>
            <div className="p-2 rounded-lg bg-gallery-white border border-border-hairline font-medium text-ink shadow-xs">
              🔬 Service_Report_Apex.txt
            </div>
          </div>

          <div className="pt-4 border-t border-border-hairline/80 text-[11px] text-ink-steel">
            <span className="font-semibold text-ink block">Legal Authority:</span>
            Consumer Rights Act 2015 s.19(14)
          </div>
        </div>

        {/* Center Live Contradiction Card (6 cols) */}
        <div className="lg:col-span-6 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="ochre" size="sm">
                Adverse Evidence Comparison
              </Badge>
              <span className="text-[12px] font-mono text-ink-steel">
                Defect Onset Discrepancy
              </span>
            </div>

            <h3 className="text-xl font-semibold text-ink tracking-tight">
              Client Recalled Date vs Internal Support Telephony Log
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] pt-1">
              <div className="p-3 rounded-xl bg-gallery-mist border border-border-hairline space-y-1.5">
                <span className="text-proofline-blue font-semibold block">Client Chronology:</span>
                <p className="text-ink-slate italic">
                  "...until <mark className="bg-proofline-blue/20 text-ink px-1 rounded">12 April 2026</mark>, when the display turned black..."
                </p>
                <div className="text-[10px] text-ink-steel font-mono">Statement #L7</div>
              </div>

              <div className="p-3 rounded-xl bg-proofline-ochre/10 border border-proofline-ochre/25 space-y-1.5">
                <span className="text-proofline-ochre font-semibold block">Support Intake Log:</span>
                <p className="text-ink-slate italic">
                  "...customer telephoned on <mark className="bg-proofline-ochre/25 text-ink px-1 rounded">8 April 2026</mark> reporting freezes..."
                </p>
                <div className="text-[10px] text-proofline-ochre font-mono">Call #CALL-4491 L12</div>
              </div>
            </div>

            <div className="p-3 bg-gallery-mist/60 rounded-xl text-[12px] text-ink-slate flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-proofline-green shrink-0 mt-0.5" />
              <span>
                <strong>Audit Finding:</strong> Both dates establish breach well within the 6-month statutory presumption under CRA 2015 s.19(14). Discrepancy flagged for pre-action confirmation.
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-border-hairline flex items-center justify-between">
            <button
              onClick={onOpenWorkbench}
              className="text-[13px] font-medium text-proofline-blue hover:text-proofline-navy flex items-center gap-1.5"
            >
              <span>Explore full matter workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-ink-steel">
              Zero cloud transmission
            </span>
          </div>
        </div>

        {/* Right Live Inspector Preview (3 cols) */}
        <div className="lg:col-span-3 bg-gallery-paper border-l border-border-hairline p-4 space-y-3 hidden sm:flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold text-ink-steel uppercase tracking-wider">
              Grounded Span Inspector
            </div>

            <div className="p-3 rounded-lg bg-gallery-white border border-border-hairline space-y-2 text-[12px]">
              <div className="flex items-center gap-1.5 text-proofline-green font-medium text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Byte Checksum Verified</span>
              </div>
              <p className="text-ink font-mono text-[11px] leading-relaxed">
                chk-intk-01 (L12)
              </p>
              <div className="text-ink-slate text-[11px]">
                "Customer stated intermittent power cuts occurred on 8 April 2026..."
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-gallery-white border border-border-hairline text-[11px] space-y-1 text-ink-steel">
              <div className="flex justify-between">
                <span>Presumption:</span>
                <span className="text-proofline-green font-medium">CRA s.19(14)</span>
              </div>
              <div className="flex justify-between">
                <span>Burden:</span>
                <span className="text-ink">On Trader</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-ink-steel text-center pt-2 border-t border-border-hairline">
            Proofline Verifier v1.0
          </div>
        </div>
      </div>
    </div>
  );
};
