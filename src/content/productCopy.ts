/**
 * ATKIN Product Copy System
 * Hermes-level editorial narrative, sequential numbered chapters, and microcopy.
 */

export interface ProductChapter {
  number: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
}

export const PRODUCT_CHAPTERS: ProductChapter[] = [
  {
    number: '#01',
    tag: 'WORK',
    title: 'Your matter is the context.',
    subtitle: 'One matter. Every source. One place to think.',
    description: 'Documents, facts, conversations, deadlines and drafts stay together. Nothing leaks across client files.',
    highlights: ['Source-grounded facts', 'Interactive chronology', 'Pre-action issue tracking', 'Evidence graph']
  },
  {
    number: '#02',
    tag: 'REMEMBER',
    title: 'Keep the knowledge that matters.',
    subtitle: 'ATKIN remembers what matters.',
    description: 'ATKIN remembers approved preferences, matter facts and reusable workflows without mixing client matters.',
    highlights: ['5-layer isolation', 'Practice preferences', 'Matter memory ledger', 'Conflict detection']
  },
  {
    number: '#03',
    tag: 'RESEARCH',
    title: 'Research with a trail back to the source.',
    subtitle: 'Find authority. Keep the evidence.',
    description: 'Inspect authorities, keep findings with the matter and verify cited material before relying on it.',
    highlights: ['Open justice corpus', 'Case law & statute packs', 'Live research activity trace', 'Truthful abstention']
  },
  {
    number: '#04',
    tag: 'DRAFT',
    title: 'Draft beside the evidence.',
    subtitle: 'From source to working draft.',
    description: 'Work from source-linked material, keep versions and review text when its supporting source changes.',
    highlights: ['IRAC legal structure', 'Byte-level citation links', 'Source drift warning', 'Export to DOCX & Markdown']
  },
  {
    number: '#05',
    tag: 'CONNECT',
    title: 'Use the services you approve.',
    subtitle: 'Your tools. Under your control.',
    description: 'Connect tools and models explicitly. Keep permissions visible. Ingest files directly without cloud sync.',
    highlights: ['Model Context Protocol', 'Local Ollama & cloud providers', 'Direct file ingestion', 'Audit ledger']
  },
  {
    number: '#06',
    tag: 'MOVE',
    title: 'Your workspace, across your devices.',
    subtitle: 'Desktop power. Phone continuity.',
    description: 'Use the desktop as the primary private compute node and continue approved workflows from mobile.',
    highlights: ['Ed25519 pairing', 'Subnet peer inference', 'Android mobile companion', 'No cloud relay']
  }
];

import { ASSET_DIGESTS } from './assetDigests.generated';

const DEMO_CONTRACT = ASSET_DIGESTS.demoContractFixture;

export const PRODUCT_PROOF = {
  matterTitle: 'Alder Peak Systems Ltd',
  client: 'Highfield Logistics Group',
  question: 'What notice is required to terminate this agreement for convenience?',
  answer: '37 calendar days',
  explanation: 'Under Clause 3.2, either party may terminate by giving not less than 37 calendar days prior written notice to the other party.',
  sourceRef: 'test-contract-independent.txt',
  clauseRef: 'Clause 3.2',
  status: 'Citation verified',
  tag: 'Sample matter',
  contractFixture: {
    matter: 'Alder Peak Systems Ltd v Highfield Logistics Group Ltd',
    sourceDocument: 'test-contract-independent.txt',
    query: 'Does the agreement permit termination for convenience, and what notice is required?',
    verbatimQuote: 'Either party may terminate this Agreement without cause by giving not less than 37 days prior written notice to the other party.',
    clauseReference: 'Clause 3.2',
    lineOffset: 'Line 20',
    characterSpan: {
      start: 948,
      end: 1072,
    },
    sha256Digest: DEMO_CONTRACT.sha256,
    verificationStatus: 'Citation verified (exact byte match against the source span)',
    modelTag: 'atkin-sovereign-core',
    admissibilityNotice:
      'Quote verified byte-for-byte against the imported source. Admissibility is for the court to determine.',
  }
} as const;

/**
 * Download targets.
 *
 * Every href here was checked with a live HTTP request. Do not add a path that
 * has not been verified, and do not advertise a filename the link does not
 * serve: a download card that lies is worse than no download card.
 *
 * The Windows artifacts are published on the v1.0.0 GitHub release and still
 * carry the retired product name inside the published asset filenames. The
 * displayed name below is the real asset name, not the intended one.
 */
export const DOWNLOAD_OPTIONS = [
  {
    platform: 'Windows',
    requirement: 'Windows 10 / 11 (x64)',
    title: 'ATKIN for Windows',
    filename: 'Atkin_1.0.0_x64-setup.exe',
    badge: 'Desktop App',
    href: 'https://github.com/vaibhav4046/ATKIN/releases/download/v1.0.0/Atkin_1.0.0_x64-setup.exe',
    primary: true
  },
  {
    platform: 'Windows',
    requirement: 'Windows 10 / 11 (x64) · MSI for managed deployment',
    title: 'ATKIN for Windows (MSI)',
    filename: 'Atkin_1.0.0_x64_en-US.msi',
    badge: 'Enterprise Deploy',
    href: 'https://github.com/vaibhav4046/ATKIN/releases/download/v1.0.0/Atkin_1.0.0_x64_en-US.msi',
    primary: false
  },
  {
    platform: 'Android',
    requirement: 'Android 12+ (Mobile Companion)',
    title: 'ATKIN Mobile APK',
    filename: 'Atkin-1.0.0-universal.apk',
    badge: 'Mobile Companion',
    href: 'https://github.com/vaibhav4046/ATKIN/releases/download/v1.0.0/Atkin-1.0.0-universal.apk',
    primary: false
  },
  {
    platform: 'Terminal / Source',
    requirement: 'Node.js 20+ · Rust 1.80+',
    title: 'Build from Source',
    filename: 'git clone + npm run tauri',
    badge: 'Open Source',
    href: 'https://github.com/vaibhav4046/ATKIN',
    primary: false
  }
] as const;
