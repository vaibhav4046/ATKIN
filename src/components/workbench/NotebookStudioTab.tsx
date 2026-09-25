import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  Sparkles, 
  Search, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  FileText, 
  Download, 
  Plus, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Share2, 
  Radio, 
  Sliders, 
  Clock, 
  Scale, 
  ShieldCheck, 
  FileCode, 
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import type { Matter, Document, Span, Claim, Authority, ModelStatus } from '../../types/index.ts';
import type { 
  Notebook, 
  NotebookNote, 
  NotebookCitation, 
  NotebookPodcast, 
  NotebookPodcastTurn,
  NotebookChatMessage, 
  NotebookAskResult, 
  NotebookTransformationType, 
  SourceContextMode,
  PodcastOverviewFormat 
} from '../../types/notebook.ts';
import { notebookStudioEngine } from '../../engine/notebook/notebookStudioEngine.ts';
import { localSpeechEngine } from '../../engine/media/localSpeechEngine.ts';
import { Badge } from '../common/Badge.tsx';

interface NotebookStudioTabProps {
  matter: Matter;
  documents: Document[];
  spans: Span[];
  claims: Claim[];
  authorities: Authority[];
  onSelectSpan?: (span: Span) => void;
  modelStatus?: ModelStatus;
}

export const NotebookStudioTab: React.FC<NotebookStudioTabProps> = ({
  matter,
  documents,
  spans,
  claims,
  authorities,
  onSelectSpan,
  modelStatus
}) => {
  // Initialize default notebook for this matter
  const [notebook, setNotebook] = useState<Notebook>(() => 
    notebookStudioEngine.createNotebook(
      matter.id,
      `${matter.title}: Sovereign Research Notebook`,
      `Dedicated evidentiary workspace and knowledge distillation container for ${matter.title}.`,
      documents
    )
  );

  // Active view tabs
  const [activeCenterMode, setActiveCenterMode] = useState<'chat' | 'ask' | 'transformations'>('chat');
  const [activeRightTab, setActiveRightTab] = useState<'notes' | 'podcast'>('notes');

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [isChatSubmitting, setIsChatSubmitting] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Ask RAG state
  const [askQuestion, setAskQuestion] = useState('Are the computerized accounting records admissible as contemporary evidence under Civil Evidence Act 1995?');
  const [askResult, setAskResult] = useState<NotebookAskResult | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  // Transformations state
  const [selectedTransformation, setSelectedTransformation] = useState<NotebookTransformationType>('summary');
  const [customPrompt, setCustomPrompt] = useState('');
  const [transformationPreview, setTransformationPreview] = useState<NotebookNote | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);

  // Notes state
  const [selectedNote, setSelectedNote] = useState<NotebookNote | null>(null);
  const [notesFilter, setNotesFilter] = useState<string>('all');

  // Podcast / Audio Dialectic Player state
  const [activePodcast, setActivePodcast] = useState<NotebookPodcast | null>(() => {
    // Generate initial dialectic podcast on first load
    return notebookStudioEngine.generateAudioOverview(notebook, documents, authorities, 'judicial_dialectic');
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [selectedPodcastFormat, setSelectedPodcastFormat] = useState<PodcastOverviewFormat>('judicial_dialectic');
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Context token meter
  const tokenStats = notebookStudioEngine.estimateContextTokens(notebook, documents);

  // Keep chat scrolled to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notebook.chatMessages]);

  // Audio Dialectic Turn Playback Controller
  useEffect(() => {
    if (!isPlaying || !activePodcast || !activePodcast.turns[currentTurnIndex]) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const turn = activePodcast.turns[currentTurnIndex];
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      // Pre-process dialogue with Latin pronunciation dictionary
      const processedText = localSpeechEngine.prepareTextForTTS(turn.dialogue);
      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.rate = playbackSpeed;

      // Select voice based on speaker role
      const voices = window.speechSynthesis.getVoices();
      if (turn.speakerRole === 'judge') {
        utterance.pitch = 0.95;
      } else if (turn.speakerRole === 'respondent_kc') {
        utterance.pitch = 0.90;
      } else {
        utterance.pitch = 1.05;
      }

      utterance.onend = () => {
        if (currentTurnIndex < activePodcast.turns.length - 1) {
          setCurrentTurnIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setCurrentTurnIndex(0);
        }
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, currentTurnIndex, activePodcast, playbackSpeed]);

  // Handle toggling source inclusion
  const handleToggleSource = (docId: string) => {
    setNotebook(prev => {
      const activeSourceIds = prev.activeSourceIds.includes(docId)
        ? prev.activeSourceIds.filter(id => id !== docId)
        : [...prev.activeSourceIds, docId];
      return { ...prev, activeSourceIds, updatedAt: new Date().toISOString() };
    });
  };

  // Handle setting source context mode ('full' | 'summary' | 'excluded')
  const handleSetSourceMode = (docId: string, mode: SourceContextMode) => {
    setNotebook(prev => ({
      ...prev,
      sourceContextModes: {
        ...prev.sourceContextModes,
        [docId]: mode
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // Handle Send Chat
  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatSubmitting) return;

    const userText = chatInput.trim();
    setChatInput('');
    setIsChatSubmitting(true);

    const userMessage: NotebookChatMessage = {
      id: `usr-${Date.now().toString(36)}`,
      notebookId: notebook.id,
      sender: 'user',
      text: userText,
      citations: [],
      timestamp: new Date().toISOString()
    };

    // Add user message
    setNotebook(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMessage]
    }));

    setTimeout(() => {
      const botReply = notebookStudioEngine.chatWithNotebook(notebook, userText, documents, spans);
      setNotebook(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, botReply],
        updatedAt: new Date().toISOString()
      }));
      setIsChatSubmitting(false);
    }, 250);
  };

  // Handle Ask RAG Mode
  const handleRunAsk = () => {
    if (!askQuestion.trim() || isAsking) return;
    setIsAsking(true);

    setTimeout(() => {
      const res = notebookStudioEngine.askNotebook(notebook, askQuestion, documents, claims);
      setAskResult(res);
      setIsAsking(false);
    }, 300);
  };

  // Save Ask Result as a Studio Note
  const handleSaveAskAsNote = () => {
    if (!askResult) return;
    const now = new Date().toISOString();
    const newNote: NotebookNote = {
      id: `ask-note-${Date.now().toString(36)}`,
      notebookId: notebook.id,
      title: `Synthesis: ${askResult.question.substring(0, 50)}...`,
      content: askResult.synthesizedAnswer,
      transformationType: 'summary',
      tags: ['ask-synthesis', 'rag-brief'],
      citations: askResult.relevantChunks.map(c => ({
        documentId: c.documentId,
        documentTitle: c.documentTitle,
        quote: c.chunkText.substring(0, 150),
        startOffset: c.startOffset,
        endOffset: c.endOffset,
        verifiedAdmissible: true
      })),
      evidentialCoverageRatio: askResult.evidentialCoverageRatio,
      temporalConflictsDetected: askResult.temporalContradictions.length,
      createdAt: now,
      updatedAt: now
    };

    setNotebook(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes],
      updatedAt: now
    }));
    setSelectedNote(newNote);
    setActiveRightTab('notes');
  };

  // Handle Generate Transformation
  const handleGenerateTransformation = () => {
    setIsTransforming(true);
    setTimeout(() => {
      const note = notebookStudioEngine.generateTransformation(
        notebook,
        selectedTransformation,
        documents,
        claims,
        authorities,
        customPrompt
      );
      setTransformationPreview(note);
      setIsTransforming(false);
    }, 350);
  };

  // Save Transformation to Notebook
  const handleSaveTransformation = () => {
    if (!transformationPreview) return;
    setNotebook(prev => ({
      ...prev,
      notes: [transformationPreview, ...prev.notes],
      updatedAt: new Date().toISOString()
    }));
    setSelectedNote(transformationPreview);
    setTransformationPreview(null);
    setActiveRightTab('notes');
  };

  // Handle Generate Podcast
  const handleGeneratePodcast = () => {
    setIsGeneratingPodcast(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentTurnIndex(0);

    setTimeout(() => {
      const podcast = notebookStudioEngine.generateAudioOverview(
        notebook,
        documents,
        authorities,
        selectedPodcastFormat
      );
      setActivePodcast(podcast);
      setNotebook(prev => ({
        ...prev,
        podcasts: [podcast, ...prev.podcasts],
        updatedAt: new Date().toISOString()
      }));
      setIsGeneratingPodcast(false);
      setActiveRightTab('podcast');
    }, 450);
  };

  // Export full notebook to Obsidian Markdown file
  const handleExportMarkdown = () => {
    const md = notebookStudioEngine.exportNotebookToMarkdown(notebook, documents);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notebook.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_ObsidianVault.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered notes
  const filteredNotes = notebook.notes.filter(n => {
    if (notesFilter === 'all') return true;
    return n.transformationType === notesFilter;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-[#f8fafc] text-slate-800 antialiased font-sans">
      {/* Top Header Rail */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight">{notebook.title}</h1>
              <Badge variant="blue" className="text-xs">Open-Notebook Architecture</Badge>
              <Badge variant="green" className="text-xs">Sovereign / 100% Local</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{notebook.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Live Context Budget Meter */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">Context:</span>
            <span className="font-semibold text-slate-900">{tokenStats.totalTokens.toLocaleString()} / {tokenStats.maxTokens.toLocaleString()} tokens</span>
            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${tokenStats.percentUsed > 80 ? 'bg-amber-500' : 'bg-indigo-600'}`} 
                style={{ width: `${tokenStats.percentUsed}%` }}
              />
            </div>
            <span className="text-slate-500">({tokenStats.percentUsed}%)</span>
          </div>

          <button
            onClick={handleExportMarkdown}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-md transition-colors shadow-2xs"
            title="Export full notebook to Obsidian Markdown format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Obsidian Vault (.md)</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Source Selector & Context Manager */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Notebook Sources ({notebook.activeSourceIds.length}/{documents.length})</span>
            <span className="text-2xs text-slate-400">Context Controls</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {documents.map(doc => {
              const isActive = notebook.activeSourceIds.includes(doc.id);
              const mode = notebook.sourceContextModes[doc.id] || 'full';
              const docTokens = tokenStats.perDocTokens[doc.id] || 0;

              return (
                <div 
                  key={doc.id}
                  className={`p-2.5 rounded-md border text-xs transition-all ${
                    isActive 
                      ? 'bg-slate-50/80 border-slate-300 shadow-2xs' 
                      : 'bg-white border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <label className="flex items-start space-x-2 cursor-pointer flex-1 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={isActive} 
                        onChange={() => handleToggleSource(doc.id)}
                        className="mt-0.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate" title={doc.filename}>{doc.filename}</p>
                        <p className="text-2xs text-slate-400 truncate mt-0.5">SHA: {doc.sha256?.substring(0, 10)}... • {doc.pageCount} pgs</p>
                      </div>
                    </label>

                    {onSelectSpan && (
                      <button 
                        onClick={() => {
                          const firstSpan = spans.find(s => s.documentId === doc.id);
                          if (firstSpan) onSelectSpan(firstSpan);
                        }}
                        className="text-slate-400 hover:text-indigo-600 p-1 rounded-sm"
                        title="Inspect in document viewer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {isActive && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-2xs">
                      <div className="inline-flex rounded-sm bg-slate-200/70 p-0.5">
                        <button
                          onClick={() => handleSetSourceMode(doc.id, 'full')}
                          className={`px-1.5 py-0.5 rounded-xs font-medium transition-colors ${
                            mode === 'full' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Full
                        </button>
                        <button
                          onClick={() => handleSetSourceMode(doc.id, 'summary')}
                          className={`px-1.5 py-0.5 rounded-xs font-medium transition-colors ${
                            mode === 'summary' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Summary
                        </button>
                        <button
                          onClick={() => handleSetSourceMode(doc.id, 'excluded')}
                          className={`px-1.5 py-0.5 rounded-xs font-medium transition-colors ${
                            mode === 'excluded' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Exclude
                        </button>
                      </div>
                      <span className="text-slate-500 font-mono">+{docTokens.toLocaleString()} tok</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-2xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-proofline-blue" />
              <span>IndexedDB Technical Schedule</span>
            </span>
            <span className="font-mono text-slate-400">CPR 32.14 Review Required</span>
          </div>
        </div>

        {/* CENTER COLUMN: Interactive AI Command Studio */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Mode Navigation Tabs */}
          <div className="flex items-center space-x-1 border-b border-slate-200 px-4 pt-2 bg-slate-50/40">
            <button
              onClick={() => setActiveCenterMode('chat')}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeCenterMode === 'chat'
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Conversational Chat</span>
            </button>

            <button
              onClick={() => setActiveCenterMode('ask')}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeCenterMode === 'ask'
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Ask (Automated RAG Synthesis)</span>
            </button>

            <button
              onClick={() => setActiveCenterMode('transformations')}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeCenterMode === 'transformations'
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio Transformations (6 Templates)</span>
            </button>
          </div>

          {/* MODE 1: CHAT */}
          {activeCenterMode === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {notebook.chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-1 text-2xs text-slate-400 mb-1 px-1">
                      <span>{msg.sender === 'user' ? 'Advocate' : 'Sovereign Notebook Engine'}</span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-md p-3.5 text-xs ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                      {msg.abstentionNotice && (
                        <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-sm text-amber-800 text-2xs flex items-center space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span>{msg.abstentionNotice}</span>
                        </div>
                      )}

                      {/* Clickable Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5">
                          <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">Verified Evidence Spans:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((c, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  if (onSelectSpan) {
                                    const matchSpan = spans.find(s => s.documentId === c.documentId) || {
                                      id: `span-${c.documentId}`,
                                      documentId: c.documentId,
                                      startOffset: c.startOffset || 0,
                                      endOffset: c.endOffset || 100,
                                      exactText: c.quote,
                                      checksum: c.checksum || 'sha256'
                                    };
                                    onSelectSpan(matchSpan);
                                  }
                                }}
                                className="inline-flex items-center space-x-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 px-2 py-1 rounded-sm text-2xs transition-colors"
                              >
                                <FileText className="w-3 h-3 text-indigo-500" />
                                <span className="font-medium truncate max-w-[140px]">{c.documentTitle}</span>
                                <span className="text-slate-400 font-mono">[{c.startOffset}–{c.endOffset}]</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-200 bg-white">
                <form onSubmit={handleSendChat} className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask a question about the active notebook sources (e.g. 'What discrepancies are documented in PIN-188?')..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isChatSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isChatSubmitting || !chatInput.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-xs font-medium transition-colors shadow-xs"
                  >
                    {isChatSubmitting ? 'Analyzing...' : 'Send'}
                  </button>
                </form>
                <div className="mt-1.5 flex items-center justify-between text-2xs text-slate-400">
                  <span>Chat is grounded exclusively on checked sources ({tokenStats.totalTokens.toLocaleString()} tokens in context).</span>
                  {modelStatus?.state === 'connected' ? (
                    <span className="text-emerald-600 font-medium">✓ Local Gemma 4 Sovereign Bridge ({modelStatus.modelTag})</span>
                  ) : (
                    <span className="text-slate-500 font-medium font-mono">Deterministic IRAC Core (Local Model Offline)</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: ASK (AUTOMATED RAG SYNTHESIS) */}
          {activeCenterMode === 'ask' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                  <Search className="w-4 h-4 text-indigo-600" />
                  <span>Automated Multi-Angle RAG Synthesis</span>
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Ask a complex inquiry. The engine breaks down the question, retrieves relevant evidential chunks across all sources, enforces arXiv:2411.06037 Selective Abstention, and checks for timeline contradictions.
                </p>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={askQuestion}
                    onChange={e => setAskQuestion(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter comprehensive legal research question..."
                  />
                  <button
                    onClick={handleRunAsk}
                    disabled={isAsking}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium shadow-xs disabled:opacity-50"
                  >
                    {isAsking ? 'Synthesizing...' : 'Synthesize Discovery'}
                  </button>
                </div>

                {/* Sample Prompt Chips */}
                <div className="mt-3 flex flex-wrap gap-1.5 text-2xs">
                  <span className="text-slate-400 py-0.5">Quick Prompts:</span>
                  {[
                    'Are electronic logs admissible under Civil Evidence Act 1995?',
                    'What temporal contradictions exist between witness testimony and logs?',
                    'Summarize grounds for strike-out application under CPR 24'
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setAskQuestion(p)}
                      className="bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 px-2 py-0.5 rounded-sm hover:text-indigo-600 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ask Synthesis Results */}
              {askResult && (
                <div className="space-y-4">
                  {/* Evidential Health Bar */}
                  <div className="bg-white border border-slate-200 rounded-md p-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-sm ${askResult.isAbstaining ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {askResult.isAbstaining ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-slate-900">
                            {askResult.isAbstaining ? 'Selective Abstention Activated' : 'Evidentiary Synthesis Grounded'}
                          </span>
                          <Badge variant={askResult.isAbstaining ? 'ochre' : 'green'}>
                            {Math.round(askResult.evidentialCoverageRatio * 100)}% Coverage
                          </Badge>
                        </div>
                        <p className="text-2xs text-slate-500 mt-0.5">
                          {askResult.relevantChunks.length} documentary chunks examined • {askResult.temporalContradictions.length} timeline anomalies
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveAskAsNote}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save as Studio Note</span>
                    </button>
                  </div>

                  {/* Synthesized Output Display */}
                  <div className="bg-white border border-slate-200 rounded-md p-4 text-xs">
                    <div className="prose prose-xs max-w-none text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {askResult.synthesizedAnswer}
                    </div>

                    {/* Missing Discovery Needed */}
                    {askResult.missingDiscoveryNeeded.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200 bg-amber-50/50 p-3 rounded-md">
                        <p className="text-xs font-semibold text-amber-900 mb-1.5 flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Required Discovery to Close Evidential Deficit:</span>
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-2xs text-amber-800">
                          {askResult.missingDiscoveryNeeded.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Relevant Chunks Accordion */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Retrieved Discovery Chunks ({askResult.relevantChunks.length}):
                      </p>
                      <div className="space-y-2">
                        {askResult.relevantChunks.map((chunk, cIdx) => (
                          <div key={cIdx} className="p-2.5 bg-slate-50 rounded-md border border-slate-200/80 text-2xs">
                            <div className="flex items-center justify-between text-slate-600 font-medium mb-1">
                              <span className="font-semibold text-slate-900">{chunk.documentTitle}</span>
                              <span className="font-mono text-slate-400">Byte Range: {chunk.startOffset}–{chunk.endOffset}</span>
                            </div>
                            <p className="text-slate-700 italic">"{chunk.chunkText.substring(0, 220)}..."</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 3: TRANSFORMATIONS (STUDIO TEMPLATES) */}
          {activeCenterMode === 'transformations' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>One-Click Legal Studio Transformations</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Transform raw discovery into court-ready briefs, chronological event maps with 4-timestamp provenance, and adversarial risk memos.
                </p>
              </div>

              {/* Transformation Templates Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: 'summary',
                    title: 'Executive Case Brief',
                    desc: 'Formal court skeleton argument with parties, evidentiary submissions, and CEA 1995 s.9 compliance.',
                    badge: 'High Court Standard'
                  },
                  {
                    id: 'chronology',
                    title: 'Chronology & Event Map',
                    desc: 'Comprehensive timeline with 4-timestamp provenance (eventDate, sourceDate, importedAt, verifiedAt).',
                    badge: '4-Timestamp Proof'
                  },
                  {
                    id: 'vulnerabilities',
                    title: 'Adversarial Risk Memo',
                    desc: 'Red team analysis of opposing counsel attack vectors, evidence gaps, and hearsay vulnerabilities.',
                    badge: 'Red Team'
                  },
                  {
                    id: 'study_guide',
                    title: 'Key Entities & Matrix',
                    desc: 'Mapping of corporate entities, software systems, custodians, and their evidentiary footprint.',
                    badge: 'Fact Matrix'
                  },
                  {
                    id: 'faq',
                    title: 'Witness Examination FAQ',
                    desc: 'Examination-in-chief & cross-examination questions anchored to specific discovery exhibits.',
                    badge: 'Hearing Prep'
                  },
                  {
                    id: 'custom',
                    title: 'Custom Directive',
                    desc: 'Execute custom sovereign legal transformation instructions across all active documents.',
                    badge: 'Configurable'
                  }
                ].map(tmpl => (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTransformation(tmpl.id as NotebookTransformationType)}
                    className={`p-3.5 rounded-md border text-left cursor-pointer transition-all ${
                      selectedTransformation === tmpl.id
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs text-slate-900">{tmpl.title}</span>
                      <span className="text-2xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-xs font-medium">{tmpl.badge}</span>
                    </div>
                    <p className="text-2xs text-slate-500 leading-normal">{tmpl.desc}</p>
                  </div>
                ))}
              </div>

              {selectedTransformation === 'custom' && (
                <div>
                  <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Custom Transformation Directive</label>
                  <textarea
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    placeholder="E.g., Extract all implied terms under Sale of Goods Act 1979 and compare against vendor exclusion clauses..."
                    className="w-full bg-white border border-slate-300 rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20"
                  />
                </div>
              )}

              <button
                onClick={handleGenerateTransformation}
                disabled={isTransforming}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-xs font-medium transition-colors shadow-xs flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTransforming ? 'Transforming Active Sources...' : 'Generate Studio Transformation'}</span>
              </button>

              {/* Transformation Preview Modal / Box */}
              {transformationPreview && (
                <div className="bg-white border border-indigo-200 rounded-md p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-xs text-indigo-900 flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{transformationPreview.title}</span>
                    </span>
                    <button
                      onClick={handleSaveTransformation}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md shadow-2xs transition-colors"
                    >
                      Save to Notes Studio
                    </button>
                  </div>

                  <div className="text-xs text-slate-800 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono bg-slate-50 p-3 rounded-md">
                    {transformationPreview.content}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Notes Studio & Audio Dialectic Overview */}
        <div className="w-[430px] bg-slate-50/60 border-l border-slate-200 flex flex-col shrink-0">
          {/* Sub-tabs Header */}
          <div className="flex border-b border-slate-200 bg-white">
            <button
              onClick={() => setActiveRightTab('notes')}
              className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
                activeRightTab === 'notes'
                  ? 'border-indigo-600 text-indigo-700 bg-slate-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes Studio ({notebook.notes.length})</span>
            </button>

            <button
              onClick={() => setActiveRightTab('podcast')}
              className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
                activeRightTab === 'podcast'
                  ? 'border-indigo-600 text-indigo-700 bg-slate-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-indigo-500" />
              <span>Dialectic Audio ({notebook.podcasts.length || (activePodcast ? 1 : 0)})</span>
            </button>
          </div>

          {/* TAB 1: NOTES STUDIO */}
          {activeRightTab === 'notes' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Filter Row */}
              <div className="p-2.5 bg-white border-b border-slate-200 flex items-center space-x-1 text-2xs overflow-x-auto">
                {['all', 'summary', 'chronology', 'vulnerabilities', 'study_guide', 'faq'].map(f => (
                  <button
                    key={f}
                    onClick={() => setNotesFilter(f)}
                    className={`px-2 py-1 rounded-sm capitalize font-medium transition-colors ${
                      notesFilter === f ? 'bg-indigo-100 text-indigo-800' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-700">No notes in this notebook yet</p>
                    <p className="text-2xs text-slate-400 mt-1">
                      Run an Ask query or Studio Transformation to generate court briefs and chronologies.
                    </p>
                  </div>
                ) : (
                  filteredNotes.map(n => (
                    <div
                      key={n.id}
                      onClick={() => setSelectedNote(n)}
                      className={`p-3 rounded-md border text-left cursor-pointer transition-all ${
                        selectedNote?.id === n.id
                          ? 'border-indigo-600 bg-white shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-slate-900 truncate flex-1">{n.title}</span>
                        <span className="text-2xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs font-mono ml-2">
                          {Math.round(n.evidentialCoverageRatio * 100)}% cov
                        </span>
                      </div>
                      <p className="text-2xs text-slate-500 line-clamp-2 leading-relaxed">
                        {n.content.replace(/^[#*>-]+\s*/gm, '')}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
                        <span className="capitalize">{n.transformationType}</span>
                        <span>{new Date(n.createdAt).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Note Reader Drawer/Modal */}
              {selectedNote && (
                <div className="p-3 bg-white border-t border-slate-200 max-h-64 overflow-y-auto text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 truncate">{selectedNote.title}</span>
                    <button
                      onClick={() => setSelectedNote(null)}
                      className="text-slate-400 hover:text-slate-700 text-xs"
                    >
                      Close
                    </button>
                  </div>
                  <div className="text-2xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                    {selectedNote.content}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIALECTIC AUDIO OVERVIEW (COURT PODCAST) */}
          {activeRightTab === 'podcast' && activePodcast && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Podcast Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                    {activePodcast.overviewFormat.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1.5 text-2xs text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{Math.round(activePodcast.totalDurationSeconds / 60)} mins</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-600 font-semibold">{activePodcast.billingUnits6Min} SRA Units</span>
                  </div>
                </div>

                <h3 className="text-xs font-semibold text-slate-900 mb-1">{activePodcast.title}</h3>
                <p className="text-2xs text-slate-500 leading-normal">
                  Adversarial courtroom moot between Presiding Judge, Claimant Counsel, Respondent Counsel, and Judicial Assessor.
                </p>

                {/* Regenerate format switch */}
                <div className="mt-3 flex items-center justify-between">
                  <select
                    value={selectedPodcastFormat}
                    onChange={e => setSelectedPodcastFormat(e.target.value as PodcastOverviewFormat)}
                    className="bg-white border border-slate-300 rounded-sm text-2xs px-2 py-1 text-slate-700"
                  >
                    <option value="judicial_dialectic">Judicial Dialectic Hearing</option>
                    <option value="strategy_interrogation">Oral Argument Strategy Prep</option>
                  </select>
                  <button
                    onClick={handleGeneratePodcast}
                    disabled={isGeneratingPodcast}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm text-2xs font-medium transition-colors"
                  >
                    {isGeneratingPodcast ? 'Rebuilding...' : 'Regenerate'}
                  </button>
                </div>
              </div>

              {/* Interactive Audio Player Toolbar */}
              <div className="p-3 bg-slate-900 text-white flex flex-col space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentTurnIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentTurnIndex === 0}
                      className="p-1.5 hover:bg-slate-800 rounded-sm text-slate-300 hover:text-white disabled:opacity-30"
                      title="Previous Turn"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-transform active:scale-95 shadow-xs"
                      title={isPlaying ? 'Pause Speech' : 'Play Turn Dialogue'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <button
                      onClick={() => setCurrentTurnIndex(prev => Math.min(activePodcast.turns.length - 1, prev + 1))}
                      disabled={currentTurnIndex === activePodcast.turns.length - 1}
                      className="p-1.5 hover:bg-slate-800 rounded-sm text-slate-300 hover:text-white disabled:opacity-30"
                      title="Next Turn"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Waveform Animation */}
                  <div className="flex items-center space-x-1 h-4">
                    {[6, 12, 18, 10, 16, 22, 14, 8, 20, 10].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 bg-indigo-400 rounded-full transition-all duration-300 ${
                          isPlaying ? 'opacity-100 animate-pulse' : 'opacity-30'
                        }`}
                        style={{ height: isPlaying ? `${h}px` : '4px' }}
                      />
                    ))}
                  </div>

                  {/* Playback speed toggle */}
                  <div className="flex items-center space-x-1 text-2xs font-mono">
                    {[1, 1.25, 1.5].map(spd => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-1.5 py-0.5 rounded-xs ${
                          playbackSpeed === spd ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-2xs text-slate-400 border-t border-slate-800 pt-1.5">
                  <span className="truncate">
                    Turn {currentTurnIndex + 1} of {activePodcast.turns.length}:{' '}
                    <strong className="text-indigo-300">{activePodcast.turns[currentTurnIndex]?.speakerName}</strong>
                  </span>
                  <span className="font-mono text-emerald-400">Offline Web Speech Synthesis</span>
                </div>
              </div>

              {/* Synchronized Turn-by-Turn Dialogue Script */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {activePodcast.turns.map((turn, idx) => {
                  const isCurrent = idx === currentTurnIndex;
                  const speaker = activePodcast.speakers.find(s => s.id === turn.speakerId);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentTurnIndex(idx);
                        setIsPlaying(true);
                      }}
                      className={`p-3 rounded-md border text-xs cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: speaker?.avatarColor || '#4f46e5' }}
                          />
                          <span className="font-semibold text-slate-900">{turn.speakerName}</span>
                          <span className="text-2xs text-slate-400 uppercase font-mono">({turn.speakerRole})</span>
                        </div>
                        <span className="text-2xs text-slate-400 font-mono">~{turn.durationSecEstimate}s</span>
                      </div>

                      {turn.stageDirection && (
                        <p className="text-2xs text-slate-500 italic mb-1">{turn.stageDirection}</p>
                      )}

                      <p className={`leading-relaxed ${isCurrent ? 'text-slate-950 font-medium' : 'text-slate-700'}`}>
                        {turn.dialogue}
                      </p>

                      {turn.citedDocumentTitle && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center space-x-1 text-2xs text-indigo-700">
                          <FileText className="w-3 h-3 text-indigo-500" />
                          <span className="font-medium">Relies on: {turn.citedDocumentTitle}</span>
                        </div>
                      )}

                      {turn.latinGlossaryUsed && turn.latinGlossaryUsed.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1 text-2xs">
                          {turn.latinGlossaryUsed.map((term, tIdx) => (
                            <span key={tIdx} className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-xs font-serif italic">
                              {term}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
