import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [vaults, setVaults]                 = useState([]);
  const [activeVaultId, setActiveVaultId]   = useState(null);

  const activeVault = vaults.find(v => v.id === activeVaultId) || null;

  const enterVault = useCallback((id) => setActiveVaultId(id), []);
  const exitVault  = useCallback(() => setActiveVaultId(null), []);

  const createVault = useCallback((vault) => {
    setVaults(prev => [{ ...vault, id: Date.now(), memories: [] }, ...prev]);
  }, []);

  const updateVault = useCallback((id, updates) => {
    setVaults(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, []);

  const addMemory = useCallback((vaultId, memory) => {
    setVaults(prev => prev.map(v =>
      v.id === vaultId ? { ...v, memories: [memory, ...v.memories] } : v
    ));
  }, []);

  const updateMemory = useCallback((vaultId, memoryId, updates) => {
    setVaults(prev => prev.map(v =>
      v.id !== vaultId ? v : {
        ...v, memories: v.memories.map(m => m.id === memoryId ? { ...m, ...updates } : m),
      }
    ));
  }, []);

  const addComment = useCallback((vaultId, memoryId, comment) => {
    setVaults(prev => prev.map(v =>
      v.id !== vaultId ? v : {
        ...v,
        memories: v.memories.map(m =>
          m.id !== memoryId ? m : { ...m, comments: [...(m.comments || []), comment] }
        ),
      }
    ));
  }, []);

  const lockVault = useCallback((vaultId) => {
    setVaults(prev => prev.map(v =>
      v.id === vaultId ? { ...v, locked: true, lockedAt: new Date().toISOString() } : v
    ));
  }, []);

  const react = useCallback((vaultId, memoryId, key) => {
    setVaults(prev => prev.map(v =>
      v.id !== vaultId ? v : {
        ...v,
        memories: v.memories.map(m =>
          m.id !== memoryId ? m : {
            ...m, reactions: { ...m.reactions, [key]: (m.reactions[key] || 0) + 1 },
          }
        ),
      }
    ));
  }, []);

  return (
    <AppContext.Provider value={{
      vaults, createVault, updateVault,
      activeVault, activeVaultId, enterVault, exitVault,
      addMemory, updateMemory, addComment, lockVault, react,
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
