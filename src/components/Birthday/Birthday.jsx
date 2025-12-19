import React, { useMemo } from 'react';
import { GiPresent } from 'react-icons/gi';
import { FaRegCheckCircle } from 'react-icons/fa';
import './birthday.css';

import { useMaster } from '../../state/MasterContext';
import { normalizeRelationships, daysUntilBirthday } from '../../utils/relationshipsLocal';

export default function Birthday() {
  const { master, updateMaster } = useMaster();

  const enabled = master?.widgets?.enabled || {};
  const birthdaysEnabled = !!enabled.upcomingBirthdays;

  // Hooks must always run — do NOT return before these.
  const list = useMemo(
    () => normalizeRelationships(master?.relationships?.list || []),
    [master]
  );

  const upcoming = useMemo(() => {
    const now = new Date();
    return list
      .map(r => {
        const daysAway = r.birthday ? daysUntilBirthday(r.birthday, now) : null;
        return { ...r, daysAway };
      })
      .filter(r => typeof r.daysAway === 'number')
      .sort((a, b) => a.daysAway - b.daysAway)
      .slice(0, 5);
  }, [list]);

  if (!birthdaysEnabled) return null;
  if (upcoming.length === 0) return null;

  const togglePresent = (id) => {
    updateMaster(prev => {
      const m = structuredClone(prev || {});
      m.relationships = m.relationships || {};
      m.relationships.list = Array.isArray(m.relationships.list) ? m.relationships.list : [];

      m.relationships.list = m.relationships.list.map(r => {
        if (r.id !== id) return r;
        return { ...r, gotPresent: !r.gotPresent };
      });

      return m;
    });
  };

  return (
    <div className="birthday-container">
      {upcoming.map((person) => (
        <div key={person.id} className="birthday-person">
          <div>
            <strong>{person.name}&apos;s</strong> birthday is in <strong>{person.daysAway}</strong> days!
          </div>

          {person.gettingPresent && (
            <div style={{ marginTop: '0.5rem' }}>
              {!person.gotPresent ? (
                <button className="present-button" onClick={() => togglePresent(person.id)}>
                  <GiPresent /> Get Present
                </button>
              ) : (
                <button
                  className="present-gotten-button"
                  onClick={() => togglePresent(person.id)}
                  title="Click to mark present as not gotten"
                >
                  <FaRegCheckCircle /> Got Present!
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
