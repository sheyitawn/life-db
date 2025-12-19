import React from 'react';
import Modal from '../Modal/Modal';
import './widget.css';

export default function WidgetModal({ isOpen, onClose, title, children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ld-modal">
        {title && <div className="ld-modal__title">{title}</div>}
        <div className="ld-modal__body">{children}</div>
      </div>
    </Modal>
  );
}
