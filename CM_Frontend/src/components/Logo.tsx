import React from 'react';

interface LogoProps {
  size?: number;
  color?: string;
}

export default function Logo({ size = 34, color = 'currentColor' }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="currentColor" d="M4 20V12" />
        <path stroke="currentColor" d="M4 8V4" />
        <path stroke="currentColor" d="M4 4l10 16" />
        <path stroke="currentColor" d="M14 20v-4" />
        <path stroke="currentColor" d="M14 12V4" />
        <path stroke="#FF9933" d="M18 9.5a3 3 0 0 1 0 5" />
        <path stroke="#FF9933" strokeLinecap="round" d="M21 6.5a7 7 0 0 1 0 11" />
      </svg>
    </div>
  );
}
