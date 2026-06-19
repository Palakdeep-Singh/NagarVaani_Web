import React, { useState, useEffect, useRef } from 'react';
import { emApi, fmt } from '../api/emApi.js';

/* ─────────────── SVG Icon Library ─────────────── */
const IC = {
  PrePoll: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9"/>
      <rect x="10" y="7" width="4" height="14"/>
      <rect x="17" y="3" width="4" height="18"/>
    </svg>
  ),
  Book: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
  Lock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  WifiOn: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0114.08 0"/>
      <path d="M1.42 9a16 16 0 0121.16 0"/>
      <path d="M8.53 16.11a6 6 0 016.95 0"/>
      <circle cx="12" cy="20" r="1" fill="currentColor"/>
    </svg>
  ),
  WifiOff: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="2" x2="22" y2="22"/>
      <path d="M8.5 16.5a5 5 0 017 0"/>
      <path d="M5 12.55a11 11 0 015.17-2.39"/>
      <path d="M1.42 9a16 16 0 014.7-2.88"/>
      <path d="M19.08 12.55A11 11 0 0121.58 9"/>
      <circle cx="12" cy="20" r="1" fill="currentColor"/>
    </svg>
  ),
  Shield: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Users: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Clock: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  FileText: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

/* ─────────────── CSS ─────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pod-root {
    display: flex;
    height: 100vh;
    font-family: 'Inter', system-ui, sans-serif;
    background: #f1f5f9;
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .pod-sidebar {
    width: 240px;
    min-width: 240px;
    background: #0f172a;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    position: relative;
    z-index: 10;
    box-shadow: 4px 0 24px rgba(0,0,0,0.3);
  }
  .pod-sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .pod-logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(79,70,229,0.4);
  }
  .pod-logo-text { flex: 1; min-width: 0; }
  .pod-logo-text h1 {
    font-size: 0.95rem;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.2px;
    white-space: nowrap;
  }
  .pod-logo-text span {
    font-size: 0.72rem;
    color: #64748b;
    font-weight: 500;
    letter-spacing: 0.3px;
  }

  .pod-nav {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
  }
  .pod-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: #94a3b8;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.88rem;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: all 0.18s ease;
    position: relative;
  }
  .pod-nav-item:hover {
    background: rgba(255,255,255,0.06);
    color: #e2e8f0;
  }
  .pod-nav-item.active {
    background: rgba(79,70,229,0.18);
    color: #818cf8;
    font-weight: 600;
  }
  .pod-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: #4f46e5;
    border-radius: 0 3px 3px 0;
  }
  .pod-nav-item svg { flex-shrink: 0; }

  .pod-sidebar-bottom {
    padding: 12px 12px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .pod-logout-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 10px;
    border: none;
    background: rgba(239,68,68,0.12);
    color: #f87171;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: all 0.18s ease;
  }
  .pod-logout-btn:hover {
    background: rgba(239,68,68,0.22);
    color: #ef4444;
  }

  /* ── Main ── */
  .pod-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f1f5f9;
  }

  /* ── Header ── */
  .pod-header {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 0 28px;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    box-shadow: 0 1px 8px rgba(0,0,0,0.05);
  }
  .pod-header-left { display: flex; align-items: center; gap: 16px; }
  .pod-header-booth {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
  }
  .pod-header-sub {
    font-size: 0.82rem;
    color: #64748b;
    font-weight: 500;
  }
  .pod-header-divider {
    width: 1px;
    height: 28px;
    background: #e2e8f0;
  }
  .pod-role-badge {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    letter-spacing: 0.3px;
  }
  .pod-header-right { display: flex; align-items: center; gap: 12px; }

  .pod-offline-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 24px;
    border: 1.5px solid;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .pod-offline-toggle.online {
    border-color: #16a34a;
    background: #f0fdf4;
    color: #16a34a;
  }
  .pod-offline-toggle.offline {
    border-color: #ef4444;
    background: #fef2f2;
    color: #ef4444;
  }
  .pod-sync-badge {
    background: #f59e0b;
    color: white;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 12px;
  }

  /* ── Scroll area ── */
  .pod-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .pod-scroll::-webkit-scrollbar { width: 6px; }
  .pod-scroll::-webkit-scrollbar-track { background: transparent; }
  .pod-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

  /* ── Offline Banner ── */
  .pod-offline-banner {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    padding: 14px 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 4px 16px rgba(239,68,68,0.3);
    animation: slideDown 0.3s ease;
  }
  @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

  /* ── Cards ── */
  .pod-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    padding: 24px;
  }
  .pod-card-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .pod-card-sub {
    font-size: 0.82rem;
    color: #64748b;
    margin-bottom: 20px;
  }

  /* ── Page title row ── */
  .pod-page-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
  }
  .pod-page-sub { font-size: 0.85rem; color: #64748b; margin-bottom: 4px; }

  /* ── Progress bar ── */
  .pod-progress-wrap { margin-bottom: 20px; }
  .pod-progress-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .pod-progress-label { font-size: 0.82rem; font-weight: 600; color: #475569; }
  .pod-progress-count { font-size: 0.82rem; font-weight: 700; color: #4f46e5; }
  .pod-progress-track {
    height: 8px;
    background: #e2e8f0;
    border-radius: 99px;
    overflow: hidden;
  }
  .pod-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    border-radius: 99px;
    transition: width 0.4s cubic-bezier(.4,0,.2,1);
  }

  /* ── Checklist rows ── */
  .pod-check-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 18px;
    border-radius: 12px;
    border: 1.5px solid #e2e8f0;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.18s ease;
    background: #fafafa;
    user-select: none;
  }
  .pod-check-row:hover { border-color: #a5b4fc; background: #fafafe; }
  .pod-check-row.checked { border-color: #16a34a; background: #f0fdf4; }
  .pod-check-box {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    border: 2px solid #cbd5e1;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.18s ease;
    color: transparent;
  }
  .pod-check-row.checked .pod-check-box {
    background: #16a34a;
    border-color: #16a34a;
    color: white;
  }
  .pod-check-text { font-size: 0.92rem; font-weight: 600; color: #334155; flex: 1; }
  .pod-check-row.checked .pod-check-text { color: #16a34a; }

  /* ── Mock Poll Section ── */
  .pod-mock-section {
    margin-top: 20px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .pod-spinner-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: #eff6ff;
    border-radius: 10px;
    color: #4f46e5;
    font-weight: 600;
    font-size: 0.88rem;
  }
  .pod-spinner {
    width: 22px;
    height: 22px;
    border: 3px solid #c7d2fe;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .pod-success-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: #f0fdf4;
    border-radius: 10px;
    color: #16a34a;
    font-weight: 600;
    font-size: 0.9rem;
    border: 1px solid #bbf7d0;
  }
  .pod-success-icon {
    width: 32px;
    height: 32px;
    background: #16a34a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  /* ── Buttons ── */
  .pod-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 22px;
    border-radius: 10px;
    border: none;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
    white-space: nowrap;
  }
  .pod-btn-primary {
    background: linear-gradient(135deg, #4f46e5, #6d28d9);
    color: white;
    box-shadow: 0 4px 12px rgba(79,70,229,0.35);
  }
  .pod-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(79,70,229,0.45);
  }
  .pod-btn-primary:disabled {
    background: #94a3b8;
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
  .pod-btn-danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 4px 12px rgba(239,68,68,0.3);
  }
  .pod-btn-danger:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(239,68,68,0.4); }
  .pod-btn-danger-outline {
    background: transparent;
    border: 2px solid #ef4444;
    color: #ef4444;
  }
  .pod-btn-danger-outline:hover { background: #fef2f2; }
  .pod-btn-amber {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    box-shadow: 0 4px 12px rgba(245,158,11,0.3);
  }
  .pod-btn-amber:hover { transform: translateY(-1px); }
  .pod-btn-ghost {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
  .pod-btn-ghost:hover { background: #e2e8f0; }
  .pod-btn-success {
    background: linear-gradient(135deg, #16a34a, #15803d);
    color: white;
    box-shadow: 0 4px 12px rgba(22,163,74,0.3);
  }
  .pod-btn-success:hover { transform: translateY(-1px); }
  .pod-btn-full { width: 100%; }
  .pod-btn-sm { padding: 8px 14px; font-size: 0.8rem; }

  /* ── Stat Cards ── */
  .pod-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 4px;
  }
  .pod-stat-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
  }
  .pod-stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
  }
  .pod-stat-card.blue::before { background: linear-gradient(90deg, #4f46e5, #7c3aed); }
  .pod-stat-card.red::before { background: linear-gradient(90deg, #ef4444, #dc2626); }
  .pod-stat-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }
  .pod-stat-icon.blue { background: #eef2ff; color: #4f46e5; }
  .pod-stat-icon.red { background: #fef2f2; color: #ef4444; }
  .pod-stat-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .pod-stat-value {
    font-size: 2.8rem;
    font-weight: 900;
    letter-spacing: -2px;
    line-height: 1;
    margin-bottom: 8px;
  }
  .pod-stat-value.blue { color: #4f46e5; }
  .pod-stat-value.red { color: #ef4444; }
  .pod-stat-sub { font-size: 0.8rem; color: #64748b; font-weight: 500; }

  /* ── Vote flash badge ── */
  .pod-vote-flash {
    position: fixed;
    top: 80px;
    right: 32px;
    background: #16a34a;
    color: white;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 10px 18px;
    border-radius: 24px;
    box-shadow: 0 8px 24px rgba(22,163,74,0.4);
    animation: flashIn 0.3s ease, flashOut 0.3s ease 1.5s forwards;
    z-index: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  @keyframes flashIn { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
  @keyframes flashOut { to { opacity:0; transform:translateX(24px); } }

  /* ── Wizard ── */
  .pod-wizard-wrap {
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding: 20px;
  }
  .pod-wizard-step-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #ef4444;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .pod-wizard-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.88rem;
    font-weight: 500;
    color: #334155;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: all 0.15s ease;
    margin-bottom: 8px;
  }
  .pod-wizard-option:hover { border-color: #4f46e5; color: #4f46e5; background: #fafafe; }
  .pod-wizard-confirm-text {
    font-size: 0.85rem;
    color: #475569;
    background: #fff7ed;
    border: 1px solid #fed7aa;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 14px;
    line-height: 1.6;
  }
  .pod-btn-row { display: flex; gap: 10px; margin-top: 4px; }

  /* ── Incident buttons ── */
  .pod-incident-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* ── Timeline ── */
  .pod-timeline {
    padding-left: 28px;
    border-left: 2px solid #e2e8f0;
    margin-bottom: 20px;
    max-height: 340px;
    overflow-y: auto;
  }
  .pod-timeline::-webkit-scrollbar { width: 4px; }
  .pod-timeline::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
  .pod-tl-item {
    position: relative;
    padding-bottom: 20px;
  }
  .pod-tl-item:last-child { padding-bottom: 0; }
  .pod-tl-dot {
    position: absolute;
    left: -35px;
    top: 3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #94a3b8;
    border: 2.5px solid white;
    box-shadow: 0 0 0 2px #e2e8f0;
  }
  .pod-tl-dot.action { background: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }
  .pod-tl-dot.success { background: #16a34a; box-shadow: 0 0 0 2px #bbf7d0; }
  .pod-tl-dot.alert { background: #ef4444; box-shadow: 0 0 0 2px #fecaca; }
  .pod-tl-dot.manual { background: #f59e0b; box-shadow: 0 0 0 2px #fde68a; }
  .pod-tl-dot.info { background: #64748b; box-shadow: 0 0 0 2px #e2e8f0; }
  .pod-tl-time { font-size: 0.75rem; font-weight: 700; color: #94a3b8; margin-bottom: 4px; }
  .pod-tl-text { font-size: 0.9rem; color: #334155; line-height: 1.5; }

  .pod-diary-input-row {
    display: flex;
    gap: 10px;
    padding-top: 18px;
    border-top: 1px solid #e2e8f0;
  }
  .pod-diary-input {
    flex: 1;
    padding: 11px 16px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.88rem;
    color: #1e293b;
    outline: none;
    transition: border-color 0.18s;
  }
  .pod-diary-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
  .pod-diary-input::placeholder { color: #94a3b8; }

  /* ── Close & Seal ── */
  .pod-seal-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    background: #fafafa;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.15s;
    user-select: none;
  }
  .pod-seal-item:hover { border-color: #a5b4fc; }
  .pod-seal-item.checked { border-color: #16a34a; background: #f0fdf4; }
  .pod-seal-cb {
    width: 22px; height: 22px;
    border-radius: 6px;
    border: 2px solid #cbd5e1;
    background: white;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s;
    color: transparent;
  }
  .pod-seal-item.checked .pod-seal-cb { background: #16a34a; border-color: #16a34a; color: white; }
  .pod-seal-label { font-size: 0.88rem; font-weight: 500; color: #334155; }
  .pod-seal-item.checked .pod-seal-label { color: #16a34a; }

  .pod-form17-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    margin-bottom: 20px;
  }
  .pod-form17-label { font-size: 0.82rem; color: #64748b; font-weight: 500; }
  .pod-form17-value { font-size: 2rem; font-weight: 900; color: #0f172a; letter-spacing: -1px; }

  /* ── Toast ── */
  .pod-toast {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: white;
    padding: 14px 28px;
    border-radius: 32px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.25);
    font-size: 0.88rem;
    font-weight: 600;
    z-index: 9999;
    animation: toastIn 0.3s cubic-bezier(.4,0,.2,1);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: 0.1px;
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .pod-toast-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #4f46e5;
    flex-shrink: 0;
  }
`;

/* ─────────────── Main Component ─────────────── */
export default function PresidingOfficerDashboard({ user, onLogout }) {
  // ── Core state ──
  const [activeTab, setActiveTab] = useState('pre_poll');
  const [offlineMode, setOfflineMode] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [notification, setNotification] = useState(null);

  // ── Pre-poll ──
  const [checklist, setChecklist] = useState({ evm: false, vvpat: false, ink: false, agents: false });
  const [mockPollStep, setMockPollStep] = useState(0); // 0-3

  // ── Active polling ──
  const [turnout, setTurnout] = useState(142);
  const [queue, setQueue] = useState({ voters: 45, wait: 15 });
  const [showVoteBadge, setShowVoteBadge] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardSelection, setWizardSelection] = useState('');

  // ── PO Diary ──
  const [diaryEntries, setDiaryEntries] = useState([
    { id: 1, time: '06:00 AM', text: 'Reached Booth 42, Setup started.', type: 'info' }
  ]);
  const [diaryNote, setDiaryNote] = useState('');
  const timelineRef = useRef(null);

  // ── Close & Seal ──
  const [sealChecks, setSealChecks] = useState({ close: false, power: false, seal: false, case: false });

  /* ── Queue drift every 5s ── */
  useEffect(() => {
    const id = setInterval(() => {
      setQueue(q => ({
        voters: Math.max(0, q.voters + Math.floor(Math.random() * 5) - 2),
        wait:   Math.max(0, q.wait   + Math.floor(Math.random() * 3) - 1),
      }));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  /* ── Auto-scroll diary ── */
  useEffect(() => {
    if (timelineRef.current) timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
  }, [diaryEntries]);

  /* ── Helpers ── */
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3200);
  };

  const addDiary = (text, type = 'info') => {
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDiaryEntries(prev => [...prev, { id: Date.now(), time: t, text, type }]);
    if (offlineMode) setPendingSync(p => p + 1);
  };

  const toggleOffline = () => {
    if (!offlineMode) {
      setOfflineMode(true);
      showToast('Switched to Offline Mode');
    } else {
      setOfflineMode(false);
      if (pendingSync > 0) {
        showToast(`Synced ${pendingSync} pending item${pendingSync > 1 ? 's' : ''}`);
        setPendingSync(0);
      } else {
        showToast('Back online');
      }
    }
  };

  /* ── Checklist ── */
  const checkCount = Object.values(checklist).filter(Boolean).length;
  const allChecked = checkCount === 4;
  const toggleCheck = (key) => setChecklist(c => ({ ...c, [key]: !c[key] }));

  /* ── Mock Poll ── */
  const runMockPoll = () => {
    if (!allChecked) return;
    setMockPollStep(1);
    addDiary('Mock Poll started — registering 50 test votes', 'action');
    setTimeout(() => {
      setMockPollStep(2);
      addDiary('50 test votes completed — verifying VVPAT slips', 'action');
      setTimeout(() => {
        setMockPollStep(3);
        addDiary('Mock Poll certificate generated', 'success');
      }, 2200);
    }, 2200);
  };

  /* ── Register Vote ── */
  const registerVote = () => {
    setTurnout(t => {
      addDiary(`Vote registered — total ${t + 1}`, 'action');
      return t + 1;
    });
    setQueue(q => ({ ...q, voters: Math.max(0, q.voters - 1) }));
    setShowVoteBadge(true);
    setTimeout(() => setShowVoteBadge(false), 2000);
  };

  /* ── Wizard ── */
  const pickWizardIssue = (issue) => { setWizardSelection(issue); setWizardStep(2); };
  const confirmWizard = () => {
    addDiary(`EVM Issue reported: ${wizardSelection}`, 'alert');
    showToast('Sector Officer notified');
    setWizardStep(0);
    setWizardSelection('');
  };

  /* ── Quick incident ── */
  const quickIncident = (type) => {
    addDiary(`Incident: ${type}`, 'alert');
    showToast(`${type} reported to Sector Officer`);
  };

  /* ── Diary add ── */
  const addNote = () => {
    if (!diaryNote.trim()) return;
    addDiary(diaryNote.trim(), 'manual');
    setDiaryNote('');
  };

  /* ── Seal toggle ── */
  const toggleSeal = (key) => setSealChecks(c => ({ ...c, [key]: !c[key] }));

  /* ────────────────────────────────────────────── */
  /*  TAB RENDERERS                                 */
  /* ────────────────────────────────────────────── */

  const renderPrePoll = () => (
    <>
      <h2 className="pod-page-title">Pre-Poll Setup</h2>
      <p className="pod-page-sub">Complete checklist before polling begins at 07:00 AM</p>

      <div className="pod-card">
        <div className="pod-card-title">Setup Checklist</div>
        <div className="pod-card-sub">Tap each item to mark as verified</div>

        <div className="pod-progress-wrap">
          <div className="pod-progress-row">
            <span className="pod-progress-label">Overall Progress</span>
            <span className="pod-progress-count">{checkCount} / 4 complete</span>
          </div>
          <div className="pod-progress-track">
            <div className="pod-progress-fill" style={{ width: `${(checkCount / 4) * 100}%` }} />
          </div>
        </div>

        {[
          { key: 'evm',    label: 'EVM Control Unit Connected & Sealed' },
          { key: 'vvpat',  label: 'VVPAT Loaded with Fresh Paper Roll' },
          { key: 'ink',    label: 'Indelible Ink Available & Verified' },
          { key: 'agents', label: 'Polling Agents Present & Registered' },
        ].map(({ key, label }) => (
          <div
            key={key}
            className={`pod-check-row${checklist[key] ? ' checked' : ''}`}
            onClick={() => toggleCheck(key)}
          >
            <div className="pod-check-box">
              {checklist[key] && <IC.Check />}
            </div>
            <span className="pod-check-text">{label}</span>
          </div>
        ))}
      </div>

      <div className="pod-card">
        <div className="pod-card-title">Mock Poll Workflow</div>
        <div className="pod-card-sub">
          Conduct 50 test votes in presence of polling agents before clearing EVM for actual polling.
        </div>
        <div className="pod-mock-section">
          {mockPollStep === 0 && (
            <button
              className="pod-btn pod-btn-primary pod-btn-full"
              disabled={!allChecked}
              onClick={runMockPoll}
              style={{ padding: '14px 22px', fontSize: '0.92rem' }}
            >
              {allChecked ? '\u25B6\u2002Start Mock Poll \u2014 50 Votes' : `Complete checklist first (${checkCount}/4 done)`}
            </button>
          )}
          {mockPollStep === 1 && (
            <div className="pod-spinner-row">
              <div className="pod-spinner" />
              <span>Registering 50 test votes on EVM\u2026</span>
            </div>
          )}
          {mockPollStep === 2 && (
            <div className="pod-spinner-row">
              <div className="pod-spinner" />
              <span>Verifying VVPAT slips against count\u2026</span>
            </div>
          )}
          {mockPollStep === 3 && (
            <div className="pod-success-row">
              <div className="pod-success-icon"><IC.Check /></div>
              <div>
                <div style={{ fontWeight: 700 }}>Mock Poll Complete!</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.85, marginTop: 2 }}>
                  Certificate generated. EVM cleared for actual polling.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderActivePolling = () => (
    <>
      <h2 className="pod-page-title">Active Polling</h2>
      <p className="pod-page-sub">Live booth status \u2022 Queue updates every 5 seconds</p>

      <div className="pod-stats-grid">
        <div className="pod-stat-card blue">
          <div className="pod-stat-icon blue"><IC.Users /></div>
          <div className="pod-stat-label">Total Turnout</div>
          <div className="pod-stat-value blue">{fmt(turnout)}</div>
          <div className="pod-stat-sub">votes recorded</div>
          <div style={{ marginTop: 16 }}>
            <button
              className="pod-btn pod-btn-primary pod-btn-sm pod-btn-full"
              onClick={registerVote}
            >
              <IC.Plus /> Register Vote
            </button>
          </div>
        </div>
        <div className="pod-stat-card red">
          <div className="pod-stat-icon red"><IC.Clock /></div>
          <div className="pod-stat-label">Current Queue</div>
          <div className="pod-stat-value red">{queue.voters}</div>
          <div className="pod-stat-sub">~{queue.wait} min wait</div>
        </div>
      </div>

      <div className="pod-card">
        <div className="pod-card-title" style={{ marginBottom: 16 }}>EVM Fault Wizard</div>

        {wizardStep === 0 && (
          <button
            className="pod-btn pod-btn-danger-outline pod-btn-full"
            onClick={() => setWizardStep(1)}
            style={{ padding: '14px 22px' }}
          >
            <IC.AlertTriangle /> Report EVM / VVPAT Hardware Issue
          </button>
        )}

        {wizardStep === 1 && (
          <div className="pod-wizard-wrap">
            <div className="pod-wizard-step-label">Step 1 \u2014 Identify Failing Component</div>
            {[
              'Control Unit Display Error',
              'VVPAT Paper Jam',
              'Ballot Unit Button Non-Responsive',
              'EVM Battery Critically Low',
            ].map(issue => (
              <button key={issue} className="pod-wizard-option" onClick={() => pickWizardIssue(issue)}>
                {issue}
                <IC.ChevronRight />
              </button>
            ))}
            <div className="pod-btn-row">
              <button className="pod-btn pod-btn-ghost pod-btn-full" onClick={() => setWizardStep(0)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="pod-wizard-wrap">
            <div className="pod-wizard-step-label">Step 2 \u2014 Confirm Issue</div>
            <div className="pod-wizard-confirm-text">
              <strong>Selected Issue:</strong> {wizardSelection}<br /><br />
              Polling will be <strong>halted immediately</strong>. Sector Officer and Reserve Engineers
              will be notified. A diary entry will be auto-logged.
            </div>
            <div className="pod-btn-row">
              <button className="pod-btn pod-btn-ghost" onClick={() => setWizardStep(1)}>\u2190 Back</button>
              <button className="pod-btn pod-btn-danger pod-btn-full" onClick={confirmWizard}>
                Confirm & Alert HQ
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pod-card">
        <div className="pod-card-title" style={{ marginBottom: 6 }}>Quick Incident Report</div>
        <div className="pod-card-sub">One-tap escalation to Sector Officer</div>
        <div className="pod-incident-grid">
          <button
            className="pod-btn pod-btn-danger"
            onClick={() => quickIncident('Violence / Disturbance')}
            style={{ padding: '14px 22px' }}
          >
            Violence / Disturbance
          </button>
          <button
            className="pod-btn pod-btn-amber"
            onClick={() => quickIncident('Bogus Voting Attempt')}
            style={{ padding: '14px 22px' }}
          >
            Bogus Voting
          </button>
        </div>
      </div>
    </>
  );

  const renderPODiary = () => (
    <>
      <h2 className="pod-page-title">PO Diary</h2>
      <p className="pod-page-sub">Auto-logging all booth events in real time</p>

      <div className="pod-card">
        <div className="pod-card-title" style={{ marginBottom: 4 }}>Event Timeline</div>
        <div className="pod-card-sub">{diaryEntries.length} entries logged</div>

        <div className="pod-timeline" ref={timelineRef}>
          {diaryEntries.map(entry => (
            <div key={entry.id} className="pod-tl-item">
              <div className={`pod-tl-dot ${entry.type}`} />
              <div className="pod-tl-time">{entry.time}</div>
              <div className="pod-tl-text">{entry.text}</div>
            </div>
          ))}
        </div>

        <div className="pod-diary-input-row">
          <input
            className="pod-diary-input"
            placeholder="Add observation note\u2026"
            value={diaryNote}
            onChange={e => setDiaryNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNote()}
          />
          <button className="pod-btn pod-btn-primary" onClick={addNote}>
            <IC.Plus /> Add Note
          </button>
        </div>
      </div>
    </>
  );

  const renderCloseSeal = () => (
    <>
      <h2 className="pod-page-title">Close &amp; Seal</h2>
      <p className="pod-page-sub">End-of-day procedures \u2014 complete all steps in order</p>

      <div className="pod-card">
        <div className="pod-card-title">Form 17C Generation</div>
        <div className="pod-card-sub">Digital account of votes polled</div>
        <div className="pod-form17-row">
          <div>
            <div className="pod-form17-label">Final Vote Count (EVM)</div>
            <div className="pod-form17-value">{turnout}</div>
          </div>
          <IC.FileText />
        </div>
        <button
          className="pod-btn pod-btn-primary pod-btn-full"
          style={{ padding: '14px 22px', fontSize: '0.92rem' }}
          onClick={() => {
            addDiary(`Digital Form 17C generated \u2014 ${turnout} votes`, 'success');
            showToast('Form 17C saved. Pending agent signatures.');
          }}
        >
          <IC.FileText /> Generate Digital Form 17C
        </button>
      </div>

      <div className="pod-card">
        <div className="pod-card-title">EVM Sealing Protocol</div>
        <div className="pod-card-sub">Complete each step before packing</div>

        {[
          { key: 'close', label: 'CLOSE button pressed on Control Unit' },
          { key: 'power', label: 'Power switched OFF on Control Unit' },
          { key: 'seal',  label: 'Pink Paper Seal applied to VVPAT drop box' },
          { key: 'case',  label: 'EVMs secured in official carrying cases' },
        ].map(({ key, label }) => (
          <div
            key={key}
            className={`pod-seal-item${sealChecks[key] ? ' checked' : ''}`}
            onClick={() => toggleSeal(key)}
          >
            <div className="pod-seal-cb">
              {sealChecks[key] && <IC.Check />}
            </div>
            <span className="pod-seal-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="pod-card">
        <div className="pod-card-title" style={{ marginBottom: 6 }}>Complete Handover</div>
        <div className="pod-card-sub">Formally transfer EVM &amp; documents to Sector Officer</div>
        <button
          className="pod-btn pod-btn-success pod-btn-full"
          style={{ padding: '16px 22px', fontSize: '1rem' }}
          onClick={() => {
            addDiary('Final Handover completed to Sector Officer', 'success');
            showToast('Handover recorded. Safe travel to reception center.');
          }}
        >
          Complete Handover to Sector Officer \u2192
        </button>
      </div>
    </>
  );

  /* ── NAV CONFIG ── */
  const navItems = [
    { id: 'pre_poll',       label: 'Pre-Poll',       Icon: IC.PrePoll  },
    { id: 'active_polling', label: 'Active Polling',  Icon: IC.BarChart },
    { id: 'po_diary',       label: 'PO Diary',        Icon: IC.Book     },
    { id: 'close_seal',     label: 'Close & Seal',    Icon: IC.Lock     },
  ];

  /* ────────────── RENDER ────────────── */
  return (
    <div className="pod-root">
      <style>{CSS}</style>

      {/* ── SIDEBAR ── */}
      <aside className="pod-sidebar">
        <div className="pod-sidebar-logo">
          <div className="pod-logo-icon"><IC.Shield /></div>
          <div className="pod-logo-text">
            <h1>NagarVaani</h1>
            <span>Booth Console</span>
          </div>
        </div>

        <nav className="pod-nav">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`pod-nav-item${activeTab === id ? ' active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>

        <div className="pod-sidebar-bottom">
          <button className="pod-logout-btn" onClick={onLogout}>
            <IC.Logout />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="pod-main">
        <header className="pod-header">
          <div className="pod-header-left">
            <div>
              <div className="pod-header-booth">Booth #42</div>
              <div className="pod-header-sub">{user?.name || 'Presiding Officer'}</div>
            </div>
            <div className="pod-header-divider" />
            <span className="pod-role-badge">Presiding Officer</span>
          </div>

          <div className="pod-header-right">
            {offlineMode && pendingSync > 0 && (
              <span className="pod-sync-badge">{pendingSync} pending</span>
            )}
            <button
              className={`pod-offline-toggle ${offlineMode ? 'offline' : 'online'}`}
              onClick={toggleOffline}
            >
              {offlineMode ? <IC.WifiOff /> : <IC.WifiOn />}
              {offlineMode ? 'Offline Mode' : 'Online'}
            </button>
          </div>
        </header>

        <div className="pod-scroll">
          {offlineMode && (
            <div className="pod-offline-banner">
              <IC.AlertTriangle />
              <span>
                <strong>Offline Mode Active</strong> \u2014 Data Stored Locally. Will sync when network restored.
              </span>
            </div>
          )}

          {activeTab === 'pre_poll'       && renderPrePoll()}
          {activeTab === 'active_polling' && renderActivePolling()}
          {activeTab === 'po_diary'       && renderPODiary()}
          {activeTab === 'close_seal'     && renderCloseSeal()}
        </div>
      </main>

      {/* ── Vote Flash Badge ── */}
      {showVoteBadge && (
        <div className="pod-vote-flash">
          <IC.Check /> +1 Vote Processed
        </div>
      )}

      {/* ── Toast ── */}
      {notification && (
        <div className="pod-toast">
          <div className="pod-toast-dot" />
          {notification}
        </div>
      )}
    </div>
  );
}
