'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import MultiOwnerSelect from '@/components/MultiOwnerSelect';

export default function EditActionModal({ isOpen, onClose, action, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    action_description: '',
    due_date: '',
    owner: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (action && isOpen) {
      setFormData({
        action_description: action.action_description || '',
        due_date: action.due_date ? new Date(action.due_date).toISOString().split('T')[0] : '',
        owner: action.owner || ''
      });
    }
  }, [action, isOpen]);

  if (!isOpen || !action) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.action_description) return;
    setIsSaving(true);
    try {
      const payload = {
        action_description: formData.action_description,
        due_date: formData.due_date || null,
        owner: formData.owner
      };

      const res = await fetch(`/api/actions/${action.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSaveSuccess();
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

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{maxWidth: '600px', padding: '1.5rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 600}}>Edit Action</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
          <div className="form-group">
            <label className="form-label">Action Description</label>
            <textarea 
              className="form-control" 
              name="action_description" 
              value={formData.action_description} 
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Due Date (Optional)</label>
            <input 
              type="date" 
              className="form-control" 
              name="due_date" 
              value={formData.due_date} 
              onChange={handleChange} 
              onClick={(e) => { try { e.target.showPicker(); } catch(err) {} }} 
              style={{cursor: 'pointer'}} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign To</label>
            <MultiOwnerSelect 
              selectedOwners={formData.owner}
              onChange={(val) => setFormData(prev => ({ ...prev, owner: val }))}
            />
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleSave} disabled={isSaving}>
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
