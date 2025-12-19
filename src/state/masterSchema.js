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
      // e.g. phases: true
    },
  },

  weeklyGoals: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
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
    settings: {
      lastPeriodStart: '',
      lastPeriodEnd: '',
      cycleLengthDays: 28,
      periodLengthDays: 5,

      // ✅ NEW: allows proportional phase separators
      ovulationLengthDays: 1,
      lutealLengthDays: 14,
    },
    history: [],
  },

  weight: {
    entries: [],
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
