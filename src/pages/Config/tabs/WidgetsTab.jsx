// src/pages/tabs/WidgetsTab.jsx
import React from 'react';
import WeeklyGoalsSettings from '../widgets/WeeklyGoalsSettings';
import WeightSettings from '../widgets/WeightSettings';
import PhasesSettings from '../widgets/PhasesSettings';
import { useMaster } from '../../../state/MasterContext';

export default function WidgetsTab({ widgets, enabledWidgets, enabledWidgetIds, widgetsSubPage, setWidgetsSubPage }) {
  const { master, actions } = useMaster();

  const toggleWidget = (widgetId) => {
    actions.updateMaster(prev => {
      const nextEnabled = { ...(prev.widgets?.enabled || {}) };
      if (nextEnabled[widgetId]) delete nextEnabled[widgetId];
      else nextEnabled[widgetId] = true;

      return {
        ...prev,
        widgets: {
          ...prev.widgets,
          enabled: nextEnabled,
        },
      };
    });

    if (!enabledWidgets?.[widgetId]) setWidgetsSubPage(widgetId);
    else if (widgetsSubPage === widgetId) setWidgetsSubPage('list');
  };

  const renderWidgetSettingsPage = (widgetId) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return null;

    const enabled = !!enabledWidgets?.[widgetId];

    return (
      <div className="cfg-widget-page">
        <div className="cfg-widget-page-header">
          <h3 className="cfg-section-title">{widget.label} Settings</h3>
          <div className="cfg-widget-page-actions">
            <button onClick={() => setWidgetsSubPage('list')}>← Back to list</button>
            <button className="cfg-danger" onClick={() => toggleWidget(widgetId)}>Disable</button>
          </div>
        </div>

        {widgetId === 'weeklyGoals' ? (
          <WeeklyGoalsSettings
            value={master.weeklyGoals}
            onChange={(next) => actions.updateMaster(prev => ({ ...prev, weeklyGoals: next }))}
          />
        ) : widgetId === 'weight' ? (
          <WeightSettings
            value={master.weight?.mode}
            onChange={(nextMode) =>
              actions.updateMaster(prev => ({
                ...prev,
                weight: {
                  ...prev.weight,
                  mode: nextMode,
                },
              }))
            }
          />
        ) : widgetId === 'phases' ? (
          <PhasesSettings
            master={master}
            enabled={enabled}
            onChangeSettings={(nextSettings) =>
              actions.updateMaster(prev => ({
                ...prev,
                phases: {
                  ...prev.phases,
                  settings: nextSettings,
                },
              }))
            }
            onRecord={() =>
              actions.updateMaster(prev => {
                const enabledNow = !!(prev.widgets?.enabled || {})?.phases;
                if (!enabledNow) return prev;

                const start = prev.phases?.settings?.lastPeriodStart || '';
                const end = prev.phases?.settings?.lastPeriodEnd || '';

                if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
                  return prev;
                }

                const nextHistory = Array.isArray(prev.phases?.history) ? [...prev.phases.history] : [];
                nextHistory.push({ start, end, recordedAt: new Date().toISOString() });

                return {
                  ...prev,
                  phases: {
                    ...prev.phases,
                    history: nextHistory,
                  },
                };
              })
            }
          />
        ) : (
          <div className="cfg-placeholder-box">
            Settings UI for <b>{widget.label}</b> goes here.
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="cfg-widgets-top">
        <div>
          <h2 className="cfg-section-title">Widgets</h2>
          <p className="cfg-help">Toggle widgets on/off. Enabling a widget adds a settings page for it.</p>
        </div>

        <div className="cfg-widgets-pill">
          Enabled: {enabledWidgetIds.length}
        </div>
      </div>

      <div className="cfg-subtabs">
        <button
          className={widgetsSubPage === 'list' ? 'cfg-subtab cfg-subtab-active' : 'cfg-subtab'}
          onClick={() => setWidgetsSubPage('list')}
        >
          Widget List
        </button>

        {enabledWidgetIds.map(id => {
          const w = widgets.find(x => x.id === id);
          return (
            <button
              key={id}
              className={widgetsSubPage === id ? 'cfg-subtab cfg-subtab-active' : 'cfg-subtab'}
              onClick={() => setWidgetsSubPage(id)}
              title={w?.label || id}
            >
              {w?.label || id}
            </button>
          );
        })}
      </div>

      {widgetsSubPage === 'list' ? (
        <div className="cfg-widgets-list">
          {widgets.map(w => {
            const on = !!enabledWidgets[w.id];
            return (
              <div key={w.id} className="cfg-widget-row">
                <div className="cfg-widget-info">
                  <div className="cfg-widget-title">{w.label}</div>
                  <div className="cfg-widget-sub">{on ? 'Enabled' : 'Disabled'}</div>
                </div>

                <div className="cfg-widget-actions">
                  <button
                    className={on ? 'cfg-toggle cfg-toggle-on' : 'cfg-toggle'}
                    onClick={() => toggleWidget(w.id)}
                  >
                    {on ? 'On' : 'Off'}
                  </button>

                  {on && (
                    <button onClick={() => setWidgetsSubPage(w.id)}>
                      Settings →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        renderWidgetSettingsPage(widgetsSubPage)
      )}
    </>
  );
}
