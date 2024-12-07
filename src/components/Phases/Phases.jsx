import React, { useEffect, useState, useRef } from "react";
import "./phase.css";

const Phase = () => {
  const canvasRef = useRef(null);
  const ballRef = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Circle and Ball Parameters
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 50;
    const ballRadius = 6;

    let angle = 0; // Starting angle in radians
    const speed = 0.01; // Speed of the ball

    const draw = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      // Draw Circle Outline
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "white"; // Set circle outline color
      ctx.lineWidth = 3; // Set circle outline thickness
      ctx.stroke();

      // Draw Irregular Quadrant Lines
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius - 10);
      ctx.lineTo(centerX, centerY + radius - 50);

      ctx.moveTo(centerX + 90, centerY - radius - 10);
      ctx.lineTo(centerX, centerY + radius - 50);

      ctx.moveTo(centerX - 60, centerY + 60);
      ctx.lineTo(centerX, centerY + radius - 50);

      ctx.moveTo(centerX + 40, centerY + 65);
      ctx.lineTo(centerX, centerY + radius - 50);

      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;
      ctx.stroke();

      // Add Text in the Center
      ctx.fillStyle = "white";
      ctx.font = "6px";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("FOLLICULAR PHASE", centerX, centerY);

      // Calculate Ball Position
      const ballX = centerX + radius * Math.cos(angle);
      const ballY = centerY + radius * Math.sin(angle);

      // Update ballRef coordinates
      ballRef.current.x = ballX;
      ballRef.current.y = ballY;

      // Draw Ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#DC0B46"; // Set ball color
      ctx.fill();

      // Update Angle for Next Frame
      angle += speed;

      // Request Next Frame
      requestAnimationFrame(draw);
    };

    draw(); // Start the animation

    return () => {
      cancelAnimationFrame(draw); // Clean up animation on component unmount
    };
  }, []);

  return (
    <div className="phase">
      <canvas
        ref={canvasRef}
        className="phase-canvas"
        width={120}
        height={120}
        style={{ backgroundColor: "black" }} // Optional: Add a background color for better contrast
      />
      {/* <p>
        Ball Coordinates: X: {ballRef.current.x?.toFixed(2)}, Y:{" "}
        {ballRef.current.y?.toFixed(2)}
      </p> */}
    </div>
  );
};

export default Phase;
