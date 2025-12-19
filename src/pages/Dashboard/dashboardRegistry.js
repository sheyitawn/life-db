// src/pages/Dashboard/dashboardRegistry.js
import React from 'react';

import HabitView from '../../components/HabitView/HabitView';
import HabitMonthView from '../../components/HabitView/HabitMonthView';
import HabitTracker from '../../components/HabitTracker/HabitTracker';

import Birthday from '../../components/Birthday/Birthday';
import Relationships from '../../components/Relationships/Relationships';
import RelationshipView from '../../components/Relationships/RelationshipView';

import ShowWeight from '../../components/Weight/ShowWeight';
import Weight from '../../components/Weight/Weight';

import SunsetWalk from '../../components/SunsetWalk/SunsetWalk';
import DaySession from '../../components/DaySession/DaySession';

export const REGIONS = {
  CENTER: 'center',
  RIGHT: 'right',
};

export function buildRegistry(setOpenModalId) {
  const openHabits = () => setOpenModalId('habitsDetails');

  return [
    // ✅ Habits (Weekly View) widget
    {
      id: 'habitsWeekly',
      region: REGIONS.RIGHT,
      title: 'WEEKLY PROGRESS',
      render: () => <HabitView onClick={openHabits} />,
      modal: {
        id: 'habitsDetails',
        title: 'Habits',
        render: () => <HabitTracker />,
      },
    },

    // ✅ Habits (Monthly View) widget (separate widget)
    {
      id: 'habitsMonthly',
      region: REGIONS.CENTER,
      title: 'Habits (Monthly)',
      render: () => <HabitMonthView onClick={openHabits} />,
      // reuse the same modal as weekly
      modal: {
        id: 'habitsDetails',
        title: 'Habits',
        render: () => <HabitTracker />,
      },
    },

    {
      id: 'relationshipsBirthdays',
      region: REGIONS.CENTER,
      title: 'Birthdays',
      render: () => <Birthday />,
    },

    {
      id: 'relationshipsCheckin',
      region: REGIONS.RIGHT,
      title: 'Relationships',
      render: () => <Relationships />,
      modal: {
        id: 'relationshipDetails',
        title: 'Relationships',
        render: () => <RelationshipView />,
      },
    },

    {
      id: 'weight',
      region: REGIONS.CENTER,
      title: 'Weight',
      render: () => <ShowWeight onClick={() => setOpenModalId('weightDetails')} />,
      modal: {
        id: 'weightDetails',
        title: 'Weight',
        render: () => <Weight />,
      },
    },

    {
      id: 'sunsetWalk',
      region: REGIONS.CENTER,
      title: 'Sunset Walk',
      render: () => <SunsetWalk />,
    },

    {
      id: 'daySession',
      region: REGIONS.CENTER,
      title: 'Day Session',
      render: () => <DaySession />,
    },
  ];
}
