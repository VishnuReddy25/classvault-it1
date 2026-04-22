import React, { useState, useEffect, useRef } from 'react';
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

/* ── Animated page wrapper ───────────────────────────────── */
function PageTransition({ children, pageKey }) {
  const [displayed, setDisplayed] = useState(children);
  const [phase, setPhase]         = useState('idle'); // idle | out | in
  const prevKey = useRef(pageKey);

  useEffect(() => {
    if (pageKey === prevKey.current) return;
    prevKey.current = pageKey;

    /* 1. fade + slide current page out */
    setPhase('out');
    const t1 = setTimeout(() => {
      /* 2. swap content while invisible */
      setDisplayed(children);
      setPhase('in');
      /* 3. fade + slide new page in */
      const t2 = setTimeout(() => setPhase('idle'), 480);
      return () => clearTimeout(t2);
    }, 320);
    return () => clearTimeout(t1);
  }, [pageKey]); // eslint-disable-line

  /* keep children in sync when no transition is running */
  useEffect(() => {
    if (phase === 'idle') setDisplayed(children);
  }, [children, phase]);

  const style = {
    transition: 'opacity 0.32s cubic-bezier(.4,0,.2,1), transform 0.32s cubic-bezier(.4,0,.2,1)',
    ...(phase === 'out' && { opacity: 0, transform: 'translateY(18px)' }),
    ...(phase === 'in'  && { opacity: 0, transform: 'translateY(-14px)' }),
    ...(phase === 'idle'&& { opacity: 1, transform: 'none' }),
  };

  return <div style={style}>{displayed}</div>;
}

/* ── Inner app ───────────────────────────────────────────── */
function Inner() {
  const { sessionId, sessionStudent, lockSession } = useYearbook();
  const { activeVaultId } = useApp();
  const [page, setPage] = useState('journey');

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
      <PageTransition pageKey={page}>
        {renderPage()}
      </PageTransition>
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
