/**
 * ATKIN App Router
 * Switches between Landing Page (Hermes rhythm & brand identity)
 * and Workbench AppShell (persistent legal operating system).
 *
 * The active surface is reflected in the URL hash so that reloading, sharing a
 * link, or using browser back/forward restores the surface the user was on
 * instead of dumping them back on the marketing page.
 *
 * Landing section links (#proof, #chapters, #security, #download) keep working
 * as ordinary in-page anchors. Only the reserved `#/` prefix is treated as a
 * route by this router.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { GlobalNav } from '../components/layout/GlobalNav.tsx';
import { LandingPage } from '../components/landing/LandingPage.tsx';
import { AppShell } from './AppShell.tsx';
import { useApp } from './AppProviders.tsx';

type View = 'landing' | 'workbench';

/** Reserved prefix. Anything else in the hash is an in-page anchor. */
const ROUTE_PREFIX = '#/';
const WORKBENCH_ROUTE = '#/workbench';
const LANDING_ROUTE = '#/';

function isRouteHash(hash: string): boolean {
  return hash === ROUTE_PREFIX || hash.startsWith(ROUTE_PREFIX);
}

function viewFromHash(hash: string): View {
  if (!isRouteHash(hash)) return 'landing';
  return hash === WORKBENCH_ROUTE ? 'workbench' : 'landing';
}

function currentView(): View {
  if (typeof window === 'undefined') return 'landing';
  return viewFromHash(window.location.hash);
}

export function AppRouter() {
  const [activeView, setActiveView] = useState<View>(currentView);
  const [isNewMatterRequested, setIsNewMatterRequested] = useState<boolean>(false);
  const { setWorkspace } = useApp();

  // Keep state in step with the URL, including browser back/forward.
  useEffect(() => {
    const onHashChange = () => setActiveView(viewFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((view: View) => {
    const next = view === 'workbench' ? WORKBENCH_ROUTE : LANDING_ROUTE;
    if (window.location.hash !== next) {
      window.location.hash = next;
    }
    setActiveView(view);
  }, []);

  const handleOpenWorkbench = useCallback(() => {
    navigate('workbench');
  }, [navigate]);

  const handleLoadSampleMatter = useCallback(() => {
    setWorkspace('demo');
    navigate('workbench');
  }, [navigate, setWorkspace]);

  const handleNewMatter = useCallback(() => {
    setWorkspace('personal');
    setIsNewMatterRequested(true);
    navigate('workbench');
  }, [navigate, setWorkspace]);

  const handleNavigateHome = useCallback(() => {
    navigate('landing');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gallery-paper flex flex-col font-sans text-ink antialiased">
      {/* Universal Global Header */}
      <GlobalNav
        activeView={activeView}
        onOpenWorkbench={handleOpenWorkbench}
        onLoadSample={handleLoadSampleMatter}
        onNavigateHome={handleNavigateHome}
      />

      {activeView === 'landing' ? (
        <LandingPage
          onOpenWorkbench={handleOpenWorkbench}
          onLoadSample={handleLoadSampleMatter}
          onNewMatter={handleNewMatter}
        />
      ) : (
        <AppShell
          onNavigateHome={handleNavigateHome}
          isNewMatterModalRequested={isNewMatterRequested}
          onClearNewMatterModalRequest={() => setIsNewMatterRequested(false)}
        />
      )}
    </div>
  );
}
