import React from 'react';
import { Info } from 'lucide-react';

interface GovPageShellProps {
  office: string;
  title: string;
  subtitle?: string;
  sourceNote?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const GovPageShell: React.FC<GovPageShellProps> = ({
  office, title, subtitle, sourceNote, actions, children
}) => (
  <div className="page-shell fade-in">
    <div className="page-shell-header">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="page-shell-office">{office}</div>
          <h1 className="page-shell-title">{title}</h1>
          {subtitle && <p className="page-shell-subtitle">{subtitle}</p>}
          {sourceNote && (
            <div className="page-shell-source">
              <Info size={9} /> {sourceNote}
            </div>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>{actions}</div>}
      </div>
    </div>
    {children}
  </div>
);

interface GovCardProps {
  title: string;
  subtitle?: string;
  source?: string;
  actions?: React.ReactNode;
  noPad?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const GovCard: React.FC<GovCardProps> = ({ title, subtitle, source, actions, noPad, children, style }) => (
  <div className="gov-card" style={{ marginBottom: 16, ...style }}>
    <div className="gov-card-header">
      <div>
        <div className="gov-card-title">{title}</div>
        {subtitle && <div className="gov-card-subtitle">{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {source && (
          <span className="data-source-badge">
            <Info size={9} /> {source}
          </span>
        )}
        {actions}
      </div>
    </div>
    <div className={noPad ? '' : 'gov-card-body'}>{children}</div>
  </div>
);
