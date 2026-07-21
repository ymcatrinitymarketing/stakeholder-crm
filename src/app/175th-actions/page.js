'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Filter } from 'lucide-react';
import ActionUpdates from '@/components/ActionUpdates';

export default function ActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAction, setShowAddAction] = useState(false);
  const [filterOwner, setFilterOwner] = useState('All');
  const [newAction, setNewAction] = useState({
    date_created: new Date().toISOString().split('T')[0],
    due_date: '',
    action_description: '',
    owner: 'Jonathan'
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/actions?type=175th');
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
        body: JSON.stringify({ ...newAction, action_type: '175th' })
      });
      if (res.ok) {
        setShowAddAction(false);
        fetchActions();
        setNewAction({
          date_created: new Date().toISOString().split('T')[0],
          due_date: '',
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

  const handleDeleteAction = async (actionId) => {
    if (!confirm('Are you sure you want to delete this action?')) return;
    try {
      const res = await fetch(`/api/actions/${actionId}`, {
        method: 'DELETE'
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

  const displayedActions = actions.filter(act => filterOwner === 'All' || act.owner === filterOwner);

  return (
    <div className="animate-fade-in stagger-1">
      <div className="glass-panel" style={{padding: '2rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>175th Anniversary Actions</h2>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px'}}>
              <Filter size={16} color="var(--text-secondary)" />
              <select 
                className="form-control" 
                style={{background: 'transparent', border: 'none', padding: 0, color: 'var(--text-primary)', width: 'auto'}}
                value={filterOwner}
                onChange={(e) => setFilterOwner(e.target.value)}
              >
                <option value="All">All Owners</option>
                <option value="Jonathan">Jonathan</option>
                <option value="Amanda">Amanda</option>
                <option value="Ian">Ian</option>
                <option value="Ryan">Ryan</option>
              </select>
            </div>
            {!showAddAction && (
              <button 
                className="btn btn-outline" 
                onClick={() => setShowAddAction(true)}
              >
                <Plus size={18} style={{marginRight: '6px'}}/> Add 175th Action
              </button>
            )}
          </div>
        </div>

        {showAddAction && (
          <div className="animate-fade-in" style={{background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', borderLeft: '4px solid var(--tier-1)'}}>
            <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>New 175th Anniversary Action</h3>
            <div style={{display: 'flex', gap: '1.5rem', marginBottom: '1rem'}}>
              <div style={{flex: 1}}>
                <label className="form-label">Date Created</label>
                <input type="date" className="form-control" name="date_created" value={newAction.date_created} onChange={handleActionChange} onClick={(e) => { try { e.target.showPicker(); } catch(err) {} }} style={{width: '100%', cursor: 'pointer'}} />
              </div>
              <div style={{flex: 1}}>
                <label className="form-label">Due Date (Optional)</label>
                <input type="date" className="form-control" name="due_date" value={newAction.due_date} onChange={handleActionChange} onClick={(e) => { try { e.target.showPicker(); } catch(err) {} }} style={{width: '100%', cursor: 'pointer'}} />
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

        {displayedActions.length === 0 ? (
          <div style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px'}}>
            No actions found.
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {displayedActions.map(act => (
              <div key={act.id} className="glass-panel" style={{
                padding: '1.5rem', 
                borderLeft: `4px solid ${act.date_completed ? 'var(--tier-2)' : 'var(--tier-1)'}`, 
                opacity: act.date_completed ? 0.7 : 1,
                display: 'flex', 
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap'
              }}>
                <div style={{flex: '0 0 140px', display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                    Created: {new Date(act.date_created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {act.due_date && (
                    <span style={{
                      fontSize: '0.85rem', 
                      color: (!act.date_completed && new Date(act.due_date) < new Date(new Date().setHours(0,0,0,0))) ? '#ef4444' : 'var(--text-secondary)',
                      fontWeight: (!act.date_completed && new Date(act.due_date) < new Date(new Date().setHours(0,0,0,0))) ? 'bold' : 'normal'
                    }}>
                      Due: {new Date(act.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  <span style={{fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem'}}>
                    {act.owner}
                  </span>
                </div>
                
                <div style={{flex: '1', minWidth: '200px'}}>
                  <div style={{fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem'}}>
                    {act.action_description}
                  </div>
                  {act.date_completed ? (
                    <div style={{fontSize: '0.9rem', color: 'var(--tier-2)', background: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'inline-block'}}>
                      <strong>Completed:</strong> {act.outcome}
                    </div>
                  ) : (
                    <div style={{background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap'}}>Outcome:</span>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Type and press Enter to complete..." 
                        style={{width: '100%', padding: '0.4rem 0.75rem', fontSize: '0.9rem'}}
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
                    </div>
                  )}
                </div>

                <div style={{flex: '0 0 auto'}}>
                  <button 
                    onClick={() => handleDeleteAction(act.id)}
                    style={{
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--text-secondary)', 
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--tier-1)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    title="Delete action"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {!act.date_completed && <ActionUpdates actionId={act.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
