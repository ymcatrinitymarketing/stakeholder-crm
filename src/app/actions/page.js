'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

export default function ActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAction, setShowAddAction] = useState(false);
  const [newAction, setNewAction] = useState({
    date_created: new Date().toISOString().split('T')[0],
    action_description: '',
    owner: 'Jonathan'
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/actions');
      const data = await res.json();
      setActions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleActionChange = (e) => {
    const { name, value } = e.target;
    setNewAction(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAction = async () => {
    if (!newAction.date_created || !newAction.action_description) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAction)
      });
      if (res.ok) {
        setShowAddAction(false);
        fetchActions();
        setNewAction({
          date_created: new Date().toISOString().split('T')[0],
          action_description: '',
          owner: 'Jonathan'
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAction = async (actionId, updates) => {
    try {
      const res = await fetch(`/api/actions/${actionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchActions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="animate-fade-in" style={{textAlign: 'center', marginTop: '4rem'}}>Loading actions...</div>;
  }

  return (
    <div className="animate-fade-in stagger-1">
      <div className="glass-panel" style={{padding: '2rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>General Actions</h2>
          {!showAddAction && (
            <button 
              className="btn btn-outline" 
              onClick={() => setShowAddAction(true)}
            >
              <Plus size={18} style={{marginRight: '6px'}}/> Add General Action
            </button>
          )}
        </div>

        {showAddAction && (
          <div className="animate-fade-in" style={{background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', borderLeft: '4px solid var(--tier-1)'}}>
            <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>New General Action</h3>
            <div style={{display: 'flex', gap: '1.5rem', marginBottom: '1rem'}}>
              <div style={{flex: 1}}>
                <label className="form-label">Date</label>
                <input type="date" className="form-control" name="date_created" value={newAction.date_created} onChange={handleActionChange} style={{width: '100%'}} />
              </div>
              <div style={{flex: 1}}>
                <label className="form-label">Assign To</label>
                <select className="form-control" name="owner" value={newAction.owner} onChange={handleActionChange} style={{width: '100%'}}>
                  <option value="Jonathan">Jonathan</option>
                  <option value="Amanda">Amanda</option>
                  <option value="Ian">Ian</option>
                  <option value="Ryan">Ryan</option>
                </select>
              </div>
            </div>
            <div style={{marginBottom: '1.5rem'}}>
              <label className="form-label">Action Required</label>
              <textarea className="form-control" name="action_description" value={newAction.action_description} onChange={handleActionChange} rows="3" placeholder="Describe the action..." style={{width: '100%'}} />
            </div>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button className="btn btn-outline" onClick={() => setShowAddAction(false)}>Cancel</button>
              <button className="btn" style={{background: 'var(--tier-1)'}} onClick={handleSaveAction} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Add Action & Send Email'}
              </button>
            </div>
          </div>
        )}

        {actions.length === 0 ? (
          <div style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px'}}>
            No general actions found.
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem'}}>
            {actions.map(act => (
              <div key={act.id} className="glass-panel" style={{
                padding: '1.5rem', 
                borderLeft: `4px solid ${act.date_completed ? 'var(--tier-2)' : 'var(--tier-1)'}`, 
                opacity: act.date_completed ? 0.7 : 1,
                display: 'flex', flexDirection: 'column'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                  <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                    {new Date(act.date_created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)'}}>
                    Assigned to: <strong style={{color: 'var(--text-primary)'}}>{act.owner}</strong>
                  </span>
                </div>
                
                <div style={{fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', flex: 1}}>
                  {act.action_description}
                </div>

                {!act.date_completed ? (
                  <div style={{background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px'}}>
                    <div style={{fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500}}>Mark as Completed</div>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Outcome details..." 
                      style={{marginBottom: '0.5rem', width: '100%'}}
                      onBlur={(e) => {
                        if (e.target.value) {
                          handleUpdateAction(act.id, { outcome: e.target.value, date_completed: new Date().toISOString() });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          handleUpdateAction(act.id, { outcome: e.target.value, date_completed: new Date().toISOString() });
                        }
                      }}
                    />
                    <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Press Enter or click away to save completion.</div>
                  </div>
                ) : (
                  <div style={{fontSize: '0.95rem', color: 'var(--tier-2)', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '8px'}}>
                    <span><strong style={{color: 'var(--text-primary)'}}>Outcome:</strong> {act.outcome}</span>
                    <span><strong style={{color: 'var(--text-primary)'}}>Completed:</strong> {new Date(act.date_completed).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
