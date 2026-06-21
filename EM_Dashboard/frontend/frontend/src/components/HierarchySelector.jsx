import React, { useState, useEffect } from 'react';

const ROLES_HIERARCHY = [
  'ECI',
  'CEO',
  'DEO',
  'Returning Officer',
  'Sector Officer',
  'Presiding Officer',
  'Polling Officer'
];

export default function HierarchySelector({ targetRole, onSelectOfficer, onGoBack }) {
  const [officers, setOfficers] = useState([]);
  const [selections, setSelections] = useState({}); // { 'ECI': 'USR-1', 'CEO': 'USR-2', ... }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5001/api/hierarchy/officers')
      .then(res => res.json())
      .then(data => {
        setOfficers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch hierarchy', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '20vh' }}>Loading...</div>;

  const targetIndex = ROLES_HIERARCHY.indexOf(targetRole);

  const handleSelection = (role, officerId) => {
    // Clear subsequent selections
    const roleIndex = ROLES_HIERARCHY.indexOf(role);
    const newSelections = { ...selections, [role]: officerId };
    
    for (let i = roleIndex + 1; i < ROLES_HIERARCHY.length; i++) {
      delete newSelections[ROLES_HIERARCHY[i]];
    }
    setSelections(newSelections);
  };

  const renderRoleSelection = (roleIndex) => {
    const role = ROLES_HIERARCHY[roleIndex];
    if (roleIndex > 0) {
      const parentRole = ROLES_HIERARCHY[roleIndex - 1];
      if (!selections[parentRole]) return null; // Parent not selected yet
    }

    const parentId = roleIndex === 0 ? null : selections[ROLES_HIERARCHY[roleIndex - 1]];
    const availableOfficers = officers.filter(o => o.role === role && o.parentId === parentId);

    if (availableOfficers.length === 0) return null;

    return (
      <div key={role} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.2rem' }}>Select {role}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {availableOfficers.map(officer => (
            <label key={officer.id} style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name={role} 
                value={officer.id}
                checked={selections[role] === officer.id}
                onChange={() => handleSelection(role, officer.id)}
              />
              {officer.name}
            </label>
          ))}
        </div>
      </div>
    );
  };

  const isTargetSelected = selections[targetRole] !== undefined;

  const handleSubmit = () => {
    if (isTargetSelected) {
      const selectedOfficer = officers.find(o => o.id === selections[targetRole]);
      if (selectedOfficer) {
        onSelectOfficer(selectedOfficer);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <button 
        onClick={onGoBack}
        style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '2rem' }}
      >
        ← Back to Main Menu
      </button>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '2rem' }}>Hierarchy Selection: {targetRole}</h2>
        
        {ROLES_HIERARCHY.slice(0, targetIndex + 1).map((_, index) => renderRoleSelection(index))}

        <button 
          onClick={handleSubmit}
          disabled={!isTargetSelected}
          style={{
            width: '100%',
            padding: '1rem',
            marginTop: '1rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: 'white',
            background: isTargetSelected ? '#4CAF50' : '#888',
            border: 'none',
            borderRadius: '8px',
            cursor: isTargetSelected ? 'pointer' : 'not-allowed',
            transition: 'background 0.3s'
          }}
        >
          Proceed to Dashboard
        </button>
      </div>
    </div>
  );
}
