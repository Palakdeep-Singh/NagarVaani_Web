import React, { useState, useEffect } from 'react';

export default function OfficerSwitcher({ currentUser, onSwitchUser }) {
  const [officers, setOfficers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5001/api/hierarchy/officers')
      .then(res => res.json())
      .then(data => setOfficers(data))
      .catch(err => console.error('Failed to fetch officers hierarchy', err));
  }, []);

  if (!currentUser) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 9999,
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}
        >
          <span>👤 {currentUser.name || currentUser.role}</span>
          <span style={{ fontSize: '0.8em' }}>▼</span>
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            maxHeight: '400px',
            overflowY: 'auto',
            width: '300px'
          }}>
            <div style={{ padding: '8px', background: '#f5f5f5', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>
              Switch Officer
            </div>
            {officers.map(officer => (
              <div
                key={officer.id}
                onClick={() => {
                  onSwitchUser(officer);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: currentUser?.id === officer.id ? '#e6f2ff' : 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => {
                  if (currentUser?.id !== officer.id) e.currentTarget.style.backgroundColor = '#f9f9f9';
                }}
                onMouseOut={(e) => {
                  if (currentUser?.id !== officer.id) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{officer.role}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{officer.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
