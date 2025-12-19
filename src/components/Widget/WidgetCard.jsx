import React from 'react';
import './widget.css';

export default function WidgetCard({
  title,
  subtitle,
  right,
  actions,
  children,
  className = '',
}) {
  return (
    <div className={`ld-widget ${className}`}>
      {(title || right || actions) && (
        <div className="ld-widget__header">
          <div className="ld-widget__titles">
            {title && <div className="ld-widget__title">{title}</div>}
            {subtitle && <div className="ld-widget__subtitle">{subtitle}</div>}
          </div>

          <div className="ld-widget__right">
            {right}
            {actions}
          </div>
        </div>
      )}

      <div className="ld-widget__body">
        {children}
      </div>
    </div>
  );
}
