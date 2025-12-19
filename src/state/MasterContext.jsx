// src/state/MasterContext.jsx
import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import {
  loadMaster,
  saveMaster,
  importMasterFromFile,
  exportMasterToDownload,
  clearMaster,
} from "./masterStorage";

const MasterContext = createContext(null);

export function MasterProvider({ children }) {
  const [master, setMaster] = useState(null);

  // ✅ load once (async) from IndexedDB (with LS migration)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const loaded = await loadMaster();
      if (mounted) setMaster(loaded);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const updateMaster = useCallback((updater) => {
    setMaster((prev) => {
      if (!prev) return prev;
      const next = typeof updater === "function" ? updater(prev) : updater;

      // ✅ persist async, but keep UI immediate
      (async () => {
        await saveMaster(next);
      })();

      return next;
    });
  }, []);

  const actions = useMemo(() => {
    return {
      updateMaster,

      async importFromFile(file) {
        const imported = await importMasterFromFile(file); // saves
        setMaster(imported);
        return imported;
      },

      async exportToFile(filename = "life-dashboard.master.json") {
        if (!master) return;
        await exportMasterToDownload(master, filename);
      },

      async clearAll() {
        const cleared = await clearMaster();
        setMaster(cleared);
        return cleared;
      },
    };
  }, [master, updateMaster]);

  // while loading, you can render children or show nothing
  if (!master) {
    return (
      <MasterContext.Provider value={{ master: null, actions, ...actions }}>
        {children}
      </MasterContext.Provider>
    );
  }

  return <MasterContext.Provider value={{ master, actions, ...actions }}>{children}</MasterContext.Provider>;
}

export function useMaster() {
  const ctx = useContext(MasterContext);
  if (!ctx) throw new Error("useMaster must be used inside <MasterProvider>.");
  return ctx;
}
