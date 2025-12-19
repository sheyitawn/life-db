// src/pages/tabs/GeneralTab.jsx
import React, { useMemo, useState } from 'react';
import { useMaster } from '../../../state/MasterContext';

export default function GeneralTab() {
  const { master, actions } = useMaster();

  const [loadedFileName, setLoadedFileName] = useState('');
  const [status, setStatus] = useState({ type: 'idle', msg: '' });

  const profile = master?.profile || {};
  const googleCalendar = profile?.googleCalendar || {};

  const statusClass =
    status.type === 'ok' ? 'cfg-status-ok' :
    status.type === 'error' ? 'cfg-status-err' :
    'cfg-status-idle';

  const masterSummary = useMemo(() => {
    if (!master) return null;
    const keys = Object.keys(master);
    return { topLevelKeys: keys.slice(0, 12), totalKeys: keys.length };
  }, [master]);

  return (
    <div className="cfg-general">
      <h2 className="cfg-section-title">General</h2>

      <div className="cfg-field">
        <label>Name</label>
        <input
          value={profile.name || ''}
          onChange={(e) => actions.updateMaster(prev => ({
            ...prev,
            profile: { ...prev.profile, name: e.target.value },
          }))}
          placeholder="Your name"
        />
      </div>

      <div className="cfg-field">
        <label>Location</label>
        <input
          value={profile.location || ''}
          onChange={(e) => actions.updateMaster(prev => ({
            ...prev,
            profile: { ...prev.profile, location: e.target.value },
          }))}
          placeholder="City, Country"
        />
      </div>

      <div className="cfg-field">
        <label>Google Calendar Client Secret</label>
        <input
          value={googleCalendar.clientSecret || ''}
          onChange={(e) => actions.updateMaster(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              googleCalendar: { ...prev.profile.googleCalendar, clientSecret: e.target.value },
            },
          }))}
          placeholder="(optional)"
        />
      </div>

      <hr className="cfg-hr" />

      <div className="cfg-field">
        <label>Load Master File</label>
        <input
          type="file"
          accept="application/json"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setLoadedFileName(file.name);
            try {
              await actions.importFromFile(file);
              setStatus({ type: 'ok', msg: 'Master file loaded.' });
            } catch (err) {
              setStatus({ type: 'error', msg: err?.message || 'Failed to load file.' });
            }
          }}
        />
        <div className={`cfg-status ${statusClass}`}>
          {loadedFileName ? <b>{loadedFileName}</b> : null} {status.msg}
        </div>
      </div>

      <div className="cfg-row">
        <button onClick={() => actions.exportToFile('life-dashboard.master.json')}>
          Download current master
        </button>
        <button className="cfg-danger" onClick={() => actions.clearAll()}>
          Clear saved master
        </button>
      </div>

      {masterSummary && (
        <div className="cfg-muted">
          Master keys: {masterSummary.totalKeys} (showing {masterSummary.topLevelKeys.join(', ')}…)
        </div>
      )}
    </div>
  );
}
