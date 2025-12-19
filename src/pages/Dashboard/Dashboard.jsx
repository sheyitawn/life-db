import React, { useEffect, useMemo, useState } from 'react';
import './dashboard.css';

import { FaRegSnowflake, FaSun, FaCloudRain, FaCloud, FaWind } from "react-icons/fa";
import { MdInfoOutline, MdSettings } from 'react-icons/md';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

import Calendar from '../../components/Calendar/Calendar';
import Phases from '../../components/Phases/Phases';
import Fast from '../../components/Fast/Fast';
import FastView from '../../components/FastView/FastView';
import Daily from "../../components/Daily/Daily";
import Clock from '../../components/Clock/Clock';

import WidgetCard from '../../components/Widget/WidgetCard';
import WidgetModal from '../../components/Widget/WidgetModal';

import { buildRegistry, REGIONS } from './dashboardRegistry';
import { useMaster } from '../../state/MasterContext';

const weatherAPI = process.env.REACT_APP_WEATHER_API;
const weatherLOC = process.env.REACT_APP_WEATHER_LOC;

function todayKey(date = new Date()) {
  const day = date.getDay(); // 0 Sun, 1 Mon...
  if (day === 0) return 'sunday';
  if (day === 1) return 'monday';
  if (day === 2) return 'tuesday';
  if (day === 3) return 'wednesday';
  if (day === 4) return 'thursday';
  if (day === 5) return 'friday';
  if (day === 6) return 'saturday';
  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { master } = useMaster();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [hour, setHour] = useState(currentTime.getHours());

  const [weather, setWeather] = useState(null);
  const [temperature, setTemperature] = useState(null);

  const [openModalId, setOpenModalId] = useState(null);

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setHour(now.getHours());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!weatherAPI || !weatherLOC) return;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(weatherLOC)}&appid=${weatherAPI}&units=metric`;
      try {
        const response = await axios.get(url);
        setWeather(response.data.weather?.[0]?.main || "Default");
        setTemperature(response.data.main?.temp ?? null);
      } catch (e) {
        console.error("Weather fetch error:", e);
        setWeather("Default");
        setTemperature(null);
      }
    };

    fetchWeather();
    const t = setInterval(fetchWeather, 10000);
    return () => clearInterval(t);
  }, []);

  const greeting = () => {
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formattedDate = currentTime.toLocaleDateString("en-EU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const weatherIconMap = {
    Clear: <FaSun />,
    Rain: <FaCloudRain />,
    Snow: <FaRegSnowflake />,
    Clouds: <FaCloud />,
    Wind: <FaWind />,
    Default: <>?</>,
  };

  const enabledWidgets = master?.widgets?.enabled || {};
  const userName = (master?.profile?.name || 'user').trim() || 'user';

  const registry = useMemo(() => buildRegistry(setOpenModalId), [setOpenModalId]);

  const enabledIds = useMemo(
    () => registry.map(w => w.id).filter(id => !!enabledWidgets[id]),
    [registry, enabledWidgets]
  );

  const centerWidgets = useMemo(
    () => registry.filter(w => w.region === REGIONS.CENTER && enabledIds.includes(w.id)),
    [registry, enabledIds]
  );

  const rightWidgets = useMemo(
    () => registry.filter(w => w.region === REGIONS.RIGHT && enabledIds.includes(w.id)),
    [registry, enabledIds]
  );

  const modals = useMemo(() => {
    const map = new Map();
    registry.forEach(w => {
      if (!enabledIds.includes(w.id)) return;
      if (w.modal?.id && w.modal?.render && !map.has(w.modal.id)) {
        map.set(w.modal.id, w.modal);
      }
    });
    return Array.from(map.values());
  }, [registry, enabledIds]);

  const todaysGoal = useMemo(() => {
    const key = todayKey(currentTime);
    if (!key) return '';
    return (master?.weeklyGoals?.[key] || '').trim();
  }, [master, currentTime]);

  return (
    <div className="dashboard-border">
      <div className="dashboard">
        <div className="db-main">
          <div className="db-main_header">
            <div className="db-info">
              <h2 className='digital-clock'><Clock /></h2>

              <a
                href="https://openweathermap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="weather-container"
              >
                {weather ? (weatherIconMap[weather] || weatherIconMap.Default) : <FaCloud />}
                {temperature !== null && (
                  <div className="db_weather-temp">{Math.round(temperature)}°C</div>
                )}
              </a>

              <button onClick={() => navigate('/config')}>
                <MdSettings /> Config
              </button>
            </div>

            <div className="db-greeting">
              <h1>{greeting()}, {userName}.</h1>
              <h3>
                Today is <b>{formattedDate}. </b>
                {hour < 12 ? <>It’s time to start your day.</> : hour < 18 ? <>Adventure awaits!</> : <>Time to wind down.</>}
              </h3>
            </div>
          </div>

          <div className="db-main_content">
            <div className="db-main_content_timeline">
              <Calendar />
            </div>

            <div className="db-main_content_daily">
              <h4>WEEKLY GOAL (TODAY)</h4>
              <div className="db-main_content_daily-goal">
                {todaysGoal ? <p>{todaysGoal}</p> : <p style={{ opacity: 0.5 }}>Set your weekly goals in Config → Widgets → Weekly Goals</p>}
              </div>

              <div className="db-main_flex ld-center-grid">
                {centerWidgets.map(w => (
                  <WidgetCard
                    key={w.id}
                    title={w.title}
                    actions={
                      w.modal?.id ? (
                        <button className="ld-details-btn" onClick={() => setOpenModalId(w.modal.id)}>
                          Details
                        </button>
                      ) : null
                    }
                  >
                    {w.render()}
                  </WidgetCard>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="db-sidebar">
          <WidgetCard
            title="Phases"
            actions={<button className="ld-details-btn" onClick={() => setOpenModalId('phasesDetails')}>Details</button>}
          >
            <Phases />
          </WidgetCard>

          <WidgetModal
            isOpen={openModalId === 'phasesDetails'}
            onClose={() => setOpenModalId(null)}
            title="Phases"
          >
            <div style={{ opacity: 0.85 }}>
              You should feel (feeling during phase), however, dont let this define you! This is just a reminder that it is normal to feel like this during this time.
            </div>
          </WidgetModal>

          <WidgetCard
            title="Fasting"
            right={<MdInfoOutline style={{ cursor: 'pointer' }} onClick={() => setOpenModalId('fastingDetails')} />}
          >
            <Fast />
          </WidgetCard>

          <WidgetModal
            isOpen={openModalId === 'fastingDetails'}
            onClose={() => setOpenModalId(null)}
            title="Fasting"
          >
            <FastView />
          </WidgetModal>

          <WidgetCard title="Habit Tracker">
            <Daily />
          </WidgetCard>

          {rightWidgets.map(w => (
            <WidgetCard
              key={w.id}
              title={w.title}
              actions={
                w.modal?.id ? (
                  <button className="ld-details-btn" onClick={() => setOpenModalId(w.modal.id)}>
                    Details
                  </button>
                ) : null
              }
            >
              {w.render()}
            </WidgetCard>
          ))}

          {modals.map(m => (
            <WidgetModal
              key={m.id}
              isOpen={openModalId === m.id}
              onClose={() => setOpenModalId(null)}
              title={m.title}
            >
              {m.render()}
            </WidgetModal>
          ))}
        </div>
      </div>
    </div>
  );
}
