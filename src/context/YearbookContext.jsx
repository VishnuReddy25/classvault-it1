import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  onSnapshot, addDoc, deleteDoc, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { IT1_STUDENTS } from '../data/it1Students';
import { deleteFromCloudinary } from './AppContext';
import { compressDataUrl, compressFile, formatBytes } from '../utils/compressImage';

const YearbookContext = createContext(null);

const ADMIN_PIN         = 'CBIT-IT-22-26';
const COLL_STUDENTS     = 'students';
const COLL_CLAIMS       = 'claims';
const COLL_WALL         = 'wallPosts';
const COLL_TESTIMONIALS = 'testimonials';
const COLL_MEDIA        = 'media';

const CLOUDINARY_CLOUD_NAME    = 'dirlbqjpb';
const CLOUDINARY_UPLOAD_PRESET = 'classvault';

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h.toString(36);
}

export function YearbookProvider({ children }) {
  const [students,     setStudents]     = useState([]);
  const [claims,       setClaims]       = useState({});
  const [wallPosts,    setWallPosts]    = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [mediaWallet,  setMediaWallet]  = useState({});
  const [sessionId,    setSessionId]    = useState(() => localStorage.getItem('sessionId'));
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [theme,        setTheme]        = useState('dark');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [useLocalMode, setUseLocalMode] = useState(false);

  useEffect(() => {
    let unsubs = [];
    let fallbackTimer;

    const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), ms);
      promise.then(v => { clearTimeout(timer); resolve(v); })
             .catch(e => { clearTimeout(timer); reject(e); });
    });

    async function init() {
      try {
        const snap = await withTimeout(getDocs(collection(db, COLL_STUDENTS)), 5000);
        if (snap.empty) {
          const batch = writeBatch(db);
          IT1_STUDENTS.forEach(s => {
            batch.set(doc(db, COLL_STUDENTS, s.id), { ...s, createdAt: serverTimestamp() });
          });
          await batch.commit();
        }

        fallbackTimer = setTimeout(() => {
          console.warn('Firestore timeout — local mode.');
          setError('Firestore timed out; using local demo data.');
          setStudents(IT1_STUDENTS);
          setClaims({});
          setUseLocalMode(true);
          setLoading(false);
        }, 5500);

        unsubs.push(onSnapshot(collection(db, COLL_STUDENTS), s => {
          clearTimeout(fallbackTimer);
          const list = s.docs.map(d => ({ ...d.data(), id: d.id }));
          list.sort((a, b) => a.roll.localeCompare(b.roll));
          setStudents(list);
          setLoading(false);
        }, e => {
          clearTimeout(fallbackTimer);
          console.error(e);
          setError('Could not load students; using local demo data.');
          setStudents(IT1_STUDENTS);
          setClaims({});
          setUseLocalMode(true);
          setLoading(false);
        }));

        unsubs.push(onSnapshot(collection(db, COLL_CLAIMS), s => {
          clearTimeout(fallbackTimer);
          const map = {};
          s.docs.forEach(d => { map[d.id] = d.data(); });
          setClaims(map);
        }, e => {
          clearTimeout(fallbackTimer);
          console.error(e);
          setUseLocalMode(true);
          setLoading(false);
        }));

        unsubs.push(onSnapshot(collection(db, COLL_WALL), s => {
          setWallPosts(
            s.docs.map(d => ({ id: d.id, ...d.data() }))
              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          );
        }));

        unsubs.push(onSnapshot(collection(db, COLL_TESTIMONIALS), s => {
          setTestimonials(
            s.docs.map(d => ({ id: d.id, ...d.data() }))
              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          );
        }));

        unsubs.push(onSnapshot(collection(db, COLL_MEDIA), s => {
          const wallet = {};
          s.docs.forEach(d => {
            const { studentId, ...data } = d.data();
            if (!wallet[studentId]) wallet[studentId] = [];
            wallet[studentId].push({ id: d.id, ...data });
          });
          Object.keys(wallet).forEach(sid => {
            wallet[sid].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
          });
          setMediaWallet(wallet);
        }));

      } catch (e) {
        clearTimeout(fallbackTimer);
        console.error(e);
        setError('Firebase connection failed; using local demo data.');
        setStudents(IT1_STUDENTS);
        setClaims({});
        setUseLocalMode(true);
        setLoading(false);
      }
    }

    init();
    return () => { clearTimeout(fallbackTimer); unsubs.forEach(u => u()); };
  }, []);

  const updateStudent = useCallback(async (id, updates) => {
    const { photo, ...rest } = updates;
    await updateDoc(doc(db, COLL_STUDENTS, id), { ...rest, updatedAt: serverTimestamp() });
  }, []);

  /* ── uploadMedia with client-side compression ─────────── */
  const uploadMedia = useCallback(async (studentId, dataUrl, caption, onProgress) => {
    if (useLocalMode) {
      throw new Error('Uploads disabled in demo mode. Connect Firestore to enable.');
    }
    try {
      /* ── 1. Measure original size ── */
      const originalBlob  = await (await fetch(dataUrl)).blob();
      const originalBytes = originalBlob.size;

      onProgress?.({ stage: 'compressing', originalBytes });

      /* ── 2. Compress via canvas ── */
      const compressedBlob  = await compressDataUrl(dataUrl, {
        maxWidth:  1600,
        maxHeight: 1600,
        quality:   0.82,
        maxSizeKB: 800,
      });
      const compressedBytes = compressedBlob.size;
      const savedPct        = Math.round((1 - compressedBytes / originalBytes) * 100);

      console.log(
        `[compressImage] ${formatBytes(originalBytes)} → ${formatBytes(compressedBytes)} ` +
        `(saved ${savedPct > 0 ? savedPct : 0}%)`
      );

      onProgress?.({ stage: 'uploading', originalBytes, compressedBytes, savedPct });

      /* ── 3. Upload compressed blob to Cloudinary ── */
      const formData = new FormData();
      formData.append('file',           compressedBlob);
      formData.append('upload_preset',  CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error(`Cloudinary responded with ${res.status}`);

      const data     = await res.json();
      const imageUrl = data.secure_url;
      const publicId = data.public_id;

      onProgress?.({ stage: 'saving', imageUrl });

      /* ── 4. Save to Firestore ── */
      const docRef = await addDoc(collection(db, COLL_MEDIA), {
        studentId,
        url:            imageUrl,
        publicId,
        caption,
        uploadedAt:     new Date().toISOString(),
        originalBytes,
        compressedBytes,
        savedPct:       Math.max(savedPct, 0),
      });

      onProgress?.({ stage: 'done', docId: docRef.id });
      return docRef.id;

    } catch (e) {
      console.error('uploadMedia failed:', e);
      throw new Error(`Upload failed: ${e.message || 'Unknown error'}`);
    }
  }, [useLocalMode]);

  const deleteMedia = useCallback(async (studentId, mediaId) => {
    try {
      const docSnap = await getDoc(doc(db, COLL_MEDIA, mediaId));
      if (docSnap.exists() && docSnap.data().publicId) {
        await deleteFromCloudinary(docSnap.data().publicId);
      }
      await deleteDoc(doc(db, COLL_MEDIA, mediaId));
    } catch (e) {
      console.error('Failed to delete media:', e);
    }
  }, []);

  const addTimelineEvent = useCallback(async (studentId, event) => {
    const snap    = await getDoc(doc(db, COLL_STUDENTS, studentId));
    const current = snap.data()?.timeline || [];
    await updateDoc(doc(db, COLL_STUDENTS, studentId), {
      timeline: [...current, { id: Date.now(), ...event }],
      updatedAt: serverTimestamp(),
    });
  }, []);

  const removeTimelineEvent = useCallback(async (studentId, eventId) => {
    const snap    = await getDoc(doc(db, COLL_STUDENTS, studentId));
    const current = (snap.data()?.timeline || []).filter(e => e.id !== eventId);
    await updateDoc(doc(db, COLL_STUDENTS, studentId), { timeline: current, updatedAt: serverTimestamp() });
  }, []);

  const isClaimed = useCallback((id) => Boolean(claims[id]), [claims]);

  const claimProfile = useCallback(async (id, pin) => {
    if (claims[id]) return { ok: false, error: 'Already claimed.' };
    if (!pin || pin.length < 4) return { ok: false, error: 'PIN must be at least 4 digits.' };
    if (useLocalMode) {
      setClaims(c => ({ ...c, [id]: { pinHash: simpleHash(pin), claimedAt: Date.now() } }));
      setSessionId(id);
      return { ok: true };
    }
    try {
      await setDoc(doc(db, COLL_CLAIMS, id), { pinHash: simpleHash(pin), claimedAt: serverTimestamp() });
      setSessionId(id);
      localStorage.setItem('sessionId', id);
      return { ok: true };
    } catch { return { ok: false, error: 'Failed to claim. Try again.' }; }
  }, [claims, useLocalMode]);

  const verifyPin = useCallback((id, pin) => {
    const claim = claims[id];
    return claim ? simpleHash(pin) === claim.pinHash : false;
  }, [claims]);

  const unlockProfile = useCallback((id, pin) => {
    if (verifyPin(id, pin)) {
      setSessionId(id);
      localStorage.setItem('sessionId', id);
      return true;
    }
    return false;
  }, [verifyPin]);

  const lockSession = useCallback(() => {
    setSessionId(null);
    localStorage.removeItem('sessionId');
  }, []);

  const unclaimedStudents = useMemo(
    () => students.filter(s => !claims[s.id]),
    [students, claims]
  );

  const addWallPost = useCallback(async (studentId, name, message, anonymous) => {
    if (useLocalMode) throw new Error('Posting disabled in demo mode.');
    try {
      await addDoc(collection(db, COLL_WALL), {
        studentId,
        name:      anonymous ? 'Anonymous' : (name || 'Anonymous'),
        message,
        anonymous: Boolean(anonymous),
        color:     Math.floor(Math.random() * 6),
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      throw new Error(`Failed to post: ${e.message || 'Unknown error'}`);
    }
  }, [useLocalMode]);

  const deleteWallPost = useCallback(async (id) => {
    if (useLocalMode) throw new Error('Deleting disabled in demo mode.');
    try {
      await deleteDoc(doc(db, COLL_WALL, id));
    } catch (e) {
      throw new Error(`Failed to delete: ${e.message || 'Unknown error'}`);
    }
  }, [useLocalMode]);

  const addTestimonial = useCallback(async (toId, from, message) => {
    await addDoc(collection(db, COLL_TESTIMONIALS), {
      toId, from: from || 'Anonymous', message, createdAt: serverTimestamp(),
    });
  }, []);

  const deleteTestimonial = useCallback(async (id) => {
    await deleteDoc(doc(db, COLL_TESTIMONIALS, id));
  }, []);

  const loginAdmin  = useCallback((pin) => { if (pin === ADMIN_PIN) { setIsAdmin(true); return true; } return false; }, []);
  const logoutAdmin = useCallback(() => setIsAdmin(false), []);

  const approveStudent = useCallback(async (id, val) => {
    await updateDoc(doc(db, COLL_STUDENTS, id), { approved: val });
  }, []);

  const deleteAllVaults = useCallback(async () => {
    if (!window.confirm('Delete ALL vaults and memories? Cannot be undone.')) return;
    const mediaSnap = await getDocs(collection(db, COLL_MEDIA));
    const batch = writeBatch(db);
    mediaSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }, []);

  const deleteAllWallPosts = useCallback(async () => {
    if (!window.confirm('Delete ALL wall posts?')) return;
    const snap = await getDocs(collection(db, COLL_WALL));
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }, []);

  const deleteAllTestimonials = useCallback(async () => {
    if (!window.confirm('Delete ALL testimonials?')) return;
    const snap = await getDocs(collection(db, COLL_TESTIMONIALS));
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }, []);

  const resetAllData = useCallback(async () => {
    if (!window.confirm('Reset ALL profile data? Cannot be undone.')) return;
    const batch = writeBatch(db);
    IT1_STUDENTS.forEach(s => {
      batch.update(doc(db, COLL_STUDENTS, s.id), {
        bio: '', legacy: '', photo: null, superlative: '', tags: [], timeline: [], approved: true,
      });
    });
    const claimSnap = await getDocs(collection(db, COLL_CLAIMS));
    claimSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    setSessionId(null);
  }, []);

  return (
    <YearbookContext.Provider value={{
      students, unclaimedStudents, wallPosts, testimonials, mediaWallet,
      claimedCount: Object.keys(claims).length,
      updateStudent,
      addTimelineEvent, removeTimelineEvent,
      claims, isClaimed, claimProfile, verifyPin, unlockProfile, lockSession,
      sessionId, sessionStudent: students.find(s => s.id === sessionId) || null,
      addWallPost, deleteWallPost,
      addTestimonial, deleteTestimonial,
      uploadMedia, deleteMedia,
      isAdmin, loginAdmin, logoutAdmin, approveStudent,
      resetAllData, deleteAllVaults, deleteAllWallPosts, deleteAllTestimonials,
      theme, setTheme,
      loading, error, useLocalMode,
    }}>
      {children}
    </YearbookContext.Provider>
  );
}

export function useYearbook() {
  const ctx = useContext(YearbookContext);
  if (!ctx) throw new Error('useYearbook must be inside YearbookProvider');
  return ctx;
}
