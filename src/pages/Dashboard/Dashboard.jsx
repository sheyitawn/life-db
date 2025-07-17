import React, { useState, useEffect, useRef } from 'react';
import './dashboard.css';
import { FaRegSnowflake, FaSun, FaCloudRain, FaCloud, FaWind } from "react-icons/fa";
import { MdLightbulb, MdInfoOutline, MdAdd } from 'react-icons/md';
import Timeline from '../../components/Timeline/Timeline';
import Phases from '../../components/Phases/Phases'
import MTest from '../../components/MTest'
import Modal from '../../components/Modal/Modal';
import Adventures from '../../components/Adventures/Adventures'
import axios from "axios";
import LifeInWeeks from '../../components/LifeInWeeks/LifeInWeeks'
import DailyGoal from '../../components/DailyGoal/DailyGoal'
import Activities from '../../components/Activities/Activities';
import Relationships from '../../components/Relationships/Relationships';
import apiRequest from '../../utils/apiRequest';
import Calendar from '../../components/Calendar/Calendar';
import Daily from '../../components/Daily/Daily';
import WeeklyProgress from '../../components/WeeklyProgress/WeeklyProgress';
import Clock from '../../components/Clock/Clock';
import Birthday from '../../components/Birthday/Birthday';
import ActivityManager from '../../components/ActivityManager/ActivityManager';
import Weight from '../../components/Weight/Weight';
import WeightChart from '../../components/WeightChart/WeightChart';
import HabitTracker from '../../components/HabitTracker/HabitTracker';
import HabitView from '../../components/HabitView/HabitView';
import Fast from '../../components/Fast/Fast';
import FastView from '../../components/FastView/FastView';
import RelationshipView from '../../components/Relationships/RelationshipView';

const weatherAPI = process.env.REACT_APP_WEATHER_API;
const weatherLOC = process.env.REACT_APP_WEATHER_LOC;

const Dashboard = () => {
  const refreshInterval = 10000;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [hour, setHour] = useState(currentTime.getHours());
  const [temperature, setTemperature] = useState(null); 
  const [openModal, setOpenModal] = useState(null); // Track which modal is open
  const [mainAdventure, setMainAdventure] = useState(null);
  const [mainActivity, setMainActivity] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(null);
  const [mostDueRelationships, setMostDueRelationships] = useState([]);
  // const relationshipsRef = useRef(null);

  const openSpecificModal = (modalName) => setOpenModal(modalName);
  const closeModal = () => setOpenModal(null);



  const [progressData, setProgressData] = useState([]);
  


  const weatherIconMap = {
    Clear: <FaSun />,
    Rain: <FaCloudRain />,
    Snow: <FaRegSnowflake />,
    Clouds: <FaCloud />,
    Wind: <FaWind />,
    Default: <>n/a</>,
  };

  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  // const calculateProgress = (lastCheckin, frequency) => {
  //   const now = new Date();
  //   const lastCheckinDate = parseDate(lastCheckin);
  //   const daysSinceCheckin = Math.ceil((now - lastCheckinDate) / (1000 * 60 * 60 * 24));
  //   const frequencyDays = frequency === 'weekly' ? 7 : 1; // Adjust for other frequencies if needed

  //   const progress = Math.min(daysSinceCheckin / frequencyDays, 1); // Progress percentage capped at 100%
  //   const daysLeft = Math.max(frequencyDays - daysSinceCheckin, 0); // Days until the next call

  //   return { progress, daysLeft, overdue: daysSinceCheckin >= frequencyDays };
  // };

  const greeting = () => {
    // const hour = currentTime.getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };


  // Format time and date
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("en-EU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // get main activity
  useEffect(() => {
    const fetchActivities = async () => {
        try {
          const response = await apiRequest('/activities/recommendations');
          setMainActivity(response.main);
        } catch (error) {
          console.error('Error fetching activities:', error);
        }
    };
    fetchActivities();

    const interval = setInterval(fetchActivities, refreshInterval); // Update every 5 seconds
    return () => clearInterval(interval);
}, []);

// get most due relationships
useEffect(() => {
  const fetchMostDueRelationships = async () => {
    try {
    const response = await apiRequest('/relationships/most-due');
    setMostDueRelationships(response)
    } catch (error) {
      console.error('Error fetching most due relationships:', error);
    }
  };
  fetchMostDueRelationships();

  const interval = setInterval(fetchMostDueRelationships, refreshInterval); // Update every 5 seconds
  return () => clearInterval(interval);


}, []);

// get recommended adventure
useEffect(() => {
  const fetchRecommendations = async () => {
      try {
          const response = await apiRequest('/adventures/recommendations');
          setMainAdventure(response.main);
          // setOtherRecommendations(response.others);

          // // Pass the main recommendation to the parent
          // if (setAdventure) {
          //     setAdventure(response.main);
          // }
      } catch (error) {
          console.error('Error fetching recommendations:', error);
      }
  };
  fetchRecommendations();

  const interval = setInterval(fetchRecommendations, refreshInterval); // Update every 5 seconds
  return () => clearInterval(interval);
}, []);

  // // Update the time every second
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date());
  //   }, 1000);

  //   // Cleanup the timer on component unmount
  //   return () => clearInterval(timer);
  // }, []);

  // Fetch daily goal
  useEffect(() => {
      const fetchGoal = async () => {
          try {
              // Format current date as YYYY-MM-DD
              const today = currentTime.toISOString().split('T')[0];
              const response = await apiRequest(`/goals/daily-goal?date=${today}`);
              setDailyGoal(response.goal);
          } catch (error) {
              console.error('Error fetching daily goal:', error);
              setDailyGoal(null); // Clear goal if an error occurs
          }
      };

      fetchGoal();

      const interval = setInterval(fetchGoal, refreshInterval); // Update every 5 seconds
      return () => clearInterval(interval);
  }, []);

  
// Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = weatherAPI;
      const city = weatherLOC;
      if (!apiKey || !city) {
      console.error("❌ Missing weather API key or city. ");
      return;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

      console.log("🚀 ~ fetchWeather ~ url:", url)
      try {
        const response = await axios.get(url);
        const weatherCondition = response.data.weather[0].main;
        const temp = response.data.main.temp;
        setWeather(weatherCondition);
        setTemperature(temp);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setWeather("Default");
        setTemperature(null);
      }
    };

    fetchWeather();

    const interval = setInterval(fetchWeather, refreshInterval); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);


 

  return (
    <div className="dashboard-border">
      <div className="dashboard">
        <div className="db-main">
          <div className="db-main_header">
            <div className="db-info">
              <h2 className='digital-clock'><Clock /></h2>
              <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer" className="weather-container">
                {weather ? weatherIconMap[weather] || weatherIconMap.Default : <FaCloud />}
                {temperature !== null && (
                  <span className="weather-temp">{Math.round(temperature)}°C</span>
                )}
              </a>

            </div>
            <div className="db-greeting">
              <h1>{greeting()}, Seyitan.</h1>
              <h3>
                Today is <b onClick={() => openSpecificModal("lifeinweeks")}>{formattedDate}. </b> 
                {
                  
                  hour < 12 ? <>It’s time to start your day.</>: hour < 18 ? <>Adventure awaits!</>: <>Time to wind down.</>
                }
              </h3>
            </div>
          </div>
          <Modal isOpen={openModal === "lifeinweeks"} onClose={closeModal}>
            <LifeInWeeks dateOfBirth="2003-03-22" />
          </Modal>
          <div className="db-main_content">
            <div className="db-main_content_timeline">
              {/* <Timeline /> */}
            <Calendar />
            </div>
            <div className="db-main_content_daily">
              <div>
                <h4>DAILY PROJECT GOAL</h4>
                  <div onClick={() => openSpecificModal("daily")}>
                    {
                      dailyGoal ? (
                        <p>{dailyGoal.goal}</p>
                      ) : (
                        <button> <MdAdd /> Set Goal</button>
                      )
                    }
                  </div>

                  <Modal isOpen={openModal === "daily"} onClose={closeModal}>
                    <DailyGoal />
                  </Modal>
              </div>
              {/* adventure */}
              {/* <div>
                <h4>ADVENTURE</h4>
                
                {mainAdventure && (<p>{mainAdventure.title}</p>)}

                <div onClick={() => openSpecificModal("adventures")}>see adventures</div>
                <Modal isOpen={openModal === "adventures"} onClose={closeModal}>
                  <Adventures setAdventure={setMainAdventure} />
                </Modal>
              </div> */}

              <Birthday />
              <HabitTracker />
              <HabitView />
              <Weight />
              <WeightChart />
              <Fast />
              <FastView />
              {/* weekly */}
              <h4>WEEKLY PROGRESS</h4>

              <div className="db-main_flex">
                <div>
                  <WeeklyProgress />
                </div>


                {/* ideas */}

                <div className="db-sidebar_ideas" onClick={() => openSpecificModal("ideas")}>
                  <div className="db-sidebar_ideas_box">
                    <h2>
                      <MdLightbulb />
                    </h2>
                    <p>idea of the day:</p>
                    <div className="db-sidebar_ideas_box_content">
                      GEOCACHING FOR RESTAURANTS
                    </div>
                  </div>
                  {/* <div className="db-sidebar-button" onClick={() => openSpecificModal("ideas")}>more ideas</div> */}
                </div>
              </div>

            </div>
          </div>
        </div>
        <div className="db-sidebar">
          <div className="db-sidebar_phases">
            <Phases />
            

            <div className="db-sidebar-button" onClick={() => openSpecificModal("phases")}>open cycle</div>
            {/* Modal 1 */}
            <Modal isOpen={openModal === "phases"} onClose={closeModal}>
              <h1>phases</h1>
              You shoukd feel (feeling during phase), however, dont let this define you! This is just a reminder that it is normal to feel like this during this time. Utilize this knowledge and change your perspective!
              <MTest />
            </Modal>





            {/* Modal 3 */}
            <Modal isOpen={openModal === "ideas"} onClose={closeModal}>
              <h1>ideas</h1>
              <p>This is the content for Modal 3.</p>
            </Modal>
          </div>
          <div className="db-sidebar_fast">
            You should aim for a 20 hour fast today.
            <MdInfoOutline onClick={() => openSpecificModal("fasting")}/>
              {/* Modal 3 */}
            <Modal isOpen={openModal === "fasting"} onClose={closeModal}>
              <h1>fasting</h1>
              <p>Since you are in the Follicular phase, it is recommended you fast for 20-24 hours.</p>
            </Modal>
          </div>
          <div className="db-sidebar_activity">
            <div className="db-sidebar_activity_box">
              <div className="db-sidebar_activity_header">RECOMMENDED ACTIVITY:</div>
              <Activities />
              {/* <div className="db-sidebar_activity_content">
                {mainActivity && (
                  <p>{mainActivity.title}</p>
                )}
              </div> */}
            </div>
            <div className="db-sidebar-button" onClick={() => openSpecificModal("activities")}>more activities</div>
          </div>

          <Modal isOpen={openModal === "activities"} onClose={closeModal}>
              <h1>activities</h1>

              <ActivityManager />
            </Modal>
          <div className="db-sidebar_daily">
            {/* <div className="db-sidebar_daily_header">DAILY</div> */}

            <div className="db-sidebar_daily_box">
              <Daily />
            </div>
          </div>
          <div className="db-sidebar_relationships">
            <div className="db-sidebar_relationships_box">
              <div className="db-sidebar_relationships_header">RECOMMENDED CHECK-INS:</div>
              <div className="db-sidebar_relationships_relations">
                {/* {mostDueRelationships.map((relationship) => (
                  <div key={relationship.id} className="db-sidebar_relationships_relation">
                    <div className="db-sidebar_relationships_relation_content">
                      {relationship.name}
                      <p>
                        {relationship.daysLeft > 0
                          ? `Next call in ${relationship.daysLeft} day(s)`
                          : 'Overdue! Call now.'}
                      </p>
                      <div className="db-sidebar_relationships_relation_content_progress">
                        <div
                          className="db-sidebar_relationships_relation_content_progress-bar"
                          style={{
                            width: `${relationship.progress * 100}%`,
                            background: relationship.overdue ? '#C62915' : '#15BAC6', // Red if overdue
                          }}
                        />
                      </div>
                    </div>
                    <MdInfoOutline />
                  </div>
                ))} */}
                
                <Relationships />
              </div>
            </div>
            <div className="db-sidebar-button" onClick={() => openSpecificModal("relationships")}>more relationships</div>
          </div>
          <Modal isOpen={openModal === "relationships"} onClose={closeModal}>
            <RelationshipView />
          </Modal>

          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
