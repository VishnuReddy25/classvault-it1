import React, { useState, useMemo } from 'react';
import { useYearbook } from '../context/YearbookContext';

const STEPS = { SELECT: 'select', SET_PIN: 'set_pin', VERIFY_PIN: 'verify_pin', DONE: 'done' };

export default function Onboarding() {
  const { students, unclaimedStudents, isClaimed, claimProfile, unlockProfile, loading, error: contextError, useLocalMode } = useYearbook();

  const [step, setStep]             = useState(STEPS.SELECT);
  const [selected, setSelected]     = useState(null); // student obj
  const [pin, setPin]               = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');

  // If already in session, parent App won't render Onboarding — so this is always fresh.

  // ── step: SELECT ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const list = unclaimedStudents || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(s =>
      s.name.toLowerCase().includes(q) || s.roll.includes(q)
    );
  }, [unclaimedStudents, search]);

  function handleSelect(student) {
    setSelected(student);
    setPin('');
    setConfirmPin('');
    setError('');
    setStep(STEPS.SET_PIN);
  }

  // ── step: SET_PIN ─────────────────────────────────────────────────────────
  function handleSetPin() {
    if (pin.length < 4) { setError('PIN must be at least 4 characters.'); return; }
    if (pin !== confirmPin) { setError('PINs do not match. Try again.'); return; }
    const result = claimProfile(selected.id, pin);
    if (!result.ok) { setError(result.error); return; }
    setStep(STEPS.DONE);
  }

  // ── step: VERIFY_PIN (returning user picks from all; we show a search to find claimed one) ──
  // Returning users: show ALL students; user picks theirs → enter PIN
  const [returnSearch, setReturnSearch] = useState('');
  const [returnSelected, setReturnSelected] = useState(null);

  const allFiltered = useMemo(() => {
    if (!returnSearch.trim()) return [];
    const q = returnSearch.toLowerCase();
    return (students || []).filter(s =>
      isClaimed(s.id) &&
      (s.name.toLowerCase().includes(q) || s.roll.includes(q))
    );
  }, [students, returnSearch, isClaimed]);

  function handleVerifyPin() {
    if (!returnSelected) { setError('Please select your profile first.'); return; }
    const ok = unlockProfile(returnSelected.id, pin);
    if (!ok) { setError('Incorrect PIN. Please try again.'); setPin(''); return; }
    // sessionId is now set → parent re-renders
  }

  // ── shared card wrapper ────────────────────────────────────────────────────
  const cardStyle = {
    width: '100%', maxWidth: 520, padding: '40px 36px',
    background: 'rgba(255,255,255,0.93)',
    backdropFilter: 'saturate(180%) blur(28px)',
    WebkitBackdropFilter: 'saturate(180%) blur(28px)',
    border: '1px solid rgba(255,255,255,0.7)',
    borderRadius: 28,
    boxShadow: '0 24px 64px rgba(108,71,255,0.14), 0 1px 0 rgba(255,255,255,0.9) inset',
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 14,
    border: '1.5px solid rgba(108,71,255,0.2)',
    fontSize: 15, color: '#0d0b18', fontFamily: "'DM Sans',sans-serif",
    outline: 'none', boxSizing: 'border-box',
    background: 'rgba(108,71,255,0.03)',
  };

  const btnStyle = {
    width: '100%', padding: '14px', fontSize: 15, fontWeight: 600,
    borderRadius: 100, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
    border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4338ca)',
    color: '#fff', marginTop: 6,
  };

  const localModeBanner = useLocalMode ? (
    <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(248,208,231,0.22)', border: '1px solid rgba(156,35,164,0.18)', color: '#6b21a8', fontSize: 13, marginBottom: 20, textAlign:'center' }}>
      Firestore unavailable — running in local demo mode.
    </div>
  ) : null;

  const logoBlock = (
    <div style={{ textAlign: 'center', marginBottom: 28 }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%', margin: '0 auto 14px',
        background: 'linear-gradient(135deg,rgba(108,71,255,0.12),rgba(59,130,246,0.12))',
        border: '1.5px solid rgba(108,71,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>🔒</div>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 700, color: '#6c47ff' }}>
        ClassVault <span style={{ opacity: 0.4, fontSize: 17 }}>✦</span>
      </div>
      <p style={{ fontSize: 13, color: '#7b78a0', marginTop: 6 }}>IT-1 · Batch 2022–26</p>
    </div>
  );

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', zIndex:2 }}>
        <div style={{ ...cardStyle, maxWidth: 640, textAlign: 'center', padding: '60px 36px' }}>
          <div style={{ width:48, height:48, margin:'0 auto 20px', borderRadius:'50%', border:'3px solid rgba(108,71,255,0.2)', borderTopColor:'#6c47ff', animation:'spinAnim 0.8s linear infinite' }} />
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:'#1a1630', marginBottom:4 }}>
            Loading profiles...
          </h2>
        </div>
      </div>
    );
  }

  if (contextError && !useLocalMode) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', zIndex:2 }}>
        <div style={{ ...cardStyle, maxWidth: 640, textAlign: 'center', padding: '60px 36px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:'#e11d48', marginBottom:4 }}>Connection Error</h2>
          <p style={{ fontSize:14, color:'#7b78a0', marginTop:8 }}>{contextError}</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (step === STEPS.SELECT) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', zIndex:2 }}>
        <div style={{ ...cardStyle, maxWidth: 640 }}>
          {logoBlock}
          {localModeBanner}
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:'#1a1630', marginBottom:4, textAlign:'center' }}>
            Find your profile
          </h2>
          <p style={{ fontSize:13, color:'#7b78a0', textAlign:'center', marginBottom:20 }}>
            {students.length === 0 && !loading
              ? 'No profiles loaded — check your Firestore setup or database connection.'
              : `${unclaimedStudents?.length || 0} unclaimed profiles · Select yours to get started`}
          </p>

          <input
            style={{ ...inputStyle, marginBottom: 16 }}
            placeholder="Search by name or roll number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />

          <div style={{ maxHeight: 320, overflowY:'auto', borderRadius:14, border:'1.5px solid rgba(108,71,255,0.1)' }}>
            {filtered.length === 0 ? (
              <div style={{ padding:24, textAlign:'center', color:'#9896b0', fontSize:14 }}>
                {students.length === 0 && !loading
                  ? 'No student profiles were loaded. Check your Firestore project and confirm the database is accessible.'
                  : (search ? 'No unclaimed profiles match your search.' : 'All profiles have been claimed! Use the "Returning user" option below.')}
              </div>
            ) : filtered.map((s, i) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                style={{
                  display:'flex', alignItems:'center', gap:14, width:'100%',
                  padding:'14px 18px', background: i%2===0?'rgba(108,71,255,0.025)':'transparent',
                  border:'none', borderBottom:'1px solid rgba(108,71,255,0.07)',
                  cursor:'pointer', textAlign:'left', transition:'background 0.15s',
                }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(108,71,255,0.08)'}
                onMouseOut={e=>e.currentTarget.style.background=i%2===0?'rgba(108,71,255,0.025)':'transparent'}
              >
                <div style={{
                  width:40, height:40, borderRadius:'50%', flexShrink:0,
                  background:s.gradient, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:14, fontWeight:700, color:'#fff',
                }}>{s.initials}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#1a1630' }}>{s.name}</div>
                  <div style={{ fontSize:12, color:'#9896b0' }}>{s.roll}</div>
                </div>
                <div style={{ marginLeft:'auto', fontSize:12, color:'rgba(108,71,255,0.5)' }}>Claim →</div>
              </button>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:20 }}>
            <button
              onClick={() => { setStep(STEPS.VERIFY_PIN); setError(''); }}
              style={{ background:'none', border:'none', color:'#7c3aed', fontSize:13, cursor:'pointer', fontWeight:500 }}
            >
              Already claimed your profile? Sign in →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (step === STEPS.SET_PIN) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', zIndex:2 }}>
        <div style={cardStyle}>
          {logoBlock}
          {/* Selected profile preview */}
          <div style={{
            display:'flex', alignItems:'center', gap:14, padding:'14px 18px',
            background:'rgba(108,71,255,0.06)', borderRadius:16, marginBottom:24,
            border:'1.5px solid rgba(108,71,255,0.15)',
          }}>
            <div style={{
              width:44, height:44, borderRadius:'50%', flexShrink:0,
              background:selected.gradient, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:15, fontWeight:700, color:'#fff',
            }}>{selected.initials}</div>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:'#1a1630' }}>{selected.name}</div>
              <div style={{ fontSize:12, color:'#9896b0' }}>{selected.roll}</div>
            </div>
          </div>

          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:'#1a1630', marginBottom:6 }}>
            Set your PIN
          </h2>
          <p style={{ fontSize:13, color:'#7b78a0', marginBottom:20 }}>
            This PIN protects your profile. You'll need it every time you want to edit.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <input
              style={inputStyle}
              type="password"
              placeholder="Choose a PIN (min 4 characters)"
              value={pin}
              onChange={e => { setPin(e.target.value); setError(''); }}
              onKeyDown={e => e.key==='Enter' && handleSetPin()}
              autoFocus
            />
            <input
              style={inputStyle}
              type="password"
              placeholder="Confirm your PIN"
              value={confirmPin}
              onChange={e => { setConfirmPin(e.target.value); setError(''); }}
              onKeyDown={e => e.key==='Enter' && handleSetPin()}
            />
          </div>

          {error && <p style={{ color:'#e11d48', fontSize:13, marginTop:10 }}>⚠ {error}</p>}

          <button style={btnStyle} onClick={handleSetPin}>Claim Profile →</button>
          <button
            onClick={() => { setSelected(null); setStep(STEPS.SELECT); setError(''); }}
            style={{ width:'100%', marginTop:10, background:'none', border:'none', color:'#9896b0', fontSize:13, cursor:'pointer' }}
          >← Back to list</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (step === STEPS.DONE) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', zIndex:2 }}>
        <div style={{ ...cardStyle, textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🎉</div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:26, fontWeight:700, color:'#1a1630', marginBottom:8 }}>
            Profile Claimed!
          </h2>
          <p style={{ color:'#7b78a0', fontSize:14, lineHeight:1.7 }}>
            Welcome, <strong>{selected?.name}</strong>!<br />
            Your profile is now secured with your PIN.<br />
            The yearbook is loading…
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VERIFY_PIN — returning user
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', zIndex:2 }}>
      <div style={cardStyle}>
        {logoBlock}
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:'#1a1630', marginBottom:6 }}>
          Welcome back
        </h2>
        <p style={{ fontSize:13, color:'#7b78a0', marginBottom:20 }}>
          Search for your name, then enter your PIN.
        </p>

        <input
          style={{ ...inputStyle, marginBottom:12 }}
          placeholder="Search your name or roll no…"
          value={returnSearch}
          onChange={e => { setReturnSearch(e.target.value); setReturnSelected(null); setError(''); }}
          autoFocus
        />

        {returnSearch && allFiltered.length > 0 && !returnSelected && (
          <div style={{ borderRadius:12, border:'1.5px solid rgba(108,71,255,0.12)', marginBottom:14, maxHeight:200, overflowY:'auto' }}>
            {allFiltered.map(s => (
              <button
                key={s.id}
                onClick={() => { setReturnSelected(s); setReturnSearch(s.name); setError(''); }}
                style={{
                  display:'flex', alignItems:'center', gap:12, width:'100%',
                  padding:'12px 16px', background:'transparent', border:'none',
                  borderBottom:'1px solid rgba(108,71,255,0.07)', cursor:'pointer', textAlign:'left',
                }}
              >
                <div style={{
                  width:36, height:36, borderRadius:'50%', background:s.gradient,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight:700, color:'#fff', flexShrink:0,
                }}>{s.initials}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#1a1630' }}>{s.name}</div>
                  <div style={{ fontSize:12, color:'#9896b0' }}>{s.roll}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {returnSearch && allFiltered.length === 0 && (
          <p style={{ fontSize:13, color:'#9896b0', marginBottom:14 }}>No claimed profiles match — check your spelling.</p>
        )}

        {returnSelected && (
          <>
            <div style={{
              display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
              background:'rgba(108,71,255,0.06)', borderRadius:14, marginBottom:16,
              border:'1.5px solid rgba(108,71,255,0.15)',
            }}>
              <div style={{
                width:40, height:40, borderRadius:'50%', background:returnSelected.gradient,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14, fontWeight:700, color:'#fff', flexShrink:0,
              }}>{returnSelected.initials}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'#1a1630' }}>{returnSelected.name}</div>
                <div style={{ fontSize:12, color:'#9896b0' }}>{returnSelected.roll}</div>
              </div>
            </div>

            <input
              style={{ ...inputStyle, marginBottom:6 }}
              type="password"
              placeholder="Enter your PIN"
              value={pin}
              onChange={e => { setPin(e.target.value); setError(''); }}
              onKeyDown={e => e.key==='Enter' && handleVerifyPin()}
              autoFocus
            />
          </>
        )}

        {error && <p style={{ color:'#e11d48', fontSize:13, marginTop:6 }}>⚠ {error}</p>}

        <button style={{ ...btnStyle, marginTop:14 }} onClick={handleVerifyPin}>
          Unlock Profile →
        </button>
        <button
          onClick={() => { setStep(STEPS.SELECT); setError(''); setReturnSelected(null); setReturnSearch(''); setPin(''); }}
          style={{ width:'100%', marginTop:10, background:'none', border:'none', color:'#9896b0', fontSize:13, cursor:'pointer' }}
        >
          ← Claim a new profile instead
        </button>
      </div>
    </div>
  );
}
