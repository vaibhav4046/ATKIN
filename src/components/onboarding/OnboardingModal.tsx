import React, { useState, useEffect } from 'react';
import type { UserProfile, LegalRole, Jurisdiction, DraftingStyle, CitationFormat, MemoryPolicy, WorkspaceType } from '../../types/index.ts';
import { DEFAULT_USER_PROFILE, saveUserProfileToDB } from '../../db/index.ts';
import { checkOllamaConnection } from '../../engine/modelBridge.ts';
import { AtkinLogo } from '../common/AtkinLogo.tsx';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile, launchAction: 'new_matter' | 'import_files' | 'demo') => void;
  onClose?: () => void;
  initialProfile?: UserProfile | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  initialProfile
}) => {
  const [step, setStep] = useState<number>(1);
  const [profile, setProfile] = useState<UserProfile>(() => initialProfile || {
    ...DEFAULT_USER_PROFILE,
    detectedHardware: {
      cpuCores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8,
      memoryGb: typeof navigator !== 'undefined' && 'deviceMemory' in navigator ? (navigator as any).deviceMemory || 16 : 16,
      platform: typeof navigator !== 'undefined' ? navigator.platform || 'Windows' : 'Windows'
    }
  });

  const [testingModel, setTestingModel] = useState<boolean>(false);
  const [modelTestResult, setModelTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  if (!isOpen) return null;

  const handleTestOllama = async () => {
    setTestingModel(true);
    setModelTestResult(null);
    try {
      const res = await checkOllamaConnection();
      if (res.state === 'connected') {
        setModelTestResult(`Connected to local Ollama (${res.modelTag})`);
      } else {
        setModelTestResult('No local Ollama detected on port 11434. Built-in Deterministic Engine will run offline.');
      }
    } catch {
      setModelTestResult('Local model bridge unavailable. Using built-in engine.');
    } finally {
      setTestingModel(false);
    }
  };

  const finishOnboarding = async (launchAction: 'new_matter' | 'import_files' | 'demo') => {
    const finalWorkspace: WorkspaceType = launchAction === 'demo' ? 'demo' : 'personal';
    const updated: UserProfile = {
      ...profile,
      activeWorkspace: finalWorkspace,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString()
    };
    await saveUserProfileToDB(updated);
    onComplete(updated, launchAction);
  };

  const roles: Array<{ key: LegalRole; label: string; desc: string }> = [
    { key: 'solicitor', label: 'Solicitor', desc: 'Contentious or non-contentious legal practice & client matters' },
    { key: 'barrister', label: 'Barrister / Advocate', desc: 'Court advocacy, pleadings, opinions, and trial briefs' },
    { key: 'in_house', label: 'In-House Counsel', desc: 'Corporate governance, commercial contracts, supplier risk' },
    { key: 'paralegal', label: 'Legal Executive / Paralegal', desc: 'Evidence bundle preparation, discovery review, timeline collation' },
    { key: 'trainee', label: 'Trainee / Pupil / Student', desc: 'Doctrine verification, case research, memorandum drafting' },
    { key: 'pro_se', label: 'Litigant in Person', desc: 'Personal legal research, claim formulation, rights clarification' }
  ];

  const jurisdictions: Jurisdiction[] = [
    'England and Wales',
    'Scotland',
    'Northern Ireland',
    'European Union',
    'United States',
    'India'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-stone-100">
        
        {/* Header / Stepper */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/90">
          <div className="flex items-center space-x-3">
            <AtkinLogo className="w-6 h-6 rounded-[4px] border border-stone-700 shadow-xs" />
            <span className="text-xs font-mono uppercase tracking-widest text-stone-300 font-semibold">
              ATKIN Sovereign Setup — Step {step} of 7
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map(s => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-emerald-500' : s < step ? 'w-2 bg-emerald-700' : 'w-2 bg-stone-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 text-sm space-y-6">
          
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-1 rounded-[6px] bg-stone-800 border border-stone-700 shrink-0">
                  <AtkinLogo className="w-16 h-16 rounded-[4px]" />
                </div>
                <div className="space-y-2">
                  <span className="px-2.5 py-1 text-[11px] font-mono tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded">
                    SOVEREIGN LEGAL INTELLIGENCE
                  </span>
                  <h2 className="text-2xl font-serif text-stone-100 tracking-tight pt-1">
                    Private AI for legal work, running on hardware you control.
                  </h2>
                </div>
              </div>
              <p className="text-stone-300 leading-relaxed">
                Atkin is engineered for legal practitioners who cannot compromise client confidentiality. 
                Zero cloud telemetry, strict matter isolation, and every assertion verifiable against SHA-256 document spans.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-lg bg-stone-850 border border-stone-800 space-y-1">
                  <div className="text-emerald-400 font-medium">100% Air-Gapped</div>
                  <div className="text-xs text-stone-400 leading-normal">
                    All document parsing, reasoning, and drafting executes locally. No data leaves your machine.
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-stone-850 border border-stone-800 space-y-1">
                  <div className="text-emerald-400 font-medium">Evidentiary Proof</div>
                  <div className="text-xs text-stone-400 leading-normal">
                    Factual claims cite byte-accurate line offsets, complying with CPR 32.14 accuracy standards.
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-stone-850 border border-stone-800 space-y-1">
                  <div className="text-emerald-400 font-medium">Zero Hallucination</div>
                  <div className="text-xs text-stone-400 leading-normal">
                    Strict abstention engine refuses to invent unrecorded dates, bank details, or parties.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ROLE & PRACTICE */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-stone-100">Practitioner Profile</h3>
                <p className="text-stone-400 text-xs">
                  Tailors pleading templates, statutory defaults, and analytical rigor to your professional role.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {roles.map(r => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setProfile(p => ({ ...p, role: r.key }))}
                    className={`text-left p-3.5 rounded-lg border transition-all ${
                      profile.role === r.key 
                        ? 'bg-emerald-950/40 border-emerald-600 text-stone-100 shadow-sm' 
                        : 'bg-stone-850 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-medium text-sm flex items-center justify-between">
                      <span>{r.label}</span>
                      {profile.role === r.key && <span className="text-emerald-400 text-xs font-mono">Selected</span>}
                    </div>
                    <div className="text-xs text-stone-400 mt-1 leading-snug">{r.desc}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">Your Name / Alias (Optional)</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-md text-stone-200 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">Firm / Chambers / Org (Optional)</label>
                  <input
                    type="text"
                    value={profile.firmOrOrg}
                    onChange={e => setProfile(p => ({ ...p, firmOrOrg: e.target.value }))}
                    placeholder="e.g. Temple Chambers"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-md text-stone-200 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: JURISDICTIONS */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-stone-100">Governing Jurisdictions</h3>
                <p className="text-stone-400 text-xs">
                  Controls statutory doctrine loading (e.g. CPR 1998, Consumer Rights Act 2015, Rome I/II).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-2">Primary Jurisdiction</label>
                <div className="grid grid-cols-2 gap-2">
                  {jurisdictions.map(j => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, primaryJurisdiction: j }))}
                      className={`text-left p-3 rounded-lg border text-xs font-medium transition-all ${
                        profile.primaryJurisdiction === j
                          ? 'bg-emerald-950/40 border-emerald-600 text-stone-100'
                          : 'bg-stone-850 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-stone-400 mb-2">Cross-Border Secondary Jurisdictions (Optional)</label>
                <div className="flex flex-wrap gap-2">
                  {jurisdictions.filter(j => j !== profile.primaryJurisdiction).map(j => {
                    const isSelected = profile.secondaryJurisdictions.includes(j);
                    return (
                      <button
                        key={j}
                        type="button"
                        onClick={() => {
                          setProfile(p => ({
                            ...p,
                            secondaryJurisdictions: isSelected
                              ? p.secondaryJurisdictions.filter(x => x !== j)
                              : [...p.secondaryJurisdictions, j]
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                          isSelected
                            ? 'bg-stone-800 border-stone-600 text-emerald-400'
                            : 'bg-stone-900 border-stone-800 text-stone-500 hover:border-stone-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {j}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PRIVACY MODE */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-stone-100">Workstation Security Posture</h3>
                <p className="text-stone-400 text-xs">
                  Hardware-enforced network policy for client confidentiality.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    mode: 'local_only' as const,
                    title: 'Strict Local Only (Recommended)',
                    badge: 'AIR-GAPPED',
                    desc: '100% of document indexing, entity extraction, and IRAC analysis runs on your CPU/GPU. Complete isolation from external networks.'
                  },
                  {
                    mode: 'local_research' as const,
                    title: 'Local + Public Research',
                    badge: 'HYBRID LOOKUP',
                    desc: 'Matter documents remain strictly on your machine. Outbound network requests permitted solely to fetch public statutory authorities (legislation.gov.uk, EUR-Lex).'
                  },
                  {
                    mode: 'hybrid' as const,
                    title: 'Enterprise Model Gateway',
                    badge: 'ENTERPRISE',
                    desc: 'Local-first reasoning with lawyer-approved encrypted tunnel to self-hosted private LLM cluster.'
                  }
                ].map(opt => (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => setProfile(p => ({ ...p, privacyMode: opt.mode }))}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      profile.privacyMode === opt.mode
                        ? 'bg-emerald-950/40 border-emerald-600 text-stone-100'
                        : 'bg-stone-850 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-stone-200">{opt.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider bg-stone-900 border border-stone-700 rounded text-emerald-400">
                        {opt.badge}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-2 leading-relaxed">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: HARDWARE & AI DETECTION */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-stone-100">Hardware & Model Configuration</h3>
                <p className="text-stone-400 text-xs">
                  Atkin detects your available compute to select the optimal offline reasoning tier.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-stone-950 border border-stone-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-stone-400 border-b border-stone-850 pb-2">
                  <span>DETECTED CPU CORES</span>
                  <span className="text-stone-200 font-bold">{profile.detectedHardware.cpuCores} Logical Processors</span>
                </div>
                <div className="flex justify-between items-center text-stone-400 border-b border-stone-850 pb-2">
                  <span>SYSTEM MEMORY</span>
                  <span className="text-stone-200 font-bold">{profile.detectedHardware.memoryGb} GB Estimated</span>
                </div>
                <div className="flex justify-between items-center text-stone-400">
                  <span>HOST PLATFORM</span>
                  <span className="text-stone-200 font-bold">{profile.detectedHardware.platform}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-stone-850 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-stone-200 text-xs">Reasoning Engine Selection</span>
                  <span className="text-[11px] font-mono text-emerald-400">Ready</span>
                </div>
                <p className="text-xs text-stone-400 leading-normal">
                  Atkin includes a zero-dependency deterministic legal reasoning engine that parses contracts,
                  extracts obligations, quotes clauses, and enforces CPR 32.14 rules without requiring any downloads.
                </p>
                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleTestOllama}
                    disabled={testingModel}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs font-mono transition-colors disabled:opacity-50"
                  >
                    {testingModel ? 'Probing Port 11434...' : 'Test Local Ollama Connection'}
                  </button>
                  {modelTestResult && (
                    <span className="text-xs text-stone-300 font-mono">{modelTestResult}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: DRAFTING & CITATION PREFERENCES */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-stone-100">Drafting Style & Citation Standards</h3>
                <p className="text-stone-400 text-xs">
                  Configure output conventions for generated letters, briefs, and pleadings.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-2">Drafting Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'plain_english' as const, label: 'Plain English (Recommended)', desc: 'Clear, modern, jargon-free construction' },
                    { key: 'traditional' as const, label: 'Traditional Pleading', desc: 'Court formal ("inter alia", "the Claimant averreth")' },
                    { key: 'formal_advocacy' as const, label: 'Contentious Advocacy', desc: 'Sharpened skeleton argument rhetoric' },
                    { key: 'executive_summary' as const, label: 'Executive Brief', desc: 'Bullet points with risk ratings for executives' }
                  ].map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, draftingStyle: t.key }))}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        profile.draftingStyle === t.key
                          ? 'bg-emerald-950/40 border-emerald-600 text-stone-100'
                          : 'bg-stone-850 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="font-medium text-xs text-stone-200">{t.label}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-stone-300 mb-2">Citation Standard</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'oscola' as const, label: 'OSCOLA' },
                    { key: 'bluebook' as const, label: 'Bluebook' },
                    { key: 'neutral' as const, label: 'Neutral UK' },
                    { key: 'inline_statute' as const, label: 'Inline Statute' }
                  ].map(c => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, citationFormat: c.key }))}
                      className={`p-2.5 rounded-lg border text-xs text-center font-mono transition-all ${
                        profile.citationFormat === c.key
                          ? 'bg-emerald-950/40 border-emerald-600 text-emerald-400'
                          : 'bg-stone-850 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: READY TO LAUNCH */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="space-y-2 text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto text-xl font-serif">
                  A
                </div>
                <h3 className="text-2xl font-serif text-stone-100">Workstation Initialized</h3>
                <p className="text-stone-400 text-xs">
                  Your profile has been saved. Your Personal Workspace starts completely empty and isolated.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-stone-950 border border-stone-800 text-xs space-y-2 text-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-500">Practitioner:</span>
                  <span className="font-medium text-stone-200">{profile.name || 'Anonymous Practitioner'} ({profile.role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Primary Jurisdiction:</span>
                  <span className="font-medium text-stone-200">{profile.primaryJurisdiction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Security Mode:</span>
                  <span className="font-mono text-emerald-400 uppercase">{profile.privacyMode.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Drafting & Citations:</span>
                  <span className="font-medium text-stone-200">{profile.draftingStyle} / {profile.citationFormat.toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => finishOnboarding('new_matter')}
                  className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-semibold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Create First Client Matter</span>
                  <span className="font-mono text-xs">→</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => finishOnboarding('import_files')}
                    className="py-2.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
                  >
                    Import Case Files
                  </button>
                  <button
                    type="button"
                    onClick={() => finishOnboarding('demo')}
                    className="py-2.5 px-3 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-400 text-xs font-medium border border-stone-800 transition-colors"
                  >
                    Explore Demo Cases
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-900/90 flex items-center justify-between">
          <div>
            {step > 1 && step < 7 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
          <div>
            {step < 7 && (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="px-5 py-2 rounded bg-stone-200 hover:bg-white text-stone-900 font-medium text-xs transition-colors shadow-sm"
              >
                {step === 1 ? 'Configure Workstation →' : 'Continue →'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
