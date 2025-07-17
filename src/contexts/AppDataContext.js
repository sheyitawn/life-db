// src/contexts/AppDataContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import apiRequest from '../utils/apiRequest';

const AppDataContext = createContext();
export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
  const [habits, setHabits] = useState({});
  const [weeklyHabits, setWeeklyHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  // === Loaders ===
  const loadHabits = async () => {
    const daily = await apiRequest('/habits');
    const weekly = await apiRequest('/habits/weekly');
    setHabits(daily.habits);
    setWeeklyHabits(weekly);
  };

  const loadGoals = async () => {
    const data = await apiRequest('/goals');
    setGoals(data);
  };

  const loadRelationships = async () => {
    const data = await apiRequest('/relationships/relationships');
    setRelationships(data);
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      loadHabits(),
      loadGoals(),
      loadRelationships(),
    ]);
    setLoading(false);
  };

  const toggleHabit = async (habitKey) => {
    const res = await apiRequest('/habits/toggle', 'POST', { date: today, habitKey });
    setHabits(res.habits);
    await loadHabits(); // sync weekly too
  };

  const checkInRelationship = async (id) => {
    await apiRequest(`/relationships/checkin/${id}`, 'POST');
    await loadRelationships();
  };

  const skipRelationship = async (id) => {
    await apiRequest(`/relationships/skip/${id}`, 'POST');
    await loadRelationships();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <AppDataContext.Provider value={{
      habits,
      weeklyHabits,
      toggleHabit,
      goals,
      relationships,
      checkInRelationship,
      skipRelationship,
      refreshAll,
      loading,
    }}>
      {children}
    </AppDataContext.Provider>
  );
};
