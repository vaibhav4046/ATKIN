/**
 * ATKIN Sovereign Legal Operating System
 * Composes core runtime providers and application router.
 */

import React from 'react';
import { AppProviders } from './app/AppProviders.tsx';
import { AppRouter } from './app/AppRouter.tsx';

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
