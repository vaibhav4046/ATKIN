/**
 * ATKIN Canonical Brand System
 * Governs product naming, taglines, assets, and standard terminology.
 */

export const BRAND = {
  name: 'ATKIN',
  descriptor: 'Private AI for legal work.',
  heroHeadline: 'The legal AI that belongs to your practice.',
  heroSubtext: 'Private research, drafting and matter intelligence, with local-first control over your models and data.',
  utilityLine: 'Desktop · Mobile companion · Local models · Optional connected services',
  primaryCta: 'Open Atkin',
  secondaryCta: 'Explore demo',
  downloadCta: 'Download desktop',
  assets: {
    mark: '/brand/atkin-mark.png',
    mark32: '/brand/atkin-mark-32.png',
    mark64: '/brand/atkin-mark-64.png',
    mark128: '/brand/atkin-mark-128.png',
    mark256: '/brand/atkin-mark-256.png',
    mark512: '/brand/atkin-mark-512.png',
    favicon: '/favicon.ico',
    appleTouch: '/apple-touch-icon.png'
  }
} as const;

export const TERMINOLOGY = {
  matter: 'Matter',
  source: 'Source',
  ask: 'Ask',
  research: 'Research',
  draft: 'Draft',
  task: 'Task',
  memory: 'Memory',
  skill: 'Skill',
  connector: 'Connector',
  model: 'Model',
  device: 'Device',
  activity: 'Activity',
  needsReview: 'Needs review',
  local: 'Local',
  onDesktop: 'On your desktop',
  remoteProvider: 'Using remote provider',
  citationVerified: 'Citation verified',
  citationUnavailable: 'Citation unavailable',
  sourceChanged: 'Source changed'
} as const;
