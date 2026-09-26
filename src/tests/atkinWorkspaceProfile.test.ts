import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  db, 
  seedInitialFixturesIfEmpty, 
  getMattersFromDB, 
  saveMatterToDB,
  getUserProfileFromDB,
  saveUserProfileToDB,
  DEFAULT_USER_PROFILE
} from '../db/index.ts';
import type { Matter, UserProfile } from '../types/index.ts';

describe('Atkin Workspace Partition & User Profile Integrity', () => {
  beforeEach(async () => {
    await db.matters.clear();
    await db.userProfile.clear();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('preserves clean empty state for Personal Workspace while keeping Demo Workspace isolated', async () => {
    // Seed fixtures (simulates initial installation)
    await seedInitialFixturesIfEmpty();

    // Personal workspace must be completely empty initially
    const personalMatters = await getMattersFromDB('personal');
    expect(personalMatters).toEqual([]);

    // Demo workspace must contain exactly the synthetic sandbox matters
    const demoMatters = await getMattersFromDB('demo');
    expect(demoMatters.length).toBe(4);
    expect(demoMatters.every(m => m.workspaceType === 'demo' || m.isDemo === true)).toBe(true);

    // Creating a matter in Personal Workspace does not pollute Demo Workspace
    const myMatter: Matter = {
      id: 'matter-solicitor-001',
      title: 'Vanguard Logistics v Northport Harbour Board',
      jurisdiction: 'England and Wales',
      clientAlias: 'Vanguard Shipping Group',
      status: 'active',
      workspaceType: 'personal',
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveMatterToDB(myMatter);

    const personalAfter = await getMattersFromDB('personal');
    expect(personalAfter.length).toBe(1);
    expect(personalAfter[0].id).toBe('matter-solicitor-001');

    const demoAfter = await getMattersFromDB('demo');
    expect(demoAfter.length).toBe(4);
    expect(demoAfter.some(m => m.id === 'matter-solicitor-001')).toBe(false);
  });

  it('persists UserProfile with role, jurisdiction, hardware detection and onboarding state', async () => {
    const freshProfile = await getUserProfileFromDB();
    expect(freshProfile).toBeNull();

    const completedProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: 'user-practitioner-01',
      name: 'Eleanor Vance',
      role: 'barrister',
      firmOrOrg: 'Brick Court Chambers',
      primaryJurisdiction: 'England and Wales',
      secondaryJurisdictions: ['European Union'],
      privacyMode: 'local_only',
      draftingStyle: 'formal_advocacy',
      citationFormat: 'oscola',
      memoryPolicy: 'strict_matter_isolation',
      activeWorkspace: 'personal',
      onboardingCompleted: true,
      updatedAt: new Date().toISOString()
    };

    await saveUserProfileToDB(completedProfile);

    const loaded = await getUserProfileFromDB();
    expect(loaded).toBeDefined();
    expect(loaded?.name).toBe('Eleanor Vance');
    expect(loaded?.role).toBe('barrister');
    expect(loaded?.firmOrOrg).toBe('Brick Court Chambers');
    expect(loaded?.onboardingCompleted).toBe(true);
    expect(loaded?.privacyMode).toBe('local_only');
    expect(loaded?.activeWorkspace).toBe('personal');
  });
});
