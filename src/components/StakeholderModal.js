'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';

export default function StakeholderModal({ isOpen, onClose, stakeholder }) {
  const [formData, setFormData] = useState({
    tier: 4,
    main_contact: '',
    owned_by: 'Unassigned'
  });
  const [isSaving, setIsSaving] = useState(false);
  
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

  useEffect(() => {
    if (stakeholder && isOpen) {
      setFormData({
        tier: stakeholder.tier || 4,
        main_contact: stakeholder.main_contact || '',
        owned_by: stakeholder.owned_by || 'Unassigned'
      });
      fetchInteractions(stakeholder.id);
      setShowAddInteraction(false);
      setNewInteraction({
        date: new Date().toISOString().split('T')[0],
        type: 'Phone Call',
        outcome: '',
        next_contact: ''
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

  if (!isOpen || !stakeholder) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'tier' ? parseInt(value) : value }));
  };

  const handleInteractionChange = (e) => {
    const { name, value } = e.target;
    setNewInteraction(prev => ({ ...prev, [name]: value }));
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
            <h3 style={{fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--text-primary)'}}>Details</h3>
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

          {/* RIGHT SIDE: Interactions */}
          <div style={{flex: '1.2 1 350px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h3 style={{fontSize: '1.05rem', color: 'var(--text-primary)'}}>Interaction Log</h3>
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
                    <input type="date" className="form-control" name="date" value={newInteraction.date} onChange={handleInteractionChange} />
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
          </div>
        </div>

        <div className="modal-footer" style={{marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem'}}>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn" onClick={handleSave} disabled={isSaving}>
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Stakeholder Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
