'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import MultiOwnerSelect from '@/components/MultiOwnerSelect';
import DeliveryTaskUpdates from '@/components/DeliveryTaskUpdates';

export default function DeliveryTaskModal({ isOpen, onClose, task, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    phase: '',
    workstream: '',
    activity: '',
    type: '',
    lead: '',
    start_date: '',
    end_date: '',
    status: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        phase: task.phase || '',
        workstream: task.workstream || '',
        activity: task.activity || '',
        type: task.type || '',
        lead: task.lead || '',
        start_date: task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : '',
        end_date: task.end_date ? new Date(task.end_date).toISOString().split('T')[0] : '',
        status: task.status || 'Not Started',
        notes: task.notes || ''
      });
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.activity) return;
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      const res = await fetch(`/api/delivery-plan/${task.id}`, {
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
      <div className="modal-content" style={{maxWidth: '700px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 600}}>Edit Delivery Task</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem'}}>
          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label className="form-label">Activity Description</label>
            <textarea 
              className="form-control" 
              name="activity" 
              value={formData.activity} 
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phase</label>
            <input 
              type="text" 
              className="form-control" 
              name="phase" 
              value={formData.phase} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Workstream</label>
            <input 
              type="text" 
              className="form-control" 
              name="workstream" 
              value={formData.workstream} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <input 
              type="text" 
              className="form-control" 
              name="type" 
              value={formData.type} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" name="status" value={formData.status} onChange={handleChange}>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input 
              type="date" 
              className="form-control" 
              name="start_date" 
              value={formData.start_date} 
              onChange={handleChange} 
              onClick={(e) => { try { e.target.showPicker(); } catch(err) {} }} 
              style={{cursor: 'pointer'}} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input 
              type="date" 
              className="form-control" 
              name="end_date" 
              value={formData.end_date} 
              onChange={handleChange} 
              onClick={(e) => { try { e.target.showPicker(); } catch(err) {} }} 
              style={{cursor: 'pointer'}} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Lead / Owner</label>
            <input 
              type="text" 
              className="form-control" 
              name="lead" 
              value={formData.lead} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label className="form-label">Notes</label>
            <textarea 
              className="form-control" 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange}
              rows="3"
            />
          </div>

          {task && task.id && (
            <DeliveryTaskUpdates taskId={task.id} />
          )}

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
