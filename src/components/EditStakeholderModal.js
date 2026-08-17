import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';

export default function EditStakeholderModal({ isOpen, onClose, stakeholder, onSaveSuccess }) {
  const isEditMode = !!stakeholder;
  
  const [formData, setFormData] = useState({
    name: '',
    organisation: '',
    role: '',
    category: 'Funders', // Default
    contact_details: '',
    focus_areas: '',
    tier: 4,
    main_contact: '',
    owned_by: 'Unassigned'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (stakeholder) {
        setFormData({
          name: stakeholder.name || '',
          organisation: stakeholder.organisation || '',
          role: stakeholder.role || '',
          category: stakeholder.category || 'Funders',
          contact_details: stakeholder.contact_details || '',
          focus_areas: stakeholder.focus_areas || '',
          tier: stakeholder.tier || 4,
          main_contact: stakeholder.main_contact || '',
          owned_by: stakeholder.owned_by || 'Unassigned'
        });
      } else {
        setFormData({
          name: '',
          organisation: '',
          role: '',
          category: 'Funders',
          contact_details: '',
          focus_areas: '',
          tier: 4,
          main_contact: '',
          owned_by: 'Unassigned'
        });
      }
    }
  }, [isOpen, stakeholder]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tier' ? parseInt(value) : value
    }));
  };

  const handleSave = async () => {
    if (!formData.name && !formData.organisation) {
      alert("Please provide at least a Name or an Organisation.");
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditMode ? `/api/stakeholders/${stakeholder.id}` : '/api/stakeholders';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save stakeholder');

      const savedData = isEditMode ? { ...stakeholder, ...formData } : await res.json();
      
      if (onSaveSuccess) {
        onSaveSuccess(isEditMode ? savedData : null);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save stakeholder. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this stakeholder? This action cannot be undone.")) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/stakeholders/${stakeholder.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete stakeholder');

      if (onSaveSuccess) {
        onSaveSuccess(null);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to delete stakeholder. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{zIndex: 2000}}>
      <div className="modal-content animate-fade-in" style={{maxWidth: '800px', width: '90%'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2 style={{margin: 0}}>{isEditMode ? 'Edit Stakeholder Details' : 'Add New Stakeholder'}</h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'}}>
            <X size={24} />
          </button>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {/* Row 1 */}
          <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
            <div style={{flex: '1 1 300px'}}>
              <label className="form-label">Stakeholder Name *</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" />
            </div>
            <div style={{flex: '1 1 300px'}}>
              <label className="form-label">Organisation</label>
              <input type="text" className="form-control" name="organisation" value={formData.organisation} onChange={handleChange} placeholder="e.g. Acme Corp" />
            </div>
          </div>

          {/* Row 2 */}
          <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
            <div style={{flex: '1 1 300px'}}>
              <label className="form-label">Role / Job Title</label>
              <input type="text" className="form-control" name="role" value={formData.role} onChange={handleChange} placeholder="e.g. CEO" />
            </div>
            <div style={{flex: '1 1 300px'}}>
              <label className="form-label">Category</label>
              <select className="form-control" name="category" value={formData.category} onChange={handleChange}>
                <option value="Funders">Funders</option>
                <option value="Commissioners">Commissioners</option>
                <option value="Local Authorities">Local Authorities</option>
                <option value="Community Partners">Community Partners</option>
                <option value="Corporate Partners">Corporate Partners</option>
                <option value="Policymakers">Policymakers</option>
                <option value="Media">Media</option>
                <option value="Education">Education</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div>
            <label className="form-label">Contact Details (Email, Phone)</label>
            <input type="text" className="form-control" name="contact_details" value={formData.contact_details} onChange={handleChange} placeholder="e.g. john@example.com, 01234 567890" />
          </div>

          {/* Row 4 */}
          <div>
            <label className="form-label">Focus Areas / Notes</label>
            <textarea className="form-control" name="focus_areas" value={formData.focus_areas} onChange={handleChange} rows="3" placeholder="Any relevant notes or areas of focus..."></textarea>
          </div>

          {/* Row 5 - Internal YMCA Details */}
          <div style={{background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}}>
            <h4 style={{margin: '0 0 1rem 0', color: 'var(--text-secondary)'}}>Internal CRM Details</h4>
            <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 200px'}}>
                <label className="form-label">Tier</label>
                <select className="form-control" name="tier" value={formData.tier} onChange={handleChange}>
                  <option value="1">Tier 1 (Excellent/Deep)</option>
                  <option value="2">Tier 2 (Good/Developing)</option>
                  <option value="3">Tier 3 (Some Contact)</option>
                  <option value="4">Tier 4 (No Contact/Cold)</option>
                </select>
              </div>
              <div style={{flex: '1 1 200px'}}>
                <label className="form-label">Owned By</label>
                <select className="form-control" name="owned_by" value={formData.owned_by} onChange={handleChange}>
                  <option value="Unassigned">Unassigned</option>
                  <option value="Amanda">Amanda</option>
                  <option value="Bridie">Bridie</option>
                  <option value="Ian">Ian</option>
                  <option value="Jonathan">Jonathan</option>
                  <option value="Kay">Kay</option>
                  <option value="Lizzy">Lizzy</option>
                  <option value="Rob">Rob</option>
                  <option value="Ryan">Ryan</option>
                  <option value="Tim">Tim</option>
                </select>
              </div>
              <div style={{flex: '1 1 200px'}}>
                <label className="form-label">Main Contact (YMCA)</label>
                <input type="text" className="form-control" name="main_contact" value={formData.main_contact} onChange={handleChange} placeholder="e.g. Jonathan Martin" />
              </div>
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem'}}>
            <div>
              {isEditMode && (
                <button 
                  className="btn btn-secondary" 
                  onClick={handleDelete}
                  disabled={isSaving}
                  style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.2)'}}
                >
                  <Trash2 size={18} /> Delete
                </button>
              )}
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <button 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSave}
                disabled={isSaving}
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
              >
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save Stakeholder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
