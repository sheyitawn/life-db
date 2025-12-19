import React from 'react';

import DailyGoal from '../../components/DailyGoal/DailyGoal';

import HabitView from '../../components/HabitView/HabitView';
import HabitMonthView from '../../components/HabitView/HabitMonthView';
import HabitTracker from '../../components/HabitTracker/HabitTracker';

import Fast from '../../components/Fast/Fast';
import FastView from '../../components/FastView/FastView';

import Daily from "../../components/Daily/Daily";

import Birthday from '../../components/Birthday/Birthday';
import Relationships from '../../components/Relationships/Relationships';
import RelationshipView from '../../components/Relationships/RelationshipView';

import ShowWeight from '../../components/Weight/ShowWeight';
import Weight from '../../components/Weight/Weight';

import Phases from '../../components/Phases/Phases';

import SunsetWalk from '../../components/SunsetWalk/SunsetWalk';
import DaySession from '../../components/DaySession/DaySession';

export const REGIONS = {
  CENTER: 'center',
  RIGHT: 'right',
};

export function buildRegistry(setOpenModalId) {
  const openHabits = () => setOpenModalId('habitsDetails');

  return [
    // ✅ Daily Goal as a widget, but "plain" (no border/card chrome)
    {
      id: 'weeklyGoals',
      region: REGIONS.CENTER,
      title: null,
      render: () => <DailyGoal />,
      card: {
        variant: 'plain',
        showHeader: false,
        className: 'ld-widget--full'
      },
    },
    {
      id: 'phases',
      region: REGIONS.RIGHT,
      title: 'Phases',
      render: () => <Phases />,
      card: { variant: 'plain', showHeader: false },
      modal: {
        id: 'phasesDetails',
        title: 'Phases',
        render: () => (
          <div style={{ opacity: 0.85 }}>
            Update your period dates in Config → Widgets → Phases to improve predictions.
          </div>
        ),
      },
    },
    {
      id: 'fasting',
      region: REGIONS.RIGHT,
      title: 'Fasting',
      render: () => <Fast />,
      modal: { id: 'fastingDetails', title: 'Fasting', render: () => <FastView /> },
    },

    {
      id: 'habitTracker',
      region: REGIONS.RIGHT,
      title: 'Habit Tracker',
      render: () => <Daily />,
    },



    {
      id: 'habitsWeekly',
      region: REGIONS.RIGHT,
      title: 'WEEKLY PROGRESS',
      render: () => <HabitView onClick={openHabits} />,
      modal: { id: 'habitsDetails', title: 'Habits', render: () => <HabitTracker /> },
    },

    {
      id: 'habitsMonthly',
      region: REGIONS.CENTER,
      title: 'Habits (Monthly)',
      render: () => <HabitMonthView onClick={openHabits} />,
      modal: { id: 'habitsDetails', title: 'Habits', render: () => <HabitTracker /> },
    },

    {
      id: 'relationshipsBirthdays',
      region: REGIONS.CENTER, title: 'Birthdays', render: () => <Birthday />
    },

    {
      id: 'relationshipsCheckin',
      region: REGIONS.RIGHT,
      title: 'Relationships',
      card: { variant: 'plain', showHeader: true },
      render: () => <Relationships />,
      modal: { id: 'relationshipDetails', title: 'Relationships', render: () => <RelationshipView /> },
    },

    {
      id: 'weight',
      region: REGIONS.CENTER,
      title: 'Weight',
      render: () => <ShowWeight onClick={() => setOpenModalId('weightDetails')} />,
      modal: { id: 'weightDetails', title: 'Weight', render: () => <Weight /> },
    },

    { id: 'sunsetWalk', region: REGIONS.CENTER, title: 'Sunset Walk', render: () => <SunsetWalk /> },
    { id: 'daySession', region: REGIONS.CENTER, title: 'Day Session', render: () => <DaySession /> },
  ];
}
