import React from "react";
import "./lifeinweeks.css";

const LifeInWeeks = ({ dateOfBirth, lifeExpectancy = 90 }) => {
  const weeksInYear = 52;
  const totalWeeks = lifeExpectancy * weeksInYear;
  const birthDate = new Date(dateOfBirth);
  const currentDate = new Date();

  // Calculate current age in weeks
  const ageInWeeks =
    Math.floor((currentDate - birthDate) / (1000 * 60 * 60 * 24 * 7)) || 0;

  const weeksArray = Array.from({ length: totalWeeks }, (_, index) => {
    return index < ageInWeeks ? "filled" : "empty";
  });

  return (
    <div className="life-in-weeks">
          <h2>Life in weeks</h2>  

        <div className="life-in-weeks_content">
        {weeksArray.map((status, index) => (
            <div
            key={index}
            className={`week-box ${status}`}
            title={`Week ${index + 1}`}
            />
        ))}
        </div>
    </div>
  );
};

export default LifeInWeeks;
