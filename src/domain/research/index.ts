/**
 * ATKIN Domain - Legal Research V2
 * Sections 14, 16, 18: Authoritative query parsing, primary law preference, and contrary authority synthesis
 */

export interface LegalResearchQuery {
  id: string;
  matterId: string;
  question: string;
  jurisdiction: string;
  asOfDate?: string;
  allowSecondarySources: boolean;
  status: 'planning' | 'searching' | 'opening' | 'reading' | 'checking' | 'comparing' | 'verifying' | 'synthesising' | 'completed';
}

export interface LegalResearchReport {
  id: string;
  matterId: string;
  question: string;
  shortAnswer: string;
  keyAuthorities: Array<{ citation: string; summary: string; officialUrl: string }>;
  contraryAuthorities: Array<{ citation: string; distinguishingFeature: string }>;
  analysis: string;
  uncertainties: string[];
  furtherEvidenceNeeded: string[];
  verifiedAt: string;
}
