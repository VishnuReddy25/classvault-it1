import React, { useState, useEffect, useRef } from 'react';
import { AppProvider } from './context/AppContext';
import { YearbookProvider, useYearbook } from './context/YearbookContext';
import MeshBackground from './components/MeshBackground';
import CursorTrail from './components/CursorTrail';
import FarewellNavbar from './components/FarewellNavbar';
import ProfileCompletePrompt from './components/ProfileCompletePrompt';
import Onboarding from './pages/Onboarding';
import Journey from './pages/Journey';
import IT1Yearbook from './pages/IT1Yearbook';
import MediaVault from './pages/MediaVault';
import TheWall from './pages/TheWall';
import Dashboard from './pages/Dashboard';
import VaultPage from './pages/VaultPage';
import StudentProfile from './components/yearbook/StudentProfile';
import { useApp } from './context/AppContext';
import { getThemeVars } from './pages/IT1Yearbook';

/* ── Page transition wrapper ─────────────────────────────── */
function PageTransition({ children, pageKey }) {
  const [displayed, setDisplayed] = useState(children);
  const [phase, setPhase]         = useState('idle');
  const prevKey = useRef(pageKey);

  useEffect(() => {
    if (pageKey === prevKey.current) return;
    prevKey.current = pageKey;
    setPhase('out');
    const t1 = setTimeout(() => {
      setDisplayed(children);
      setPhase('in');
      const t2 = setTimeout(() => setPhase('idle'), 480);
      return () => clearTimeout(t2);
    }, 300);
    return () => clearTimeout(t1);
  }, [pageKey]); // eslint-disable-line

  useEffect(() => {
    if (phase === 'idle') setDisplayed(children);
  }, [children, phase]);

  return (
    <div style={{
      transition: 'opacity 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1)',
      ...(phase === 'out'  && { opacity: 0, transform: 'translateY(16px)' }),
      ...(phase === 'in'   && { opacity: 0, transform: 'translateY(-12px)' }),
      ...(phase === 'idle' && { opacity: 1, transform: 'none' }),
    }}>
      {displayed}
    </div>
  );
}

/* ── Inner app ───────────────────────────────────────────── */
function Inner() {
  const { sessionId, sessionStudent, lockSession, theme } = useYearbook();
  const { activeVaultId } = useApp();
  const [page, setPage]           = useState('journey');
  const [profileOpen, setProfileOpen] = useState(null); // studentId or null

  const tv = getThemeVars(theme || 'dark');

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
      <FarewellNavbar
        page={page}
        onNavigate={setPage}
        sessionStudent={sessionStudent}
        onLogout={lockSession}
      />
      <PageTransition pageKey={page}>
        {renderPage()}
      </PageTransition>

      {/* Profile complete prompt — always visible when logged in */}
      <ProfileCompletePrompt
        onOpenProfile={(studentId) => {
          setProfileOpen(studentId);
          setPage('yearbook');
        }}
      />

      {/* Global profile modal (opened from the prompt) */}
      {profileOpen && (
        <StudentProfile
          studentId={profileOpen}
          themeVars={tv}
          onClose={() => setProfileOpen(null)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <YearbookProvider>
        <MeshBackground />
        <CursorTrail />
        <Inner />
      </YearbookProvider>
    </AppProvider>
  );
}
