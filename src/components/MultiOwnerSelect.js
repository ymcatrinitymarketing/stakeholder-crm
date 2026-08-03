'use client';

import React from 'react';

const TEAM_MEMBERS = ['Jonathan', 'Amanda', 'Ian', 'Ryan'];

export default function MultiOwnerSelect({ selectedOwners, onChange }) {
  // selectedOwners is expected to be a comma-separated string, e.g., "Jonathan, Ryan"
  const selectedArray = selectedOwners ? selectedOwners.split(',').map(s => s.trim()).filter(Boolean) : [];

  const toggleOwner = (owner) => {
    let newSelected;
    if (selectedArray.includes(owner)) {
      newSelected = selectedArray.filter(o => o !== owner);
    } else {
      newSelected = [...selectedArray, owner];
    }
    onChange(newSelected.join(', '));
  };

  const toggleAll = () => {
    if (selectedArray.length === TEAM_MEMBERS.length) {
      onChange(''); // Deselect all
    } else {
      onChange(TEAM_MEMBERS.join(', ')); // Select all
    }
  };

  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
      <button 
        type="button"
        onClick={toggleAll}
        style={{
          background: selectedArray.length === TEAM_MEMBERS.length ? 'var(--tier-1)' : 'rgba(255,255,255,0.05)',
          color: selectedArray.length === TEAM_MEMBERS.length ? 'white' : 'var(--text-secondary)',
          border: `1px solid ${selectedArray.length === TEAM_MEMBERS.length ? 'var(--tier-1)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '20px',
          padding: '0.25rem 0.75rem',
          fontSize: '0.8rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontWeight: 600
        }}
      >
        All
      </button>
      
      {TEAM_MEMBERS.map(member => {
        const isSelected = selectedArray.includes(member);
        return (
          <button
            key={member}
            type="button"
            onClick={() => toggleOwner(member)}
            style={{
              background: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
              color: isSelected ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '20px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {member}
          </button>
        );
      })}
    </div>
  );
}
