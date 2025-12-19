import React from 'react';
import './widget.css';

/**
 * WidgetCard
 * - variant="card" (default): bordered glass card
 * - variant="plain": no background/border/shadow/padding (useful for “embedded” widgets like Daily Goal)
 * - showHeader=false: removes the widget header completely
 */
export default function WidgetCard({
  title,
  subtitle,
  right,
  actions,
  children,
  className = '',
  variant = 'card',
  showHeader = true,
}) {
  const variantClass = variant === 'plain' ? 'ld-widget--plain' : '';

  return (
    <div className={`ld-widget ${variantClass} ${className}`.trim()}>
      {showHeader && (title || right || actions) && (
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

      <div className="ld-widget__body">{children}</div>
    </div>
  );
}
