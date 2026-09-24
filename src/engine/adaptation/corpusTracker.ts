import type { 
  CorpusManifestSummary, 
  CorpusCollectionMetrics 
} from '../../types/index.ts';

export const PRIMARY_LEGAL_COLLECTIONS: CorpusCollectionMetrics[] = [
  {
    collectionId: 'col-uk-legislation',
    name: 'UK Legislation Primary Law (legislation.gov.uk)',
    jurisdiction: 'England and Wales',
    licence: 'Open Government Licence v3.0',
    documentsCount: 2450,
    pagesCount: 7350,
    chunksCount: 36750,
    annotationsCount: 14200,
    quarantined: false
  },
  {
    collectionId: 'col-uk-caselaw',
    name: 'The National Archives Find Case Law',
    jurisdiction: 'England and Wales',
    licence: 'Open Justice Licence',
    documentsCount: 1850,
    pagesCount: 5550,
    chunksCount: 27750,
    annotationsCount: 11100,
    quarantined: false
  },
  {
    collectionId: 'col-courtlistener-us',
    name: 'CourtListener US Appellate Opinions',
    jurisdiction: 'United States',
    licence: 'Public Domain (US Government Works)',
    documentsCount: 950,
    pagesCount: 2850,
    chunksCount: 14250,
    annotationsCount: 4750,
    quarantined: false
  },
  {
    collectionId: 'col-eurlex-eu',
    name: 'EUR-Lex Directives & Regulations',
    jurisdiction: 'European Union',
    licence: 'European Commission Decision 2011/833/EU',
    documentsCount: 550,
    pagesCount: 1650,
    chunksCount: 8250,
    annotationsCount: 2750,
    quarantined: false
  },
  {
    collectionId: 'col-cuad-contracts',
    name: 'CUAD Commercial Contracts Corpus',
    jurisdiction: 'United States',
    licence: 'Creative Commons Attribution 4.0 International (CC-BY 4.0)',
    documentsCount: 510,
    pagesCount: 1530,
    chunksCount: 7650,
    annotationsCount: 2550,
    quarantined: false
  },
  {
    collectionId: 'col-kaggle-unverified',
    name: 'Kaggle Scraped Legal Dump (Quarantined)',
    jurisdiction: 'UK',
    licence: 'Unknown / Terms Ambiguous',
    documentsCount: 820,
    pagesCount: 2460,
    chunksCount: 12300,
    annotationsCount: 0,
    quarantined: true,
    quarantineReason: 'Quarantined: Primary provenance unverified. Kaggle community mirrors excluded until court source authenticity and commercial redistribution rights are verified.'
  }
];

export class CorpusTracker {
  private collections: CorpusCollectionMetrics[] = [...PRIMARY_LEGAL_COLLECTIONS];

  public getSummary(): CorpusManifestSummary {
    const verified = this.collections.filter(c => !c.quarantined);

    const totalDocuments = verified.reduce((acc, c) => acc + c.documentsCount, 0);
    const totalPages = verified.reduce((acc, c) => acc + c.pagesCount, 0);
    const totalChunks = verified.reduce((acc, c) => acc + c.chunksCount, 0);
    const totalAnnotations = verified.reduce((acc, c) => acc + c.annotationsCount, 0);

    const targetTargetGoal = 6000;
    const percentAchieved = Math.min(100, Math.round((totalDocuments / targetTargetGoal) * 100));

    return {
      updatedAt: new Date().toISOString(),
      collectionsCount: this.collections.length,
      totalDocuments,
      totalPages,
      totalChunks,
      totalAnnotations,
      targetTargetGoal,
      percentAchieved,
      collections: this.collections
    };
  }

  public getQuarantinedCollections(): CorpusCollectionMetrics[] {
    return this.collections.filter(c => c.quarantined);
  }
}

export const corpusTracker = new CorpusTracker();
