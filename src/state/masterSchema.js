// src/state/masterSchema.js

export const SCHEMA_VERSION = 1;

export const DEFAULT_MASTER = {
  schemaVersion: SCHEMA_VERSION,
  updatedAt: new Date().toISOString(),

  profile: {
    name: '',
    location: '',
    googleCalendar: {
      clientSecret: '',
    },
  },

  widgets: {
    enabled: {
      // e.g. weight: true
    },
  },

  weeklyGoals: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
  },

  habits: {
    list: [],
    records: [],
    deletedIds: [],
  },

  relationships: {
    list: [],
  },

  phases: {
    periodDates: [],
  },

  // ✅ Weight is now fully master-file driven
  weight: {
    // [{ ts:'2025-12-18T16:01:12.345Z', kg: 92.4 }]
    entries: [],
    // “Weight loss mode” + start/goal
    mode: {
      enabled: false,
      startKg: null,
      goalKg: null,
    },
  },

  other: {
    ideaList: [],
  },
};
