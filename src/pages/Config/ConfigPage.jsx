// src/pages/ConfigPage.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './configpage.css';

import GeneralTab from './tabs/GeneralTab';
import HabitsTab from './tabs/HabitsTab';
import RelationshipsTab from './tabs/RelationshipsTab';
import WidgetsTab from './tabs/WidgetsTab';

import { useMaster } from '../../state/MasterContext';

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'habits', label: 'Habits' },
  { key: 'relationships', label: 'Relationships' },
  { key: 'widgets', label: 'Widgets' },
];

const WIDGETS = [
  { id: 'weeklyGoals', label: 'Weekly Goals' },

  { id: 'habitsWeekly', label: 'Habits (Weekly View)' },
  { id: 'habitsMonthly', label: 'Habits (Monthly View)' },

  { id: 'relationshipsBirthdays', label: 'Upcoming Birthdays' },
  { id: 'relationshipsCheckin', label: 'Relationship Check-ins' },

  { id: 'phases', label: 'Phases' },

  // ✅ renamed
  { id: 'weight', label: 'Weight' },

  { id: 'sunsetWalk', label: 'Sunset Walk' },
  { id: 'ideaOfTheDay', label: 'Idea of the Day' },
  { id: 'focusWalkTimer', label: 'Focus Walk Timer' },
];

export default function ConfigPage() {
  const navigate = useNavigate();
  const { master } = useMaster();

  const [activeTab, setActiveTab] = useState('general');
  const [widgetsSubPage, setWidgetsSubPage] = useState('list');

  const enabledWidgets = master?.widgets?.enabled || {};

  const enabledWidgetIds = useMemo(() => {
    return WIDGETS.map(w => w.id).filter(id => !!enabledWidgets[id]);
  }, [enabledWidgets]);

  const checkinsEnabled = !!enabledWidgets.relationshipsCheckin;
  const birthdaysEnabled = !!enabledWidgets.relationshipsBirthdays;

  return (
    <div className="cfg-shell">
      <div className="cfg-header">
        <div>
          <h1 className="cfg-title">Config</h1>
          <p className="cfg-subtitle">Manage settings for all widgets and load a master file.</p>
        </div>

        <div className="cfg-header-actions">
          <button onClick={() => navigate('/')}>← Back</button>
        </div>
      </div>

      <div className="cfg-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={activeTab === t.key ? 'cfg-tab cfg-tab-active' : 'cfg-tab'}
            onClick={() => {
              setActiveTab(t.key);
              if (t.key === 'widgets') setWidgetsSubPage('list');
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="cfg-card">
        {activeTab === 'general' && <GeneralTab />}

        {activeTab === 'habits' && <HabitsTab />}

        {activeTab === 'relationships' && (
          <RelationshipsTab
            checkinsEnabled={checkinsEnabled}
            birthdaysEnabled={birthdaysEnabled}
          />
        )}

        {activeTab === 'widgets' && (
          <WidgetsTab
            widgets={WIDGETS}
            enabledWidgets={enabledWidgets}
            enabledWidgetIds={enabledWidgetIds}
            widgetsSubPage={widgetsSubPage}
            setWidgetsSubPage={setWidgetsSubPage}
          />
        )}
      </div>
    </div>
  );
}
