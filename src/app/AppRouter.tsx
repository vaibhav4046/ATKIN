/**
 * ATKIN App Router
 * Switches between Landing Page (Hermes rhythm & brand identity)
 * and Workbench AppShell (persistent legal operating system).
 */

import React, { useState } from 'react';
import { GlobalNav } from '../components/layout/GlobalNav.tsx';
import { LandingPage } from '../components/landing/LandingPage.tsx';
import { AppShell } from './AppShell.tsx';
import { useApp } from './AppProviders.tsx';

export function AppRouter() {
  const [activeView, setActiveView] = useState<'landing' | 'workbench'>('landing');
  const [isNewMatterRequested, setIsNewMatterRequested] = useState<boolean>(false);
  const { setWorkspace } = useApp();

  const handleOpenWorkbench = () => {
    setActiveView('workbench');
  };

  const handleLoadSampleMatter = () => {
    setWorkspace('demo');
    setActiveView('workbench');
  };

  const handleNewMatter = () => {
    setWorkspace('personal');
    setIsNewMatterRequested(true);
    setActiveView('workbench');
  };

  return (
    <div className="min-h-screen bg-gallery-paper flex flex-col font-sans text-ink antialiased">
      {/* Universal Global Header */}
      <GlobalNav
        activeView={activeView}
        onOpenWorkbench={handleOpenWorkbench}
        onLoadSample={handleLoadSampleMatter}
        onNavigateHome={() => setActiveView('landing')}
      />

      {activeView === 'landing' ? (
        <LandingPage
          onOpenWorkbench={handleOpenWorkbench}
          onLoadSample={handleLoadSampleMatter}
          onNewMatter={handleNewMatter}
        />
      ) : (
        <AppShell
          onNavigateHome={() => setActiveView('landing')}
          isNewMatterModalRequested={isNewMatterRequested}
          onClearNewMatterModalRequest={() => setIsNewMatterRequested(false)}
        />
      )}
    </div>
  );
}
