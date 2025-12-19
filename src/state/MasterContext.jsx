// src/state/MasterContext.jsx
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import {
  loadMasterFromLocalStorage,
  saveMasterToLocalStorage,
  importMasterFromFile,
  exportMasterToDownload,
  clearMaster,
} from './masterStorage';

const MasterContext = createContext(null);

export function MasterProvider({ children }) {
  const [master, setMaster] = useState(() => loadMasterFromLocalStorage());

  const updateMaster = useCallback((updater) => {
    setMaster((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return saveMasterToLocalStorage(next);
    });
  }, []);

  const actions = useMemo(() => {
    return {
      updateMaster,

      async importFromFile(file) {
        const imported = await importMasterFromFile(file); // already saves normalized version
        setMaster(imported);
        return imported;
      },

      exportToFile(filename = 'life-dashboard.master.json') {
        exportMasterToDownload(master, filename);
      },

      clearAll() {
        const cleared = clearMaster(); // removes LS key
        setMaster(cleared);            // reset state, and DO NOT auto-resave defaults
        return cleared;
      },
    };
  }, [master, updateMaster]);

  // IMPORTANT: provide BOTH `actions` and the individual functions (spread),
  // so components can do either `actions.exportToFile(...)` or `exportToFile(...)`.
  return (
    <MasterContext.Provider value={{ master, actions, ...actions }}>
      {children}
    </MasterContext.Provider>
  );
}

export function useMaster() {
  const ctx = useContext(MasterContext);
  if (!ctx) throw new Error('useMaster must be used inside <MasterProvider>.');
  return ctx;
}
