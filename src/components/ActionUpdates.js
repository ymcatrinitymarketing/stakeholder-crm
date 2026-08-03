'use client';

import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

export default function ActionUpdates({ actionId }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [newText, setNewText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (showUpdates) {
      fetchUpdates();
    }
  }, [showUpdates]);

  async function fetchUpdates() {
    setLoading(true);
    try {
      const res = await fetch(`/api/actions/${actionId}/updates`);
      const data = await res.json();
      setUpdates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/actions/${actionId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ update_text: newText })
      });
      if (res.ok) {
        setNewText('');
        fetchUpdates();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem', width: '100%', flex: '1 1 100%' }}>
      <button 
        onClick={() => setShowUpdates(!showUpdates)}
        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}
      >
        <MessageSquare size={16} /> {showUpdates ? 'Hide Updates' : 'Show Updates / Log Progress'}
      </button>

      {showUpdates && (
        <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px' }}>
          {loading ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading updates...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {updates.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No updates logged yet.</div>
              ) : (
                updates.map(u => (
                  <div key={u.id} style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {new Date(u.date_created).toLocaleString('en-GB')}
                    </div>
                    <div>{u.update_text}</div>
                  </div>
                ))
              )}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Add a progress update..." 
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddUpdate(); }}
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
            />
            <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'var(--accent)', color: 'white', border: 'none' }} onClick={handleAddUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
