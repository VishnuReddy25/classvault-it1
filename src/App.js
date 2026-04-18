import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { YearbookProvider, useYearbook } from './context/YearbookContext';
import MeshBackground from './components/MeshBackground';
import FarewellNavbar from './components/FarewellNavbar';
import Onboarding from './pages/Onboarding';
import Journey from './pages/Journey';
import IT1Yearbook from './pages/IT1Yearbook';
import MediaVault from './pages/MediaVault';
import TheWall from './pages/TheWall';
import Dashboard from './pages/Dashboard';
import VaultPage from './pages/VaultPage';
import { useApp } from './context/AppContext';

function Inner() {
  const { sessionId, sessionStudent, lockSession } = useYearbook();
  const { activeVaultId } = useApp();
  const [page, setPage] = useState('journey');

  // Not signed in → onboarding (claim or verify)
  if (!sessionId) return <Onboarding />;

  if (activeVaultId) {
    return (
      <>
        <FarewellNavbar page={page} onNavigate={setPage} sessionStudent={sessionStudent} onLogout={lockSession} />
        <VaultPage />
      </>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'journey':  return <Journey onNavigate={setPage} />;
      case 'yearbook': return <IT1Yearbook />;
      case 'media':    return <MediaVault />;
      case 'wall':     return <TheWall />;
      case 'vaults':   return <Dashboard />;
      default:         return <Journey onNavigate={setPage} />;
    }
  };

  return (
    <>
      <FarewellNavbar page={page} onNavigate={setPage} sessionStudent={sessionStudent} onLogout={lockSession} />
      {renderPage()}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <YearbookProvider>
        <MeshBackground />
        <Inner />
      </YearbookProvider>
    </AppProvider>
  );
}
