import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  onSnapshot, addDoc, deleteDoc, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { IT1_STUDENTS } from '../data/it1Students';

const YearbookContext = createContext(null);

const ADMIN_PIN          = 'CBIT-IT-22-26';
const COLL_STUDENTS      = 'students';
const COLL_CLAIMS        = 'claims';
const COLL_WALL          = 'wallPosts';
const COLL_TESTIMONIALS  = 'testimonials';
const COLL_MEDIA         = 'media';

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
  // const [sessionId,    setSessionId]    = useState(null);
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('sessionId');
  });
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
      promise.then((value) => { clearTimeout(timer); resolve(value); })
             .catch((err)  => { clearTimeout(timer); reject(err); });
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
          console.warn('Firestore snapshot timeout; switching to local demo data.');
          setError('Firestore access timed out; using local demo data.');
          setStudents(IT1_STUDENTS);
          setClaims({});
          setUseLocalMode(true);
          setLoading(false);
        }, 5500);

        unsubs.push(onSnapshot(collection(db, COLL_STUDENTS), (s) => {
          clearTimeout(fallbackTimer);
          const list = s.docs.map(d => ({ ...d.data(), id: d.id }));
          list.sort((a, b) => a.roll.localeCompare(b.roll));
          setStudents(list);
          setLoading(false);
        }, (e) => {
          clearTimeout(fallbackTimer);
          console.error(e);
          setError('Could not load students from Firestore; using local demo data.');
          setStudents(IT1_STUDENTS);
          setClaims({});
          setUseLocalMode(true);
          setLoading(false);
        }));

        unsubs.push(onSnapshot(collection(db, COLL_CLAIMS), (s) => {
          clearTimeout(fallbackTimer);
          const map = {};
          s.docs.forEach(d => { map[d.id] = d.data(); });
          setClaims(map);
        }, (e) => {
          clearTimeout(fallbackTimer);
          console.error(e);
          setError('Could not load claims from Firestore; using local demo data.');
          setStudents(IT1_STUDENTS);
          setClaims({});
          setUseLocalMode(true);
          setLoading(false);
        }));

        unsubs.push(onSnapshot(collection(db, COLL_WALL), (s) => {
          setWallPosts(
            s.docs.map(d => ({ id: d.id, ...d.data() }))
              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          );
        }));

        unsubs.push(onSnapshot(collection(db, COLL_TESTIMONIALS), (s) => {
          setTestimonials(
            s.docs.map(d => ({ id: d.id, ...d.data() }))
              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          );
        }));

        unsubs.push(onSnapshot(collection(db, COLL_MEDIA), (s) => {
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
    return () => {
      clearTimeout(fallbackTimer);
      unsubs.forEach(u => u());
    };
  }, []);

  const updateStudent = useCallback(async (id, updates) => {
    const { photo, ...rest } = updates;
    await updateDoc(doc(db, COLL_STUDENTS, id), { ...rest, updatedAt: serverTimestamp() });
  }, []);

  const uploadPhoto = useCallback(async (studentId, file) => {
    let uploadFile = file;
    try {
      const compress = (await import('browser-image-compression')).default;
      uploadFile = await compress(file, { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true });
    } catch {}
    const storageRef = ref(storage, `photos/${studentId}/${Date.now()}_${file.name}`);
    const snap = await uploadBytes(storageRef, uploadFile);
    const url  = await getDownloadURL(snap.ref);
    await updateDoc(doc(db, COLL_STUDENTS, studentId), { photo: url, updatedAt: serverTimestamp() });
    return url;
  }, []);

  const addTimelineEvent = useCallback(async (studentId, event) => {
    const snap = await getDoc(doc(db, COLL_STUDENTS, studentId));
    const current = snap.data()?.timeline || [];
    await updateDoc(doc(db, COLL_STUDENTS, studentId), {
      timeline: [...current, { id: Date.now(), ...event }],
      updatedAt: serverTimestamp(),
    });
  }, []);

  const removeTimelineEvent = useCallback(async (studentId, eventId) => {
    const snap = await getDoc(doc(db, COLL_STUDENTS, studentId));
    const current = (snap.data()?.timeline || []).filter(e => e.id !== eventId);
    await updateDoc(doc(db, COLL_STUDENTS, studentId), { timeline: current, updatedAt: serverTimestamp() });
  }, []);

  const isClaimed = useCallback((id) => Boolean(claims[id]), [claims]);

  const claimProfile = useCallback(async (id, pin) => {
    if (claims[id]) return { ok: false, error: 'Already claimed.' };
    if (!pin || pin.length < 4) return { ok: false, error: 'PIN must be at least 4 digits.' };
    if (useLocalMode) {
      const nextClaims = { ...claims, [id]: { pinHash: simpleHash(pin), claimedAt: Date.now() } };
      setClaims(nextClaims);
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
  localStorage.removeItem('sessionId');}, []);

  // ✅ FIXED: Removed orphaned `throw e` and extra `}, []` that were outside the function
  const uploadMedia = useCallback(async (studentId, dataUrl, caption) => {
    if (useLocalMode) {
      throw new Error('Uploads are disabled in demo mode. Connect to Firestore to enable permanent storage.');
    }
    try {
      console.log('📸 Starting media upload for student:', studentId);
      const filename = `${studentId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `media/${studentId}/${filename}`);
      const blob = await (await fetch(dataUrl)).blob();
      console.log('📤 Uploading to Storage:', filename);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      console.log('✅ Storage upload complete, URL:', url);
      console.log('💾 Saving to Firestore media collection');
      const docRef = await addDoc(collection(db, COLL_MEDIA), {
        studentId,
        url,
        caption,
        uploadedAt: new Date().toISOString(),
      });
      console.log('✅ Media saved successfully! Doc ID:', docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('❌ Failed to upload media:', e);
      console.error('Error details:', e.message, e.code);
      throw new Error(`Upload failed: ${e.message || 'Unknown error'}`);
    }
  }, [useLocalMode]);

  const deleteMedia = useCallback(async (studentId, mediaId) => {
    try {
      await deleteDoc(doc(db, COLL_MEDIA, mediaId));
    } catch (e) {
      console.error('Failed to delete media:', e);
    }
  }, []);

  const unclaimedStudents = useMemo(
    () => students.filter((s) => !claims[s.id]),
    [students, claims]
  );

  const addWallPost = useCallback(async (studentId, name, message, anonymous) => {
    if (useLocalMode) {
      throw new Error('Posting is disabled in demo mode. Connect to Firestore for permanent messages.');
    }
    
    try {
      await addDoc(collection(db, COLL_WALL), {
        studentId, // Store the poster's ID for ownership
        name: anonymous ? 'Anonymous' : (name || 'Anonymous'),
        message, anonymous: Boolean(anonymous),
        color: Math.floor(Math.random() * 6),
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('Failed to add wall post:', e);
      throw new Error(`Failed to post: ${e.message || 'Unknown error'}`);
    }
  }, [useLocalMode]);

  const deleteWallPost = useCallback(async (id) => {
    if (useLocalMode) {
      throw new Error('Deleting is disabled in demo mode.');
    }
    
    try {
      await deleteDoc(doc(db, COLL_WALL, id));
    } catch (e) {
      console.error('Failed to delete wall post:', e);
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

  const loginAdmin     = useCallback((pin) => { if (pin === ADMIN_PIN) { setIsAdmin(true); return true; } return false; }, []);
  const logoutAdmin    = useCallback(() => setIsAdmin(false), []);
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
    if (!window.confirm('Delete ALL wall posts? Cannot be undone.')) return;
    const postsSnap = await getDocs(collection(db, COLL_WALL));
    const batch = writeBatch(db);
    postsSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }, []);

  const deleteAllTestimonials = useCallback(async () => {
    if (!window.confirm('Delete ALL testimonials? Cannot be undone.')) return;
    const testiSnap = await getDocs(collection(db, COLL_TESTIMONIALS));
    const batch = writeBatch(db);
    testiSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }, []);

  const resetAllData = useCallback(async () => {
    if (!window.confirm('Reset ALL profile data? Cannot be undone.')) return;
    const batch = writeBatch(db);
    IT1_STUDENTS.forEach(s => {
      batch.update(doc(db, COLL_STUDENTS, s.id), {
        bio:'', legacy:'', photo:null, superlative:'', tags:[], timeline:[], approved:true,
      });
    });
    const claimSnap = await getDocs(collection(db, COLL_CLAIMS));
    claimSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    setSessionId(null);
  }, []);

  return (
    <YearbookContext.Provider value={{
      students, unclaimedStudents, wallPosts, testimonials, mediaWallet, claimedCount: Object.keys(claims).length,
      updateStudent, uploadPhoto,
      addTimelineEvent, removeTimelineEvent,
      claims, isClaimed, claimProfile, verifyPin, unlockProfile, lockSession,
      sessionId, sessionStudent: students.find(s => s.id === sessionId) || null,
      addWallPost, deleteWallPost,
      addTestimonial, deleteTestimonial,
      uploadMedia, deleteMedia,
      isAdmin, loginAdmin, logoutAdmin, approveStudent, resetAllData, deleteAllVaults, deleteAllWallPosts, deleteAllTestimonials,
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