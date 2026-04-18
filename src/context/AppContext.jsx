import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection, doc, onSnapshot, addDoc, updateDoc,
  deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const AppContext  = createContext(null);
const COLL_VAULTS = 'vaults';

const CLOUDINARY_CLOUD_NAME    = 'dirlbqjpb';
const CLOUDINARY_UPLOAD_PRESET = 'classvault';

export async function uploadToCloudinary(file) {
  let uploadFile = file;
  try {
    const compress = (await import('browser-image-compression')).default;
    uploadFile = await compress(file, { maxSizeMB: 0.7, maxWidthOrHeight: 1920, useWebWorker: true });
  } catch {}
  const formData = new FormData();
  formData.append('file', uploadFile);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) throw new Error(`Cloudinary error ${res.status}`);
  const data = await res.json();
  return data.secure_url;
}

export function AppProvider({ children }) {
  const [vaults,        setVaults]        = useState([]);
  const [activeVaultId, setActiveVaultId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, COLL_VAULTS),
      (snap) => {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setVaults(list);
      },
      (err) => console.error('Vaults listener:', err)
    );
    return () => unsub();
  }, []);

  const activeVault = vaults.find(v => v.id === activeVaultId) || null;
  const enterVault  = useCallback((id) => setActiveVaultId(id), []);
  const exitVault   = useCallback(() => setActiveVaultId(null), []);

  const createVault = useCallback(async (vault) => {
    try {
      await addDoc(collection(db, COLL_VAULTS), {
        ...vault, memories: [], createdAt: serverTimestamp(),
      });
    } catch (err) { console.error('createVault:', err); }
  }, []);

  // ── Delete entire vault — only creator can do this ────────────────────
  const deleteVault = useCallback(async (vaultId) => {
    if (!window.confirm('Delete this vault and all its memories? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, COLL_VAULTS, vaultId));
      setActiveVaultId(null);
    } catch (err) { console.error('deleteVault:', err); }
  }, []);

  const addMemory = useCallback(async (vaultId, memory) => {
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) return;
    try {
      await updateDoc(doc(db, COLL_VAULTS, vaultId), {
        memories: [{ ...memory, id: Date.now() }, ...(vault.memories || [])],
      });
    } catch (err) { console.error('addMemory:', err); }
  }, [vaults]);

  // ── Delete single memory — only uploader can do this ─────────────────
  // Note: Cloudinary file is orphaned (unsigned preset limitation)
  // but the image is removed from the app immediately
  const deleteMemory = useCallback(async (vaultId, memoryId) => {
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) return;
    const updated = (vault.memories || []).filter(m => m.id !== memoryId);
    try {
      await updateDoc(doc(db, COLL_VAULTS, vaultId), { memories: updated });
    } catch (err) { console.error('deleteMemory:', err); }
  }, [vaults]);

  const lockVault = useCallback(async (vaultId) => {
    try {
      await updateDoc(doc(db, COLL_VAULTS, vaultId), {
        locked: true, lockedAt: new Date().toISOString(),
      });
    } catch (err) { console.error('lockVault:', err); }
  }, []);

  const react = useCallback(async (vaultId, memoryId, key) => {
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) return;
    const updated = (vault.memories || []).map(m =>
      m.id !== memoryId ? m : {
        ...m, reactions: { ...m.reactions, [key]: (m.reactions[key] || 0) + 1 },
      }
    );
    try {
      await updateDoc(doc(db, COLL_VAULTS, vaultId), { memories: updated });
    } catch (err) { console.error('react:', err); }
  }, [vaults]);

  const addComment = useCallback(async (vaultId, memoryId, comment) => {
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) return;
    const updated = (vault.memories || []).map(m =>
      m.id !== memoryId ? m : { ...m, comments: [...(m.comments || []), comment] }
    );
    try {
      await updateDoc(doc(db, COLL_VAULTS, vaultId), { memories: updated });
    } catch (err) { console.error('addComment:', err); }
  }, [vaults]);

  return (
    <AppContext.Provider value={{
      vaults, activeVault, activeVaultId,
      enterVault, exitVault,
      createVault, deleteVault,
      addMemory, deleteMemory,
      lockVault, react, addComment,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}