import React, { useMemo } from 'react';
import './relationships.css';
import { MdInfoOutline } from 'react-icons/md';

import { useMaster } from '../../state/MasterContext';
import { normalizeRelationships, computeCheckinMeta } from '../../utils/relationshipsLocal';

export default function Relationships() {
  const { master } = useMaster();

  const enabled = master?.widgets?.enabled || {};
  const checkinsEnabled = !!enabled.relationshipsCheckin;

  const rawList = master?.relationships?.list || [];

  const list = useMemo(
    () => normalizeRelationships(rawList),
    [rawList]
  );

  const mostDue = useMemo(() => {
    const withMeta = list.map(r => ({ ...r, ...computeCheckinMeta(r) }));

    return withMeta
      .sort((a, b) => {
        if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
        return a.dueInDays - b.dueInDays;
      })
      .slice(0, 5);
  }, [list]);

  if (!checkinsEnabled) return null;
  if (mostDue.length === 0) return null;

  return (
    <div className="relationships">
      <div className="relationships_box">
        <div className="relationships_relations">
          {mostDue.map((r) => (
            <div key={r.id} className="relationships_relation">
              <div className="relationships_relation_content">
                {r.name}
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
              <MdInfoOutline
                title={r.overdue ? 'Overdue' : `Due in ${r.dueInDays} day(s)`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
