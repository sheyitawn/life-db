import React, { useState, useEffect } from 'react';


const Clock = () => {

      const [currentTime, setCurrentTime] = useState(new Date());
    
      const parseDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day);
    };
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
      // Update the time every second
      useEffect(() => {
        const timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);
    
        // Cleanup the timer on component unmount
        return () => clearInterval(timer);
      }, []);

  return (
    <>{currentTime.toLocaleTimeString()}</>
  )
}

export default Clock