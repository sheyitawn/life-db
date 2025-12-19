import React, { useMemo } from 'react';
import { toast } from 'react-toastify';
import './relationships.css';

import { useMaster } from '../../state/MasterContext';
import {
  normalizeRelationships,
  computeCheckinMeta,
  todayYmd
} from '../../utils/relationshipsLocal';

export default function RelationshipView() {
  const { master, actions } = useMaster();

  const enabled = master?.widgets?.enabled || {};
  const checkinsEnabled = !!enabled.relationshipsCheckin;

  const rawList = master?.relationships?.list || [];

  const list = useMemo(
    () => normalizeRelationships(rawList),
    [rawList]
  );

  const sorted = useMemo(() => {
    return list
      .map(r => ({ ...r, ...computeCheckinMeta(r) }))
      .sort((a, b) => {
        if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
        return a.dueInDays - b.dueInDays;
      });
  }, [list]);

  const doCheckIn = (id) => {
    actions.updateMaster(prev => {
      const m = structuredClone(prev || {});
      m.relationships = m.relationships || {};
      m.relationships.list = Array.isArray(m.relationships.list) ? m.relationships.list : [];

      m.relationships.list = m.relationships.list.map(r =>
        r.id === id ? { ...r, lastCheckinDate: todayYmd() } : r
      );

      return m;
    });

    const r = list.find(x => x.id === id);
    toast(`Checked in with ${r?.name || 'someone'}.`);
  };

  const skip = (id) => {
    const now = new Date();
    now.setDate(now.getDate() + 2);
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const twoDaysFromNow = `${y}-${m}-${d}`;

    actions.updateMaster(prev => {
      const m2 = structuredClone(prev || {});
      m2.relationships = m2.relationships || {};
      m2.relationships.list = Array.isArray(m2.relationships.list) ? m2.relationships.list : [];

      m2.relationships.list = m2.relationships.list.map(r =>
        r.id === id ? { ...r, lastCheckinDate: twoDaysFromNow } : r
      );

      return m2;
    });

    toast('Skipped. Next check-in pushed by ~2 days.');
  };

  if (!checkinsEnabled) return null;
  if (sorted.length === 0) return null;

  return (
    <div className="relationships-view">
      <div className="relationships_box">
        <h1 className="relationships_header">relationships</h1>

        <div className="relationships-view_relations">
          {sorted.map((r) => (
            <div key={r.id} className="relationships_relation">
              <div className="relationships_relation_content">
                <p>{r.name}</p>

                <div className="relationships_relation_content_progress">
                  <div
                    className="relationships_relation_content_progress-bar"
                    style={{
                      width: `${Math.max(0, Math.min(1, r.progress)) * 100}%`,
                      background: r.overdue ? '#C62915' : '#15BAC6',
                    }}
                  />
                </div>
              </div>

              <div className="relationships_relation_buttons">
                <button onClick={() => doCheckIn(r.id)}>CHECK-IN</button>
                <button onClick={() => skip(r.id)}>SKIP</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
