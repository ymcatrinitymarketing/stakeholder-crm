'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, MapPin, Clock, FileText, X } from 'lucide-react';
import MultiOwnerSelect from '@/components/MultiOwnerSelect';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    event_time: '',
    location: '',
    description: '',
    resources: '',
    owner: ''
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ title: '', event_date: '', event_time: '', location: '', description: '', resources: '', owner: '' });
    setShowAddModal(true);
  };

  const openEditModal = (evt) => {
    setFormData({
      title: evt.title || '',
      event_date: evt.event_date ? new Date(evt.event_date).toISOString().split('T')[0] : '',
      event_time: evt.event_time || '',
      location: evt.location || '',
      description: evt.description || '',
      resources: evt.resources || '',
      owner: evt.owner || ''
    });
    setEditingEvent(evt);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.event_date) return;
    setIsSaving(true);
    try {
      if (editingEvent) {
        await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setShowAddModal(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (e) {
      console.error(e);
      alert('Failed to save event.');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="header">
        <div>
          <h1>Events Planner</h1>
          <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>Manage and organize upcoming events.</p>
        </div>
        <button className="btn" onClick={openAddModal}>
          <Plus size={18} /> Plan New Event
        </button>
      </div>

      <div className="glass-panel" style={{padding: '1.5rem'}}>
        {loading ? (
          <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>Loading events...</div>
        ) : events.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>
            No events scheduled yet.
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {events.map((evt) => (
              <div key={evt.id} style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1.5rem'
              }}>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                    <h3 style={{fontSize: '1.1rem', fontWeight: 600}}>{evt.title}</h3>
                    {evt.owner && (
                      <div style={{display: 'flex', gap: '0.25rem'}}>
                        {evt.owner.split(',').map((o, idx) => (
                          <span key={idx} className="badge badge-tier-2">{o.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={{display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                      <Clock size={16} /> 
                      {new Date(evt.event_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {evt.event_time && ` at ${evt.event_time}`}
                    </div>
                    {evt.location && (
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                        <MapPin size={16} /> {evt.location}
                      </div>
                    )}
                  </div>

                  {evt.description && (
                    <div style={{marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '0.95rem'}}>
                      <strong>Description:</strong><br/>
                      {evt.description}
                    </div>
                  )}

                  {evt.resources && (
                    <div style={{color: 'var(--tier-3)', fontSize: '0.95rem', background: 'var(--tier-3-bg)', padding: '0.75rem', borderRadius: '4px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem'}}>
                        <FileText size={16} /> <strong>Resources Needed:</strong>
                      </div>
                      <div style={{whiteSpace: 'pre-wrap'}}>{evt.resources}</div>
                    </div>
                  )}
                </div>

                <div style={{flex: '0 0 auto', display: 'flex', gap: '0.5rem'}}>
                  <button 
                    onClick={() => openEditModal(evt)}
                    style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', height: 'fit-content'}}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(evt.id)}
                    style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', height: 'fit-content'}}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--tier-4)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Modal */}
      {(showAddModal || editingEvent) && (
        <div className="modal-overlay active" onClick={(e) => { if(e.target === e.currentTarget) { setShowAddModal(false); setEditingEvent(null); }}}>
          <div className="modal-content" style={{maxWidth: '700px'}}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Edit Event' : 'Plan New Event'}</h2>
              <button onClick={() => { setShowAddModal(false); setEditingEvent(null); }} style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input className="form-control" name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-control" name="event_date" value={formData.event_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time (e.g. 14:00 - 16:00)</label>
                  <input type="text" className="form-control" name="event_time" value={formData.event_time} onChange={handleChange} placeholder="Optional" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" name="location" value={formData.location} onChange={handleChange} placeholder="Where is this happening?" />
              </div>

              <div className="form-group">
                <label className="form-label">Organisers / Staff Needed</label>
                <MultiOwnerSelect selectedOwners={formData.owner} onChange={(val) => setFormData(prev => ({ ...prev, owner: val }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="What is this event about?" />
              </div>

              <div className="form-group">
                <label className="form-label">Resources Needed</label>
                <textarea className="form-control" name="resources" value={formData.resources} onChange={handleChange} rows="3" placeholder="e.g. Projector, 20 Chairs, Catering, Flipcharts..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setShowAddModal(false); setEditingEvent(null); }}>Cancel</button>
              <button className="btn" onClick={handleSave} disabled={isSaving || !formData.title || !formData.event_date}>
                {isSaving ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
