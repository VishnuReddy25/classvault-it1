import React, { useState, useRef } from 'react';
import { useYearbook } from '../../context/YearbookContext';
import { SUPERLATIVE_OPTIONS, ACCENT_COLORS } from '../../data/it1Students';
import TestimonialsSection from './TestimonialsSection';
import TimelineSection from './TimelineSection';

function Overlay({ children }) {
  return (
    <div style={{
      position:'absolute', inset:0, zIndex:10,
      background:'rgba(7,5,16,0.9)', backdropFilter:'blur(10px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      borderRadius:28,
    }}>
      <div style={{ textAlign:'center', padding:36, maxWidth:320, width:'100%' }}>
        {children}
      </div>
    </div>
  );
}

function ClaimGate({ student, onSuccess, onCancel }) {
  const { claimProfile } = useYearbook();
  const [pin, setPin]         = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError]     = useState('');

  const handle = async () => {
    if (pin.length < 4)  return setError('PIN must be at least 4 digits.');
    if (pin !== confirm) return setError('PINs do not match.');
    const r = await claimProfile(student.id, pin);
    if (r.ok) onSuccess();
    else setError(r.error);
  };

  return (
    <Overlay>
      <div style={{fontSize:36,marginBottom:12}}>🔐</div>
      <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:'#fff',marginBottom:6}}>
        Claim your profile
      </div>
      <p style={{fontSize:13,color:'rgba(255,255,255,0.55)',marginBottom:20,lineHeight:1.6}}>
        Set a PIN to lock <strong style={{color:'#fff'}}>{student.name.split(' ')[0]}</strong>'s profile.<br/>
        Only you will be able to edit it.
      </p>
      <input type="password" value={pin} onChange={e=>{setPin(e.target.value);setError('');}}
        placeholder="Choose a PIN (min 4 digits)" autoFocus style={oInput(!!error)} />
      <input type="password" value={confirm} onChange={e=>{setConfirm(e.target.value);setError('');}}
        onKeyDown={e=>e.key==='Enter'&&handle()}
        placeholder="Confirm PIN" style={{...oInput(!!error),marginTop:8}} />
      {error && <p style={{color:'#fb7185',fontSize:13,margin:'6px 0'}}>⚠ {error}</p>}
      <div style={{display:'flex',gap:10,marginTop:14}}>
        <button onClick={onCancel} style={oGhost}>Cancel</button>
        <button onClick={handle}   style={oPrimary}>Claim & Edit →</button>
      </div>
    </Overlay>
  );
}

function UnlockGate({ student, onSuccess, onCancel }) {
  const { unlockProfile } = useYearbook();
  const [pin, setPin]   = useState('');
  const [error, setErr] = useState('');

  const verify = () => {
    if (unlockProfile(student.id, pin)) onSuccess();
    else { setErr('Incorrect PIN. Try again.'); setPin(''); }
  };

  return (
    <Overlay>
      <div style={{fontSize:36,marginBottom:12}}>🔒</div>
      <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:'#fff',marginBottom:6}}>
        Enter your PIN
      </div>
      <p style={{fontSize:13,color:'rgba(255,255,255,0.55)',marginBottom:20,lineHeight:1.6}}>
        <strong style={{color:'#fff'}}>{student.name.split(' ')[0]}</strong>'s profile is claimed.<br/>
        Enter the PIN to edit it.
      </p>
      <input type="password" value={pin} onChange={e=>{setPin(e.target.value);setErr('');}}
        onKeyDown={e=>e.key==='Enter'&&verify()}
        placeholder="Your PIN" autoFocus style={oInput(!!error)} />
      {error && <p style={{color:'#fb7185',fontSize:13,margin:'6px 0'}}>⚠ {error}</p>}
      <div style={{display:'flex',gap:10,marginTop:14}}>
        <button onClick={onCancel} style={oGhost}>Cancel</button>
        <button onClick={verify}   style={oPrimary}>Unlock</button>
      </div>
    </Overlay>
  );
}

function DropdownOption({ label, active, muted, onClick, tv }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 16px',
        fontSize: 14,
        cursor: 'pointer',
        fontFamily: "'DM Sans',sans-serif",
        color: active
          ? '#a78bfa'
          : muted
            ? tv.muted.color
            : (tv.inputText || tv.text),
        background: active
          ? 'rgba(124,58,237,0.15)'
          : hovered
            ? 'rgba(124,58,237,0.07)'
            : 'transparent',
        fontWeight: active ? 600 : 400,
        transition: 'background 0.12s',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {active && <span style={{ fontSize: 10, color: '#a78bfa' }}>✓</span>}
      {label}
    </div>
  );
}

function SuperlativeDropdown({ value, customValue, onChange, onCustomChange, tv }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  React.useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayLabel = value === 'Other'
    ? '✏️ Other (write your own)'
    : value || '— Pick a superlative —';

  const isPlaceholder = !value;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', marginTop: 14 }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 14,
          fontSize: 14,
          background: tv.inputBg,
          border: `1.5px solid ${open ? '#7c3aed' : tv.inputBorder}`,
          color: isPlaceholder ? tv.muted.color : (tv.inputText || tv.text),
          fontFamily: "'DM Sans',sans-serif",
          cursor: 'pointer',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
          transition: 'border-color 0.2s',
        }}
      >
        <span>{displayLabel}</span>
        <span style={{
          fontSize: 10,
          opacity: 0.5,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          display: 'inline-block',
        }}>▼</span>
      </div>

      {/* Dropdown list */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: tv.modalBg,
          border: `1.5px solid ${tv.inputBorder}`,
          borderRadius: 14,
          zIndex: 200,
          maxHeight: 240,
          overflowY: 'auto',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}>
          <DropdownOption
            label="— Pick a superlative —"
            active={!value}
            muted
            onClick={() => { onChange(''); setOpen(false); }}
            tv={tv}
          />
          {SUPERLATIVE_OPTIONS.map(o => (
            <DropdownOption
              key={o}
              label={o}
              active={value === o}
              onClick={() => { onChange(o); setOpen(false); }}
              tv={tv}
            />
          ))}
          {/* Divider before Other */}
          <div style={{ height: 1, background: tv.inputBorder, margin: '4px 0' }} />
          <DropdownOption
            label="✏️ Other (write your own)"
            active={value === 'Other'}
            onClick={() => { onChange('Other'); setOpen(false); }}
            tv={tv}
          />
        </div>
      )}

      {/* Custom text input shown when Other is selected */}
      {value === 'Other' && (
        <input
          value={customValue || ''}
          onChange={e => onCustomChange(e.target.value)}
          placeholder="Type your own superlative…"
          autoFocus
          style={{ ...inp(tv), marginTop: 8 }}
        />
      )}
    </div>
  );
}

export default function StudentProfile({ studentId, themeVars: tv, onClose }) {
  const { students, updateStudent, uploadPhoto, isClaimed, sessionId, isAdmin } = useYearbook();
  const s = students.find(st => st.id === studentId);

  const [tab, setTab]             = useState('profile');
  const [editing, setEditing]     = useState(false);
  const [draft, setDraft]         = useState({});
  const [gate, setGate]           = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef                   = useRef();

  if (!s) return null;

  const isOwner          = sessionId === s.id;
  const claimedBySomeone = isClaimed(s.id);
  const isUnclaimed      = !claimedBySomeone;
  const canDirectEdit    = isAdmin || isOwner;

  const handleEditClick = () => {
    if (canDirectEdit)    { setDraft({ ...s }); setEditing(true); }
    else if (isUnclaimed) { setGate('claim'); }
    else                  { setGate('unlock'); }
  };

  const cancelEdit = () => { setDraft({}); setEditing(false); };
  const saveEdit   = () => { updateStudent(s.id, draft); setEditing(false); setDraft({}); };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadPhoto(s.id, file);
      setDraft(d => ({ ...d, photo: url }));
    } catch {
      alert('Photo upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const D = editing ? draft : s;

  // Resolve display superlative: if 'Other', show customSuperlative
  const displaySuperlative = s.superlative === 'Other'
    ? s.customSuperlative
    : s.superlative;

  const editLabel = canDirectEdit
    ? '✏️ Edit Profile'
    : isUnclaimed ? '🔐 Claim & Edit' : '🔑 Unlock to Edit';

  const TABS = [
    { id:'profile',  label:'👤 Profile'  },
    { id:'legacy',   label:'✦ Legacy'    },
    { id:'timeline', label:'📅 Timeline' },
    { id:'messages', label:'💬 Messages' },
  ];

  return (
    <div
      onClick={e => { if (e.target===e.currentTarget && !editing) onClose(); }}
      style={{
        position:'fixed',
        top:80,
        left:0,
        right:0,
        bottom:0,
        zIndex:400,
        background:tv.overlay, backdropFilter:'blur(12px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:20, overflowY:'auto',
      }}
    >
      <div className="scale-in" style={{
        width:'100%', maxWidth:680,
        background:tv.modalBg, border:`1px solid ${tv.modalBorder}`,
        borderRadius:28, boxShadow:'0 32px 80px rgba(0,0,0,0.5)',
        maxHeight:'90vh',
        display:'flex', flexDirection:'column',
        position:'relative',
      }}>
        {gate==='claim'  && <ClaimGate  student={s} onCancel={()=>setGate(null)} onSuccess={()=>{setGate(null);setDraft({...s});setEditing(true);}} />}
        {gate==='unlock' && <UnlockGate student={s} onCancel={()=>setGate(null)} onSuccess={()=>{setGate(null);setDraft({...s});setEditing(true);}} />}

        {/* Hero */}
        <div style={{
          height:180, position:'relative', flexShrink:0,
          background:D.gradient,
          display:'flex', alignItems:'flex-end', padding:'0 28px 0',
          borderRadius:'28px 28px 0 0',
        }}>
          {D.photo && <img src={D.photo} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.4,borderRadius:'28px 28px 0 0'}} />}

          {/* Close button */}
          <button
            onClick={() => { cancelEdit(); onClose(); }}
            title="Close"
            style={{
              position:'fixed',
              top:20,
              right:20,
              zIndex:9999,
              width:42,
              height:42,
              borderRadius:'50%',
              background:'rgba(0,0,0,0.7)',
              border:'2px solid rgba(255,255,255,0.4)',
              color:'#fff',
              fontSize:18,
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              backdropFilter:'blur(6px)',
            }}
          >
            ✕
          </button>

          {/* Ownership badge */}
          <div style={{
            position:'absolute', top:14, left:14, zIndex:5,
            fontSize:10, padding:'4px 12px', borderRadius:100, fontWeight:600,
            background: isOwner ? 'rgba(16,185,129,0.85)' : claimedBySomeone ? 'rgba(124,58,237,0.75)' : 'rgba(0,0,0,0.5)',
            color:'#fff', backdropFilter:'blur(8px)',
            border:'1px solid rgba(255,255,255,0.15)',
          }}>
            {isOwner ? '✓ Your Profile' : claimedBySomeone ? '🔒 Claimed' : '○ Unclaimed'}
          </div>

          {/* Avatar */}
          <div style={{ position:'relative', transform:'translateY(50%)', zIndex:5 }}>
            <div style={{
              width:92, height:92, borderRadius:'50%', background:D.gradient,
              border:`4px solid ${tv.modalBg}`, overflow:'hidden',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 24px rgba(0,0,0,0.5)',
            }}>
              {D.photo
                ? <img src={D.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                : <span style={{fontSize:30,fontWeight:700,color:'#fff',fontFamily:"'Fraunces',serif"}}>{s.initials}</span>
              }
            </div>
            {editing && (
              <button onClick={()=>!uploading && fileRef.current?.click()} style={{
                position:'absolute', bottom:2, right:2,
                width:28, height:28, borderRadius:'50%',
                background: uploading ? '#10b981' : '#7c3aed', border:'2px solid white',
                color:'#fff', fontSize:11, cursor: uploading ? 'wait' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                zIndex:6,
              }}>{uploading ? '⏳' : '📷'}</button>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto} />
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY:'auto', flex:1, minHeight:0, borderRadius:'0 0 28px 28px' }}>
          <div style={{ padding:'58px 28px 0' }}>

            {editing
              ? <input value={draft.name||''} onChange={e=>setDraft(d=>({...d,name:e.target.value}))} style={inp(tv)} />
              : <div style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:700,...tv.heading,lineHeight:1.1}}>{s.name}</div>
            }
            <div style={{fontSize:12,...tv.muted,marginTop:4,fontFamily:'monospace'}}>
              {s.roll} · IT-1 · Batch 2022–26
            </div>

            {/* Superlative */}
            {editing ? (
              <SuperlativeDropdown
                value={draft.superlative || ''}
                customValue={draft.customSuperlative || ''}
                onChange={val => setDraft(d => ({ ...d, superlative: val, customSuperlative: '' }))}
                onCustomChange={val => setDraft(d => ({ ...d, customSuperlative: val }))}
                tv={tv}
              />
            ) : displaySuperlative ? (
              <div style={{marginTop:12,display:'inline-flex',alignItems:'center',gap:7,background:tv.tagBg,border:`1px solid ${tv.tagBorder}`,color:tv.tagColor,fontSize:12,fontWeight:600,padding:'5px 14px',borderRadius:100}}>
                🏆 {displaySuperlative}
              </div>
            ) : null}

            {/* Social links */}
            {editing ? (
              <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:10}}>
                {[{key:'linkedin',icon:'💼',ph:'LinkedIn URL'},{key:'github',icon:'🐙',ph:'GitHub URL'},{key:'instagram',icon:'📸',ph:'Instagram URL'}].map(({key,icon,ph})=>(
                  <div key={key} style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:18,width:24}}>{icon}</span>
                    <input value={draft[key]||''} onChange={e=>setDraft(d=>({...d,[key]:e.target.value}))} placeholder={ph} style={{...inp(tv),margin:0,flex:1}} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{display:'flex',gap:10,marginTop:14,flexWrap:'wrap'}}>
                {s.linkedin   && <SocialChip href={s.linkedin}   icon="💼" label="LinkedIn"  tv={tv} />}
                {s.github     && <SocialChip href={s.github}     icon="🐙" label="GitHub"    tv={tv} />}
                {s.instagram  && <SocialChip href={s.instagram}  icon="📸" label="Instagram" tv={tv} />}
              </div>
            )}

            {/* Accent color picker */}
            {editing && (
              <div style={{marginTop:20}}>
                <div style={{fontSize:11,...tv.muted,marginBottom:10,textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>Accent Color</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {ACCENT_COLORS.map(ac=>(
                    <button key={ac.id} title={ac.label} onClick={()=>setDraft(d=>({...d,accentColor:ac.id}))} style={{
                      width:28,height:28,borderRadius:'50%',background:ac.primary,
                      border:`3px solid ${draft.accentColor===ac.id?'#fff':'transparent'}`,
                      cursor:'pointer',boxShadow:draft.accentColor===ac.id?`0 0 0 2px ${ac.primary}`:'none',
                    }}/>
                  ))}
                </div>
              </div>
            )}

            {/* Action bar */}
            <div style={{display:'flex',gap:10,marginTop:20,paddingBottom:20,borderBottom:`1px solid ${tv.divider}`,alignItems:'center',flexWrap:'wrap'}}>
              {editing ? (
                <>
                  <button onClick={saveEdit}   style={pBtn}>💾 Save Profile</button>
                  <button onClick={cancelEdit} style={gBtn(tv)}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={handleEditClick} style={pBtn}>{editLabel}</button>
                  {sessionId && !isOwner && !isAdmin && (
                    <span style={{fontSize:12,...tv.muted,fontStyle:'italic'}}>Viewing as guest</span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{padding:'20px 28px 0'}}>
            <div style={{display:'flex',gap:4,marginBottom:24,flexWrap:'wrap'}}>
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  padding:'8px 18px',borderRadius:100,fontSize:12,fontWeight:500,
                  border:`1.5px solid ${tab===t.id?'#7c3aed':tv.inputBorder}`,
                  background:tab===t.id?'rgba(124,58,237,0.15)':'transparent',
                  color:tab===t.id?'#a78bfa':tv.muted.color,
                  cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all 0.18s',
                }}>{t.label}</button>
              ))}
            </div>

            {tab==='profile'  && <ProfileTab  s={D} editing={editing} draft={draft} setDraft={setDraft} tv={tv}/>}
            {tab==='legacy'   && <LegacyTab   s={D} editing={editing} draft={draft} setDraft={setDraft} tv={tv}/>}
            {tab==='timeline' && <TimelineSection student={s} tv={tv} editing={editing} canEdit={canDirectEdit}/>}
            {tab==='messages' && <TestimonialsSection student={s} tv={tv}/>}
          </div>

          {isAdmin && <AdminStudentControls student={s} tv={tv}/>}
          <div style={{height:32}}/>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ s, editing, draft, setDraft, tv }) {
  return (
    <div style={{paddingBottom:24}}>
      <SLabel label="Bio" tv={tv}/>
      {editing
        ? <textarea value={draft.bio||''} onChange={e=>setDraft(d=>({...d,bio:e.target.value}))} placeholder="Write something about yourself…" rows={4} style={{...inp(tv),resize:'vertical',borderRadius:16,lineHeight:1.7}}/>
        : s.bio ? <p style={{fontSize:15,...tv.heading,lineHeight:1.75,opacity:0.85}}>{s.bio}</p>
                : <Empty label="No bio yet. Click Edit Profile to add one." tv={tv}/>
      }
      <SLabel label="Fun Tags" tv={tv}/>
      {editing ? (
        <input value={(draft.tags||[]).join(', ')} onChange={e=>setDraft(d=>({...d,tags:e.target.value.split(',').map(t=>t.trim()).filter(Boolean)}))} placeholder="e.g. coffee addict, night owl, bookworm" style={inp(tv)}/>
      ) : (
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {(s.tags||[]).length>0
            ? s.tags.map((tag,i)=><span key={i} style={{padding:'5px 14px',borderRadius:100,fontSize:12,background:tv.tagBg,border:`1px solid ${tv.tagBorder}`,color:tv.tagColor,fontWeight:500}}>{tag}</span>)
            : <Empty label="No tags yet." tv={tv}/>
          }
        </div>
      )}
    </div>
  );
}

function LegacyTab({ s, editing, draft, setDraft, tv }) {
  return (
    <div style={{paddingBottom:24}}>
      <div style={{background:tv.sectionBg,border:`1px solid ${tv.sectionBorder}`,borderRadius:20,padding:'22px 24px',marginBottom:20}}>
        <div style={{fontSize:28,marginBottom:10}}>✦</div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:17,fontWeight:600,...tv.heading,marginBottom:6}}>Your Legacy</div>
        <div style={{fontSize:13,...tv.muted,lineHeight:1.65,marginBottom:20}}>A message to the future. Write your memories, achievements, and what you leave behind.</div>
        {editing ? (
          <textarea value={draft.legacy||''} onChange={e=>setDraft(d=>({...d,legacy:e.target.value}))} placeholder={`"Four years ago I walked through those gates..."`} rows={8} style={{...inp(tv),resize:'vertical',borderRadius:16,lineHeight:1.8,fontSize:15}}/>
        ) : s.legacy ? (
          <blockquote style={{fontFamily:"'Fraunces',serif",fontSize:16,fontStyle:'italic',lineHeight:1.85,...tv.heading,opacity:0.9,borderLeft:'3px solid #7c3aed',paddingLeft:20,margin:0}}>"{s.legacy}"</blockquote>
        ) : (
          <Empty label="No legacy written yet. Click Edit Profile to write it." tv={tv}/>
        )}
      </div>
    </div>
  );
}

function AdminStudentControls({ student, tv }) {
  const { approveStudent, updateStudent } = useYearbook();
  return (
    <div style={{margin:'0 28px 20px',background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:16,padding:'14px 18px'}}>
      <div style={{fontSize:11,color:'#ef4444',fontWeight:700,letterSpacing:1,marginBottom:10,textTransform:'uppercase'}}>🛡 Admin Controls</div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <button onClick={()=>approveStudent(student.id,!student.approved)} style={{padding:'7px 16px',borderRadius:100,fontSize:12,fontWeight:500,background:student.approved?'rgba(239,68,68,0.1)':'rgba(16,185,129,0.1)',border:`1px solid ${student.approved?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'}`,color:student.approved?'#ef4444':'#10b981',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
          {student.approved?'🚫 Hide Profile':'✓ Approve Profile'}
        </button>
        <button onClick={()=>{if(window.confirm('Clear profile data?'))updateStudent(student.id,{bio:'',legacy:'',photo:null,superlative:'',customSuperlative:'',tags:[],timeline:[]});}} style={{padding:'7px 16px',borderRadius:100,fontSize:12,fontWeight:500,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
          🗑 Clear Data
        </button>
      </div>
    </div>
  );
}

function SocialChip({ href, icon, label, tv }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:100,fontSize:12,fontWeight:500,background:tv.tagBg,border:`1px solid ${tv.tagBorder}`,color:tv.tagColor,textDecoration:'none'}}>{icon} {label}</a>;
}
function SLabel({ label, tv }) {
  return <div style={{fontSize:11,...tv.muted,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10,marginTop:22}}>{label}</div>;
}
function Empty({ label, tv }) {
  return <p style={{fontSize:13,...tv.muted,fontStyle:'italic'}}>{label}</p>;
}

const pBtn = {padding:'10px 22px',borderRadius:100,fontSize:13,fontWeight:600,background:'linear-gradient(135deg,#7c3aed,#4338ca)',color:'#fff',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 4px 18px rgba(124,58,237,0.35)'};
const gBtn = (tv) => ({padding:'10px 20px',borderRadius:100,fontSize:13,fontWeight:500,background:tv.btnBg,border:`1px solid ${tv.btnBorder}`,color:tv.btnColor,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"});
const inp  = (tv) => ({width:'100%',padding:'12px 16px',borderRadius:14,fontSize:14,background:tv.inputBg,border:`1.5px solid ${tv.inputBorder}`,color:tv.inputText||tv.text,fontFamily:"'DM Sans',sans-serif",outline:'none',marginBottom:4,display:'block',boxSizing:'border-box',transition:'border-color 0.2s',lineHeight:1.5});
const oInput = (err) => ({width:'100%',padding:'12px 16px',borderRadius:14,border:`1.5px solid ${err?'#fb7185':'rgba(255,255,255,0.2)'}`,background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:14,textAlign:'center',fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'});
const oPrimary = {flex:1,padding:'11px',borderRadius:100,background:'linear-gradient(135deg,#7c3aed,#4338ca)',border:'none',color:'#fff',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"};
const oGhost   = {flex:1,padding:'11px',borderRadius:100,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontSize:13,fontFamily:"'DM Sans',sans-serif"};