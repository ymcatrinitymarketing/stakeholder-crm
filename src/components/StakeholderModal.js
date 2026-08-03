'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Edit } from 'lucide-react';
import ActionUpdates from '@/components/ActionUpdates';
import EditStakeholderModal from '@/components/EditStakeholderModal';
import MultiOwnerSelect from '@/components/MultiOwnerSelect';
import EditActionModal from '@/components/EditActionModal';

export default function StakeholderModal({ isOpen, onClose, stakeholder, onStakeholderUpdated }) {
  const [formData, setFormData] = useState({
    tier: 4,
    main_contact: '',
    owned_by: 'Unassigned'
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [interactions, setInteractions] = useState([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Phone Call',
    outcome: '',
    next_contact: ''
  });
  const [isSavingInteraction, setIsSavingInteraction] = useState(false);

  const [activeTab, setActiveTab] = useState('interactions'); // 'interactions' or 'actions'
  const [actions, setActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [showAddAction, setShowAddAction] = useState(false);
  const [newAction, setNewAction] = useState({
    date_created: new Date().toISOString().split('T')[0],
    due_date: '',
    action_description: '',
    owner: 'Jonathan'
  });
  const [isSavingAction, setIsSavingAction] = useState(false);
  const [editingAction, setEditingAction] = useState(null);

  useEffect(() => {
    if (stakeholder && isOpen) {
      setFormData({
        tier: stakeholder.tier || 4,
        main_contact: stakeholder.main_contact || '',
        owned_by: stakeholder.owned_by || 'Unassigned'
      });
      fetchInteractions(stakeholder.id);
      fetchActions(stakeholder.id);
      setShowAddInteraction(false);
      setShowAddAction(false);
      setActiveTab('interactions');
      setNewInteraction({
        date: new Date().toISOString().split('T')[0],
        type: 'Phone Call',
        outcome: '',
        next_contact: ''
      });
      setNewAction({
        date_created: new Date().toISOString().split('T')[0],
        due_date: '',
        action_description: '',
        owner: 'Jonathan'
      });
    }
  }, [stakeholder, isOpen]);

  const fetchInteractions = async (id) => {
    setLoadingInteractions(true);
    try {
      const res = await fetch(`/api/stakeholders/${id}/interactions`);
      const data = await res.json();
      setInteractions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInteractions(false);
    }
  };

  const fetchActions = async (id) => {
    setLoadingActions(true);
    try {
      const res = await fetch(`/api/stakeholders/${id}/actions`);
      const data = await res.json();
      setActions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActions(false);
    }
  };

  if (!isOpen || !stakeholder) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'tier' ? parseInt(value) : value }));
  };

  const handleInteractionChange = (e) => {
    const { name, value } = e.target;
    setNewInteraction(prev => ({ ...prev, [name]: value }));
  };

  const handleActionChange = (e) => {
    const { name, value } = e.target;
    setNewAction(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/stakeholders/${stakeholder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stakeholder,
          ...formData
        })
      });
      if (res.ok) {
        onClose();
      } else {
        alert("Failed to save. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInteraction = async () => {
    if (!newInteraction.date || !newInteraction.type) return;
    setIsSavingInteraction(true);
    try {
      const res = await fetch(`/api/stakeholders/${stakeholder.id}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInteraction)
      });
      if (res.ok) {
        setShowAddInteraction(false);
        fetchInteractions(stakeholder.id);
        setNewInteraction({
          date: new Date().toISOString().split('T')[0],
          type: 'Phone Call',
          outcome: '',
          next_contact: ''
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingInteraction(false);
    }
  };

  const handleSaveAction = async () => {
    if (!newAction.date_created || !newAction.action_description) return;
    setIsSavingAction(true);
    try {
      const res = await fetch(`/api/stakeholders/${stakeholder.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAction)
      });
      if (res.ok) {
        setShowAddAction(false);
        fetchActions(stakeholder.id);
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
      setIsSavingAction(false);
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
        fetchActions(stakeholder.id);
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
        fetchActions(stakeholder.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{maxWidth: '800px', display: 'flex', flexDirection: 'column'}}>
        <div className="modal-header">
          <h2 style={{fontSize: '1.25rem', fontWeight: 600}}>{stakeholder.name}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body" style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
          {/* LEFT SIDE: Info & Edit */}
          <div style={{flex: '1 1 300px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h3 style={{fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)'}}>Details</h3>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', 
                  color: 'var(--text-primary)', padding: '0.3rem 0.6rem', fontSize: '0.8rem', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                }}
              >
                <Edit size={14} /> Edit
              </button>
            </div>
            <div style={{background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>
              <div style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem'}}>Role / Organisation</div>
              <div style={{fontWeight: 500}}>{stakeholder.role} {stakeholder.organisation ? `- ${stakeholder.organisation}` : ''}</div>
              
              <div style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1rem', marginBottom: '0.25rem'}}>Focus Areas</div>
              <div>{stakeholder.focus_areas || 'None specified'}</div>

              <div style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1rem', marginBottom: '0.25rem'}}>Contact Details</div>
              <div>{stakeholder.contact_details || 'No contact provided'}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Stakeholder Tier</label>
              <select className="form-control" name="tier" value={formData.tier} onChange={handleChange}>
                <option value="1">Tier 1 (Excellent Contact)</option>
                <option value="2">Tier 2 (Good Contact)</option>
                <option value="3">Tier 3 (Some or Little Contact)</option>
                <option value="4">Tier 4 (No Contact)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Internal Owner</label>
              <select className="form-control" name="owned_by" value={formData.owned_by} onChange={handleChange}>
                <option value="Unassigned">Unassigned</option>
                <option value="Jonathan">Jonathan</option>
                <option value="Amanda">Amanda</option>
                <option value="Ian">Ian</option>
                <option value="Ryan">Ryan</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Main Contact at YMCA</label>
              <input 
                type="text" 
                className="form-control" 
                name="main_contact" 
                value={formData.main_contact} 
                onChange={handleChange}
                placeholder="e.g. Board Member Name"
              />
            </div>
          </div>

          {/* RIGHT SIDE: Interactions & Actions */}
          <div style={{flex: '1.2 1 350px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem'}}>
            <div style={{display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem', paddingBottom: '0.5rem'}}>
              <button 
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.05rem', fontWeight: 600,
                  color: activeTab === 'interactions' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'interactions' ? '2px solid var(--accent)' : 'none',
                  paddingBottom: '0.5rem', marginBottom: '-0.6rem'
                }}
                onClick={() => setActiveTab('interactions')}
              >
                Interaction Log
              </button>
              <button 
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.05rem', fontWeight: 600,
                  color: activeTab === 'actions' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'actions' ? '2px solid var(--accent)' : 'none',
                  paddingBottom: '0.5rem', marginBottom: '-0.6rem'
                }}
                onClick={() => setActiveTab('actions')}
              >
                To Do Actions
              </button>
            </div>

            {activeTab === 'interactions' && (
              <>
                <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem'}}>
                  {!showAddInteraction && (
                    <button 
                      className="btn btn-outline" 
                      style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}
                      onClick={() => setShowAddInteraction(true)}
                    >
                      <Plus size={16} style={{marginRight: '4px'}}/> Add Log
                    </button>
                  )}
                </div>

                {showAddInteraction && (
                  <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>
                    <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                      <div style={{flex: 1}}>
                        <label className="form-label">Date</label>
                        <input type="date" className="form-control" name="date" value={newInteraction.date} onChange={handleInteractionChange} onClick={(e) => { try { e.target.showPicker(); } catch(err) {} }} style={{cursor: 'pointer'}} />
                      </div>
                      <div style={{flex: 1}}>
                        <label className="form-label">Type</label>
                        <select className="form-control" name="type" value={newInteraction.type} onChange={handleInteractionChange}>
                          <option value="Phone Call">Phone Call</option>
                          <option value="Email">Email</option>
                          <option value="In-Person Meeting">In-Person Meeting</option>
                          <option value="Virtual Meeting">Virtual Meeting</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                      <label className="form-label">Outcome / Notes</label>
                      <textarea className="form-control" name="outcome" value={newInteraction.outcome} onChange={handleInteractionChange} rows="2" placeholder="What was discussed?" />
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                      <label className="form-label">Next Contact / Actions</label>
                      <input type="text" className="form-control" name="next_contact" value={newInteraction.next_contact} onChange={handleInteractionChange} placeholder="e.g. Follow up in 2 weeks" />
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                      <button className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => setShowAddInteraction(false)}>Cancel</button>
                      <button className="btn" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={handleSaveInteraction} disabled={isSavingInteraction}>
                        {isSavingInteraction ? 'Saving...' : 'Save Log'}
                      </button>
                    </div>
                  </div>
                )}

                <div style={{maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem'}}>
                  {loadingInteractions ? (
                    <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Loading...</div>
                  ) : interactions.length === 0 ? (
                    <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px'}}>
                      No interactions logged yet.
                    </div>
                  ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                      {interactions.map(int => (
                        <div key={int.id} style={{background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent)'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                            <span style={{fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)'}}>{int.type}</span>
                            <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                              {new Date(int.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          {int.outcome && (
                            <div style={{fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)'}}>
                              {int.outcome}
                            </div>
                          )}
                          {int.next_contact && (
                            <div style={{fontSize: '0.85rem', color: 'var(--tier-2)', display: 'flex', gap: '0.25rem'}}>
                              <strong style={{color: 'var(--text-secondary)'}}>Next:</strong> {int.next_contact}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'actions' && (
              <>
                <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem'}}>
                  {!showAddAction && (
                    <button 
                      className="btn btn-outline" 
                      style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}
                      onClick={() => setShowAddAction(true)}
                    >
                      <Plus size={16} style={{marginRight: '4px'}}/> Add Action
                    </button>
                  )}
                </div>

                {showAddAction && (
                  <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '3px solid var(--tier-1)'}}>
                    <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                      <div style={{flex: 1}}>
                        <label className="form-label">Date</label>
                        <input type="date" className="form-control" name="date_created" value={newAction.date_created} onChange={handleActionChange} onClick={(e) => { try { e.target.showPicker(); } catch(err) {} }} style={{cursor: 'pointer'}} />
                      </div>
                      <div style={{flex: 1}}>
                        <label className="form-label">Due Date (Optional)</label>
                        <input type="date" className="form-control" name="due_date" value={newAction.due_date} onChange={handleActionChange} onClick={(e) => { try { e.target.showPicker(); } catch(err) {} }} style={{cursor: 'pointer'}} />
                      </div>
                      <div style={{flex: 1}}>
                        <label className="form-label">Assign To (Select multiple)</label>
                        <MultiOwnerSelect 
                          selectedOwners={newAction.owner}
                          onChange={(val) => setNewAction(prev => ({...prev, owner: val}))}
                        />
                      </div>
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                      <label className="form-label">Action Required</label>
                      <textarea className="form-control" name="action_description" value={newAction.action_description} onChange={handleActionChange} rows="2" placeholder="Describe the action..." />
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                      <button className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => setShowAddAction(false)}>Cancel</button>
                      <button className="btn" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'var(--tier-1)', color: 'white', border: 'none'}} onClick={handleSaveAction} disabled={isSavingAction}>
                        {isSavingAction ? 'Saving...' : 'Add Action & Send Email'}
                      </button>
                    </div>
                  </div>
                )}

                <div style={{maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem'}}>
                  {loadingActions ? (
                    <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Loading...</div>
                  ) : actions.length === 0 ? (
                    <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px'}}>
                      No actions logged yet.
                    </div>
                  ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                      {actions.map(act => (
                        <div key={act.id} style={{background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', borderLeft: `3px solid ${act.date_completed ? 'var(--tier-2)' : 'var(--tier-1)'}`, opacity: act.date_completed ? 0.7 : 1}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start'}}>
                            <div style={{flex: 1}}>
                              <span style={{fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)'}}>{act.action_description}</span>
                            </div>
                            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem'}}>
                                <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                                  Created: {new Date(act.date_created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                {act.due_date && (
                                  <span style={{
                                    fontSize: '0.8rem', 
                                    color: (!act.date_completed && new Date(act.due_date) < new Date(new Date().setHours(0,0,0,0))) ? '#ef4444' : 'var(--text-secondary)',
                                    fontWeight: (!act.date_completed && new Date(act.due_date) < new Date(new Date().setHours(0,0,0,0))) ? 'bold' : 'normal'
                                  }}>
                                    Due: {new Date(act.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                )}
                              </div>
                              <div style={{display: 'flex', gap: '0.25rem'}}>
                                {!act.date_completed && (
                                  <button 
                                    onClick={() => setEditingAction(act)}
                                    style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem'}}
                                    title="Edit action"
                                  >
                                    <Edit size={16} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteAction(act.id)}
                                  style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem'}}
                                  title="Delete action"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem'}}>
                            Assigned to: <strong style={{color: 'var(--text-primary)'}}>{act.owner}</strong>
                          </div>

                          {!act.date_completed ? (
                            <div style={{background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', marginTop: '0.5rem'}}>
                              <div style={{fontSize: '0.85rem', marginBottom: '0.5rem'}}>Mark as Completed</div>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Outcome details..." 
                                style={{marginBottom: '0.5rem', fontSize: '0.85rem', padding: '0.4rem'}}
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
                              <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Press Enter or click away to save completion.</div>
                            </div>
                          ) : (
                            <div style={{fontSize: '0.85rem', color: 'var(--tier-2)', display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                              <span><strong style={{color: 'var(--text-secondary)'}}>Outcome:</strong> {act.outcome}</span>
                              <span><strong style={{color: 'var(--text-secondary)'}}>Completed:</strong> {new Date(act.date_completed).toLocaleDateString('en-GB')}</span>
                            </div>
                          )}
                          
                          {!act.date_completed && <ActionUpdates actionId={act.id} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem'}}>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn" onClick={handleSave} disabled={isSaving}>
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Stakeholder Details'}
          </button>
        </div>
      </div>

      <EditStakeholderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        stakeholder={stakeholder}
        onSaveSuccess={(updatedData) => {
          if (onStakeholderUpdated) {
            onStakeholderUpdated(updatedData);
          }
          setIsEditModalOpen(false);
        }}
      />

      <EditActionModal
        isOpen={!!editingAction}
        onClose={() => setEditingAction(null)}
        action={editingAction}
        onSaveSuccess={() => {
          setEditingAction(null);
          fetchActions(stakeholder.id);
        }}
      />
    </div>
  );
}
