'use client';

import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

export default function DeliveryTaskUpdates({ taskId }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newText, setNewText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchUpdates();
    }
  }, [taskId]);

  async function fetchUpdates() {
    setLoading(true);
    try {
      const res = await fetch(`/api/delivery-plan/${taskId}/updates`);
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
      const res = await fetch(`/api/delivery-plan/${taskId}/updates`, {
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
    <div style={{ marginTop: '2rem', width: '100%', gridColumn: '1 / -1' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
        <MessageSquare size={18} color="var(--accent)" /> Task Updates & Log
      </h3>

      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px' }}>
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
                    {new Date(u.date_added).toLocaleString('en-GB')}
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
            placeholder="Log a new update..." 
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
    </div>
  );
}
