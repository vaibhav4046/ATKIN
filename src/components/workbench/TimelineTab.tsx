import React from 'react';
import { 
  Calendar, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  Scale
} from 'lucide-react';
import type { Claim, Span, Document, ReviewItem } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface TimelineTabProps {
  matterId?: string;
  claims: Claim[];
  spans: Span[];
  documents: Document[];
  reviewItems?: ReviewItem[];
  onSelectSpan: (span: Span | null) => void;
}

interface TimelineEventItem {
  date: string;
  isoDate?: string;
  title: string;
  description: string;
  sourceName?: string;
  spanId?: string;
  isConflict?: boolean;
  isKeyStatutory?: boolean;
  badge?: string;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  matterId = '',
  claims,
  spans,
  documents,
  reviewItems = [],
  onSelectSpan
}) => {
  const spansById = new Map(spans.map(s => [s.id, s]));
  const docsById = new Map(documents.map(d => [d.id, d]));

  // Dynamically derive timeline events based on active matter
  let timelineEvents: TimelineEventItem[] = [];
  let contradictionCardData: {
    title: string;
    left: { badge: string; date: string; docName: string; quote: string; spanId?: string; lineLabel: string };
    right: { badge: string; date: string; docName: string; quote: string; spanId?: string; lineLabel: string };
    inquiryTitle: string;
    inquiryBody: string;
  } | null = null;

  if (matterId === 'matter-bates-postoffice-2019' || claims.some(c => c.id.includes('bates'))) {
    // Bates & Others v Post Office Ltd [2019] EWHC 3408 (QB)
    timelineEvents = [
      {
        date: '01 January 1994',
        isoDate: '1994-01-01',
        title: 'Execution of Standard Subpostmaster Contract (SPMC)',
        description: 'Subpostmasters engaged on standard non-negotiable written terms. Clause 12 purports to impose absolute liability to make good any deficiency on demand.',
        sourceName: 'Post_Office_Standard_Subpostmaster_Contract_SPMC_Sec12.txt',
        spanId: 'span-bates-06',
        isKeyStatutory: true,
        badge: 'UCTA 1977 Standard Terms'
      },
      {
        date: '14 October 2005',
        isoDate: '2005-10-14',
        title: 'Fujitsu Episteme Problem Investigation Report (PIN-188)',
        description: 'Fujitsu engineering logs confirm that network transmission timeouts between counter terminals and central Riposte cause duplicate batch writes and phantom £2,000+ discrepancies.',
        sourceName: 'Fujitsu_Services_PIN188_Problem_Investigation_Report.txt',
        spanId: 'span-bates-04',
        isConflict: true,
        badge: 'Systemic Bug PIN-188'
      },
      {
        date: '24 February 2010',
        isoDate: '2010-02-24',
        title: 'Post Office Security Division Policy Directive Memo',
        description: 'Internal security directive orders non-disclosure of Fujitsu Known Error Logs, noting disclosure would "fatally undermine" civil recoveries and ongoing prosecutions.',
        sourceName: 'Post_Office_Security_Division_Confidential_Memo_2010.txt',
        spanId: 'span-bates-08',
        isConflict: true,
        badge: 'CPR Part 31 Non-Disclosure'
      },
      {
        date: '16 December 2019',
        isoDate: '2019-12-16',
        title: 'High Court Judgment (No. 6) "Horizon Issues" [2019] EWHC 3408',
        description: 'Mr Justice Fraser rules that Fujitsu maintained unnotified remote access to branch accounts, that Bug 188 created phantom deficits, and that SPMC Clause 12 fails UCTA 1977 reasonableness.',
        sourceName: 'Bates_v_Post_Office_No6_Horizon_Issues_2019_EWHC_3408.txt',
        spanId: 'span-bates-01',
        isKeyStatutory: true,
        badge: 'Landmark Precedent'
      }
    ];

    contradictionCardData = {
      title: 'Adverse Factual Contradiction: Remote Access Denial vs Fujitsu Audit Log',
      left: {
        badge: 'Post Office Public Defense Posture',
        date: '24 February 2010',
        docName: 'Post_Office_Security_Division_Confidential_Memo_2010.txt',
        quote: 'Under no circumstances should Fujitsu Known Error Logs, including PIN 188 or SSC remote access procedures, be disclosed in civil or criminal proceedings without prior review. Disclosing that Fujitsu can remotely alter accounts would fatally undermine our civil debt recovery actions.',
        spanId: 'span-bates-08',
        lineLabel: 'Line 13'
      },
      right: {
        badge: 'Contemporaneous Fujitsu Engineering Report',
        date: '14 October 2005',
        docName: 'Fujitsu_Services_PIN188_Problem_Investigation_Report.txt',
        quote: 'Fujitsu SSC engineers routinely rectify these balancing errors by manually injecting journal entries directly into the branch Riposte table via SQL scripts from Bracknell without the subpostmaster\'s terminal displaying any notification.',
        spanId: 'span-bates-05',
        lineLabel: 'Line 18'
      },
      inquiryTitle: 'Litigator Assessment on Good Faith & Disclosure (CPR 31.6):',
      inquiryBody: 'Contemporaneous engineering records conclusively refute Post Office representations to the High Court that remote tampering was technically impossible. This establishes bad faith under Yam Seng [2013] and an egregious breach of standard disclosure under CPR Part 31.'
    };
  } else if (matterId === 'matter-novacorp-meridian-2026' || claims.some(c => c.id.includes('msa') || c.id.includes('pay30'))) {
    // NovaCorp v Meridian Cloud Technologies Ltd
    timelineEvents = [
      {
        date: '10 February 2026',
        isoDate: '2026-02-10',
        title: 'Master Cloud Services Agreement Executed',
        description: 'Section 4.2 stipulates that Customer shall pay all undisputed invoices within 30 days of invoice date.',
        sourceName: 'Master_Cloud_Services_Agreement_Meridian.pdf',
        spanId: 'span-msa-pay30',
        isKeyStatutory: false,
        badge: 'Section 4.2 Net 30'
      },
      {
        date: '10 February 2026',
        isoDate: '2026-02-10',
        title: 'Schedule B Order Form Invoicing Terms',
        description: 'Schedule B Payment Schedule provides that enterprise infrastructure fees are payable on Net 60-day terms from month-end statement.',
        sourceName: 'Master_Cloud_Services_Agreement_Meridian.pdf',
        spanId: 'span-msa-pay60',
        isConflict: true,
        badge: 'Schedule B Net 60'
      },
      {
        date: '15 February 2026',
        isoDate: '2026-02-15',
        title: 'First Cloud Service Provisioning & Initial Invoice',
        description: 'Meridian issues invoice INV-2026-01 under Section 4.2 Net 30 payment schedule, ignoring Schedule B Net 60 provision.',
        sourceName: 'Master_Cloud_Services_Agreement_Meridian.pdf',
        isKeyStatutory: false
      },
      {
        date: '11 January 2027',
        isoDate: '2027-01-11',
        title: 'Contractual 30-Day Non-Renewal Notice Deadline',
        description: 'Section 11.2 auto-renewal requires notice 30 days prior to 10 February 2027 expiry to prevent lock-in under uncapped indemnity terms.',
        sourceName: 'Master_Cloud_Services_Agreement_Meridian.pdf',
        isKeyStatutory: true,
        badge: 'Critical Deadline'
      }
    ];

    contradictionCardData = {
      title: 'Contractual Inconsistency: Payment Terms Section 4.2 vs Schedule B',
      left: {
        badge: 'MSA Main Body (Section 4.2)',
        date: '10 February 2026',
        docName: 'Master_Cloud_Services_Agreement_Meridian.pdf',
        quote: 'Customer shall pay all properly rendered and undisputed invoices within thirty (30) days of the invoice date.',
        spanId: 'span-msa-pay30',
        lineLabel: 'Section 4'
      },
      right: {
        badge: 'Schedule B (Payment Schedule)',
        date: '10 February 2026',
        docName: 'Master_Cloud_Services_Agreement_Meridian.pdf',
        quote: 'Enterprise infrastructure and compute charges are invoiced monthly in arrears, payable Net 60 days from statement date.',
        spanId: 'span-msa-pay60',
        lineLabel: 'Schedule B'
      },
      inquiryTitle: 'Commercial Negotiation Strategy (Order of Precedence):',
      inquiryBody: 'Section 14 lacks an express precedence clause dictating whether Schedules supersede the Agreement body. Recommend serving formal notice confirming Schedule B governs billing, and redlining Section 14 to give precedence to executed Order Forms.'
    };
  } else if (matterId === 'matter-thorne-tenancy-2026' || claims.some(c => c.id.includes('tenancy') || c.id.includes('deposit'))) {
    // Thorne v Highview Residential Properties Ltd
    timelineEvents = [
      {
        date: '01 September 2025',
        isoDate: '2025-09-01',
        title: 'Assured Shorthold Tenancy Agreement Starts',
        description: 'Dr. Thorne pays £1,650 security deposit to Highview Residential Properties Ltd.',
        sourceName: 'Tenancy_Agreement_Flat4B.pdf',
        spanId: 'span-tenancy-deposit-receipt',
        isKeyStatutory: true,
        badge: 'AST Commencement'
      },
      {
        date: '01 October 2025',
        isoDate: '2025-10-01',
        title: 'Statutory 30-Day Deposit Protection Deadline Breached',
        description: 'Landlord fails to protect deposit in an authorized scheme or serve prescribed information within 30 days. Triggers mandatory penalty under Housing Act 2004 s.214(4).',
        sourceName: 'Tenancy_Deposit_Scheme_Search_Certificate.pdf',
        spanId: 'span-tenancy-no-protection',
        isConflict: true,
        badge: 'Housing Act 2004 Breach'
      },
      {
        date: '14 March 2026',
        isoDate: '2026-03-14',
        title: 'MRICS Chartered Surveyor Inspection',
        description: 'Expert inspection identifies structural penetrating damp and Category 1 HHSRS mould hazard requiring immediate external flashing repairs under LTA 1985 s.11.',
        sourceName: 'Expert_Surveyor_Report_Damp_Mould.pdf',
        spanId: 'span-tenancy-surveyor-report',
        isKeyStatutory: true,
        badge: 'Category 1 Hazard'
      },
      {
        date: '16 March 2026',
        isoDate: '2026-03-16',
        title: 'Landlord Written Denial of Repair Liability',
        description: 'Managing agent asserts damp is caused by tenant lifestyle and refuses repairs. Directly contradicts surveyor findings and statutory repairing covenant.',
        sourceName: 'Managing_Agent_Correspondence_Highview.eml',
        spanId: 'span-tenancy-landlord-refusal',
        isConflict: true,
        badge: 'Adverse Contradiction'
      }
    ];

    contradictionCardData = {
      title: 'Adverse Contradiction: Landlord Lifestyle Blame vs Chartered Surveyor Audit',
      left: {
        badge: 'Managing Agent Correspondence',
        date: '16 March 2026',
        docName: 'Managing_Agent_Correspondence_Highview.eml',
        quote: 'The reported condensation is solely the result of tenant lifestyle, insufficient ventilation, and drying clothes indoors. No structural repairs will be authorized.',
        spanId: 'span-tenancy-landlord-refusal',
        lineLabel: 'Email'
      },
      right: {
        badge: 'Independent MRICS Survey Report',
        date: '14 March 2026',
        docName: 'Expert_Surveyor_Report_Damp_Mould.pdf',
        quote: 'Moisture ingress originates from defective exterior parapet flashing and blocked downpipes. The airborne spore count exceeds safety thresholds, constituting a Category 1 HHSRS hazard under the Housing Act 2004.',
        spanId: 'span-tenancy-surveyor-report',
        lineLabel: 'Survey § 4'
      },
      inquiryTitle: 'Pre-Action Housing Disrepair Protocol Assessment:',
      inquiryBody: 'Landlord is in clear breach of implied covenants under Landlord and Tenant Act 1985 s.11. Failure to protect deposit also bars service of any Section 21 eviction notice under Deregulation Act 2015 s.33.'
    };
  } else {
    // Default to Vance Consumer Dispute
    timelineEvents = [
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

    contradictionCardData = {
      title: 'Adverse Factual Contradiction: Defect Manifestation Date',
      left: {
        badge: 'Client Witness Account',
        date: '12 April 2026',
        docName: 'Client_Statement_Chronology.md',
        quote: 'The machine functioned normally until 12 April 2026, when the display abruptly turned black and the laptop suffered a complete power shutdown...',
        spanId: 'span-client-failure-date',
        lineLabel: 'Line 7'
      },
      right: {
        badge: 'Merchant Telephony Record',
        date: '08 April 2026',
        docName: 'Contradictory_Intake_Email_ZenithSupport.eml',
        quote: 'Customer stated that intermittent power cuts and system freezes occurred on 8 April 2026 during afternoon work...',
        spanId: 'span-intake-failure-date',
        lineLabel: 'Line 12'
      },
      inquiryTitle: 'Litigator Inquiry for Client Conference:',
      inquiryBody: 'Both 8 April and 12 April fall well within the 6-month statutory window (delivered 18 Jan 2026). However, did Ms. Vance experience minor intermittent glitches on 8 April prior to the final total shutdown on 12 April? Confirming this chronology eliminates any appearance of inconsistency before serving the Letter Before Claim.'
    };
  }

  return (
    <div className="space-y-6 max-w-[920px] mx-auto py-2">
      {/* Tab Header */}
      <div className="bg-white border border-border-hairline p-5 rounded-[6px] shadow-subtle">
        <h2 className="text-[16px] font-semibold text-ink">
          Matter Chronology &amp; Adverse Contradiction Discovery
        </h2>
        <p className="text-[12.5px] text-ink-slate mt-0.5">
          Juxtaposes incident event dates against disclosed document timestamps to isolate evidential inconsistencies.
        </p>
      </div>

      {/* Side-by-Side Contradiction Card */}
      {contradictionCardData && (
        <div className="bg-white border border-amber-300 rounded-[6px] p-5 shadow-subtle">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-[3px] bg-amber-100 text-amber-900 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="text-[12px] font-mono font-semibold text-amber-900 uppercase tracking-wider">
              {contradictionCardData.title}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
            {/* Left Column */}
            <div className="p-3.5 rounded-[4px] bg-canvas-subtle border border-border-hairline space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="blue" size="sm">{contradictionCardData.left.badge}</Badge>
                <span className="text-[11px] font-mono text-ink-steel">Date: {contradictionCardData.left.date}</span>
              </div>
              <div className="text-[12.5px] font-medium text-ink font-mono">
                {contradictionCardData.left.docName}
              </div>
              <blockquote className="text-[12px] text-ink-slate italic border-l-2 border-atkin-ink pl-2.5 my-1">
                "{contradictionCardData.left.quote}"
              </blockquote>
              {contradictionCardData.left.spanId && (
                <button
                  onClick={() => {
                    const s = spansById.get(contradictionCardData!.left.spanId!);
                    if (s) onSelectSpan(s);
                  }}
                  className="text-[11px] text-atkin-ink hover:underline font-medium flex items-center gap-1 pt-1"
                >
                  <span>Inspect Source Span ({contradictionCardData.left.lineLabel})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Right Column */}
            <div className="p-3.5 rounded-[4px] bg-canvas-subtle border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="ochre" size="sm">{contradictionCardData.right.badge}</Badge>
                <span className="text-[11px] font-mono text-ink-steel">Date: {contradictionCardData.right.date}</span>
              </div>
              <div className="text-[12.5px] font-medium text-ink font-mono">
                {contradictionCardData.right.docName}
              </div>
              <blockquote className="text-[12px] text-ink-slate italic border-l-2 border-amber-600 pl-2.5 my-1">
                "{contradictionCardData.right.quote}"
              </blockquote>
              {contradictionCardData.right.spanId && (
                <button
                  onClick={() => {
                    const s = spansById.get(contradictionCardData!.right.spanId!);
                    if (s) onSelectSpan(s);
                  }}
                  className="text-[11px] text-amber-900 hover:underline font-medium flex items-center gap-1 pt-1"
                >
                  <span>Inspect Source Span ({contradictionCardData.right.lineLabel})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Litigator Note */}
          <div className="mt-3.5 pt-3 border-t border-border-hairline flex items-start gap-2 text-[12px] text-ink-slate bg-amber-50/60 p-3 rounded-[4px] border border-amber-200">
            <HelpCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-ink block">{contradictionCardData.inquiryTitle}</span>
              <span>{contradictionCardData.inquiryBody}</span>
            </div>
          </div>
        </div>
      )}

      {/* Chronological Vertical Stepper */}
      <div className="bg-white border border-border-hairline rounded-[6px] p-5 shadow-subtle">
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
                    ? 'border-atkin-warning bg-atkin-warning/20' 
                    : evt.isKeyStatutory 
                    ? 'border-atkin-success bg-atkin-success/20' 
                    : 'border-border-hairline group-hover:border-atkin-ink'
                }`} 
              />

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-ink">
                    {evt.date}
                  </span>
                  {evt.badge && (
                    <Badge 
                      variant={evt.isConflict ? 'ochre' : evt.isKeyStatutory ? 'green' : 'neutral'} 
                      size="sm"
                    >
                      {evt.badge}
                    </Badge>
                  )}
                </div>
                {evt.sourceName && (
                  <span className="text-[11px] font-mono text-ink-steel">
                    {evt.sourceName}
                  </span>
                )}
              </div>

              <div className="text-[13px] font-medium text-ink mb-1">
                {evt.title}
              </div>
              <p className="text-[12px] text-ink-slate leading-relaxed">
                {evt.description}
              </p>

              {evt.spanId && (
                <button
                  onClick={() => {
                    const s = spansById.get(evt.spanId!);
                    if (s) onSelectSpan(s);
                  }}
                  className="text-[11px] text-atkin-ink hover:underline font-medium flex items-center gap-1 mt-1.5"
                >
                  <FileText className="w-3 h-3" />
                  <span>Inspect Linked Source Record</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
