import React from "react";
import "./modal.css";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleContentClick = (e) => {
    e.stopPropagation(); // Prevent the click event from propagating to the overlay
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
