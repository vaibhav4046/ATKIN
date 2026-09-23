import React from 'react';
import { 
  Calendar, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';
import type { Claim, Span, Document } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface TimelineTabProps {
  claims: Claim[];
  spans: Span[];
  documents: Document[];
  onSelectSpan: (span: Span | null) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  claims,
  spans,
  documents,
  onSelectSpan
}) => {
  const spansById = new Map(spans.map(s => [s.id, s]));
  const docsById = new Map(documents.map(d => [d.id, d]));

  // Chronological event timeline
  const timelineEvents = [
    {
      date: '15 January 2026',
      isoDate: '2026-01-15',
      title: 'Contract of Sale & Full Payment (£1,499.00)',
      description: 'Eleanor Vance purchased ZenithBook Pro 15 (Serial #ZB-99281-UK) from ZenithTech Retail Ltd.',
      sourceName: 'Receipt_Invoice_INV-8492.txt',
      spanId: 'span-receipt-purchase-delivery',
      isKeyStatutory: false
    },
    {
      date: '18 January 2026',
      isoDate: '2026-01-18',
      title: 'Delivery of Goods (Statutory Trigger Date)',
      description: 'Device delivered to client residence. Triggers commencement of the 6-month statutory presumption under Consumer Rights Act 2015 s.19(14).',
      sourceName: 'Receipt_Invoice_INV-8492.txt',
      spanId: 'span-receipt-purchase-delivery',
      isKeyStatutory: true,
      badge: 'CRA 2015 Presumption Starts'
    },
    {
      date: '08 April 2026',
      isoDate: '2026-04-08',
      title: 'Merchant Telephony Intake Log (#CALL-4491)',
      description: 'ZenithTech CRM records client telephoning to report intermittent power cuts and freezing during afternoon work. Agent advised Safe Mode reboot.',
      sourceName: 'Contradictory_Intake_Email_ZenithSupport.eml',
      spanId: 'span-intake-failure-date',
      isConflict: true,
      badge: 'Contradiction: Date Onset'
    },
    {
      date: '12 April 2026',
      isoDate: '2026-04-12',
      title: 'Client Recalled Total Power Collapse',
      description: 'Client witness chronology recounts screen flickering black and permanent failure to reboot while drafting research.',
      sourceName: 'Client_Statement_Chronology.md',
      spanId: 'span-client-failure-date',
      isConflict: true,
      badge: 'Contradiction: Date Onset'
    },
    {
      date: '22 April 2026',
      isoDate: '2026-04-22',
      title: 'Merchant Rejection of Liability',
      description: 'ZenithTech customer support asserts 30-day return policy expired and demands £120 inspection fee contrary to CRA 2015 s.23.',
      sourceName: 'Merchant_Correspondence_ZenithTech.eml',
      spanId: 'span-merchant-rejection',
      isKeyStatutory: false
    },
    {
      date: '28 April 2026',
      isoDate: '2026-04-28',
      title: 'Independent Forensic Inspection (Apex Report APX-2026-9041)',
      description: 'Chartered engineer confirms latent micro-fractures in VRM solder array present at delivery. Rebuts customer misuse.',
      sourceName: 'Service_Report_ApexRepair.txt',
      spanId: 'span-service-defect',
      isKeyStatutory: true,
      badge: 'Conclusive Forensics'
    }
  ];

  return (
    <div className="space-y-6 max-w-[920px] mx-auto py-2">
      {/* Tab Header */}
      <div className="bg-gallery-white border border-border-hairline p-5 rounded-2xl shadow-xs">
        <h2 className="text-[17px] font-semibold text-ink">
          Matter Chronology &amp; Contradiction Comparison
        </h2>
        <p className="text-[13px] text-ink-slate mt-1">
          Juxtaposes incident event dates against document creation timestamps to isolate evidential inconsistencies.
        </p>
      </div>

      {/* Side-by-Side Contradiction Card */}
      <div className="bg-gallery-white border border-proofline-ochre/40 rounded-card p-6 shadow-sm ring-1 ring-proofline-ochre/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-proofline-ochre/15 text-proofline-ochre flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <span className="text-[13px] font-semibold text-proofline-ochre uppercase tracking-wider">
            Adverse Factual Contradiction: Defect Manifestation Date
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Left Column: Client Statement */}
          <div className="p-4 rounded-xl bg-gallery-paper border border-border-hairline space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="blue" size="sm">Client Witness Account</Badge>
              <span className="text-[11px] font-mono text-ink-steel">Date: 12 April 2026</span>
            </div>
            <div className="text-[13px] font-medium text-ink">
              Client_Statement_Chronology.md
            </div>
            <blockquote className="text-[12px] text-ink-slate italic border-l-2 border-proofline-blue pl-2.5 my-1">
              "The machine functioned normally until 12 April 2026, when the display abruptly turned black and the laptop suffered a complete power shutdown..."
            </blockquote>
            <button
              onClick={() => {
                const s = spansById.get('span-client-failure-date');
                if (s) onSelectSpan(s);
              }}
              className="text-[11px] text-proofline-blue hover:underline font-medium flex items-center gap-1 pt-1"
            >
              <span>Inspect Source Span (Line 7)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Right Column: Merchant Intake Log */}
          <div className="p-4 rounded-xl bg-gallery-paper border border-proofline-ochre/30 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="ochre" size="sm">Merchant Telephony Record</Badge>
              <span className="text-[11px] font-mono text-ink-steel">Date: 08 April 2026</span>
            </div>
            <div className="text-[13px] font-medium text-ink">
              Contradictory_Intake_Email_ZenithSupport.eml
            </div>
            <blockquote className="text-[12px] text-ink-slate italic border-l-2 border-proofline-ochre pl-2.5 my-1">
              "Customer stated that intermittent power cuts and system freezes occurred on 8 April 2026 during afternoon work..."
            </blockquote>
            <button
              onClick={() => {
                const s = spansById.get('span-intake-failure-date');
                if (s) onSelectSpan(s);
              }}
              className="text-[11px] text-proofline-ochre hover:underline font-medium flex items-center gap-1 pt-1"
            >
              <span>Inspect Source Span (Line 12)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Neutral Inquiry & Tactical Litigator Note */}
        <div className="mt-4 pt-3 border-t border-border-hairline flex items-start gap-2.5 text-[12px] text-ink-slate bg-gallery-mist/50 p-3 rounded-xl">
          <HelpCircle className="w-4 h-4 text-ink-steel shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-ink block">Litigator Inquiry for Client Conference:</span>
            <span>
              Both 8 April and 12 April fall well within the 6-month statutory window (delivered 18 Jan 2026). However, did Ms. Vance experience minor intermittent glitches on 8 April prior to the final total shutdown on 12 April? Confirming this chronology eliminates any appearance of inconsistency before serving the Letter Before Claim.
            </span>
          </div>
        </div>
      </div>

      {/* Chronological Vertical Stepper */}
      <div className="bg-gallery-white border border-border-hairline rounded-card p-6 shadow-xs">
        <h3 className="text-[15px] font-semibold text-ink mb-6">
          Master Event Timeline
        </h3>

        <div className="relative pl-6 border-l-2 border-border-control space-y-7 ml-3">
          {timelineEvents.map((evt, idx) => (
            <div key={idx} className="relative group">
              {/* Stepper node */}
              <div 
                className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white transition-colors ${
                  evt.isConflict 
                    ? 'border-proofline-ochre bg-proofline-ochre/20' 
                    : evt.isKeyStatutory 
                    ? 'border-proofline-green bg-proofline-green/20' 
                    : 'border-border-hairline group-hover:border-proofline-blue'
                }`} 
              />

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-ink">
                    {evt.date}
                  </span>
                  {evt.badge && (
                    <Badge variant={evt.isConflict ? 'ochre' : 'green'} size="sm">
                      {evt.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] font-mono text-ink-steel">
                  {evt.isoDate}
                </span>
              </div>

              <div className="text-[14px] font-medium text-ink">
                {evt.title}
              </div>

              <p className="text-[13px] text-ink-slate mt-0.5 leading-relaxed">
                {evt.description}
              </p>

              <button
                onClick={() => {
                  const s = spansById.get(evt.spanId);
                  if (s) onSelectSpan(s);
                }}
                className="mt-2 text-[11px] text-proofline-blue hover:underline font-mono flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                <span>Source: {evt.sourceName}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
