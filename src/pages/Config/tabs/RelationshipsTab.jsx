// src/pages/tabs/RelationshipsTab.jsx
import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useMaster } from '../../../state/MasterContext';
const FREQ_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'bimonthly', label: 'Bi-monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'biyearly', label: 'Bi-yearly' },
  { value: 'yearly', label: 'Yearly' },
];

function makeRelationship(name = '') {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name.trim(),
    birthday: '',
    checkinFrequency: 'weekly',
    lastCheckinDate: '',
    gettingPresent: false,
  };
}

export default function RelationshipsTab({ checkinsEnabled, birthdaysEnabled }) {
  const { master, actions } = useMaster();
  const list = useMemo(() => (Array.isArray(master?.relationships?.list) ? master.relationships.list : []), [master]);

  const [newName, setNewName] = useState('');
  const [newBirthday, setNewBirthday] = useState('');
  const [newFreq, setNewFreq] = useState('weekly');
  const [newPresent, setNewPresent] = useState(false);

  const setRelationships = (nextList) => {
    actions.updateMaster(prev => ({
      ...prev,
      relationships: { ...prev.relationships, list: nextList },
    }));
  };

  const addPerson = () => {
    const name = newName.trim();
    if (!name) {
      toast('Please enter a name.');
      return;
    }

    const exists = list.some(r => (r?.name || '').trim().toLowerCase() === name.toLowerCase());
    if (exists) {
      toast('That person already exists.');
      return;
    }

    const r = makeRelationship(name);

    if (birthdaysEnabled) {
      r.birthday = newBirthday || '';
      r.gettingPresent = !!newPresent;
    }
    if (checkinsEnabled) {
      r.checkinFrequency = newFreq || 'weekly';
    }

    setRelationships([r, ...list]);

    setNewName('');
    setNewBirthday('');
    setNewFreq('weekly');
    setNewPresent(false);
  };

  const removePerson = (id) => setRelationships(list.filter(r => r.id !== id));

  const updatePerson = (id, patch) => {
    setRelationships(list.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  return (
    <div className="cfg-rel-shell">
      <div className="cfg-rel-header">
        <div>
          <h2 className="cfg-section-title">Relationships</h2>
          <p className="cfg-help">
            Add, edit, and remove people. Fields appear only if the relevant widget is enabled.
          </p>

          <div className="cfg-rel-badges">
            <span className={checkinsEnabled ? 'cfg-chip cfg-chip-on' : 'cfg-chip cfg-chip-muted'}>
              Check-ins: {checkinsEnabled ? 'On' : 'Off'}
            </span>
            <span className={birthdaysEnabled ? 'cfg-chip cfg-chip-on' : 'cfg-chip cfg-chip-muted'}>
              Birthdays: {birthdaysEnabled ? 'On' : 'Off'}
            </span>
          </div>
        </div>
      </div>

      <div className="cfg-rel-add">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Name…"
          maxLength={50}
        />

        {checkinsEnabled && (
          <select value={newFreq} onChange={(e) => setNewFreq(e.target.value)}>
            {FREQ_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}

        {birthdaysEnabled && (
          <>
            <input
              type="date"
              value={newBirthday}
              onChange={(e) => setNewBirthday(e.target.value)}
            />
            <label className="cfg-inline-check">
              <input
                type="checkbox"
                checked={newPresent}
                onChange={(e) => setNewPresent(e.target.checked)}
              />
              Get present
            </label>
          </>
        )}

        <button onClick={addPerson}>Add</button>
      </div>

      <div className="cfg-rel-list">
        {list.length === 0 && <div className="cfg-empty">No relationships yet.</div>}

        {list.map(r => (
          <div key={r.id} className="cfg-rel-row">
            <input
              className="cfg-rel-name"
              value={r.name || ''}
              onChange={(e) => updatePerson(r.id, { name: e.target.value })}
              maxLength={50}
            />

            {checkinsEnabled && (
              <select
                value={r.checkinFrequency || 'weekly'}
                onChange={(e) => updatePerson(r.id, { checkinFrequency: e.target.value })}
              >
                {FREQ_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}

            {birthdaysEnabled && (
              <>
                <input
                  type="date"
                  value={r.birthday || ''}
                  onChange={(e) => updatePerson(r.id, { birthday: e.target.value })}
                />
                <label className="cfg-inline-check">
                  <input
                    type="checkbox"
                    checked={!!r.gettingPresent}
                    onChange={(e) => updatePerson(r.id, { gettingPresent: e.target.checked })}
                  />
                  Present
                </label>
              </>
            )}

            <button className="cfg-danger" onClick={() => removePerson(r.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
