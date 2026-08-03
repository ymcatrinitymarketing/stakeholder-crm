'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, Trash2, MapPin, Clock, FileText } from 'lucide-react';
import MultiOwnerSelect from '@/components/MultiOwnerSelect';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_time: '',
    location: '',
    resources: '',
    owner: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [eventsRes, genActionsRes, annivActionsRes, stakeholdersRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/actions?type=General'),
        fetch('/api/actions?type=175th'),
        fetch('/api/stakeholders')
      ]);
      
      const eventsData = await eventsRes.json();
      const genActionsData = await genActionsRes.json();
      const annivActionsData = await annivActionsRes.json();
      const stakeholdersData = await stakeholdersRes.json();

      // We only want actions with a due_date
      const mapActions = (acts, color, prefix) => {
        return acts.filter(a => a.due_date).map(a => {
          let title = a.action_description;
          if (a.stakeholder_id) {
            const sh = stakeholdersData.find(s => s.id === a.stakeholder_id);
            if (sh) title = `${sh.name}: ${title}`;
          }
          return {
            id: `action-${a.id}`,
            real_id: a.id,
            title: title,
            event_date: a.due_date,
            owner: a.owner,
            type: 'action',
            badge: prefix,
            color: color,
            completed: !!a.date_completed
          };
        });
      };

      const formattedEvents = eventsData.map(e => ({
        ...e,
        type: 'event',
        color: '#3b82f6', // blue
        badge: 'Event'
      }));

      const formattedGenActions = mapActions(genActionsData, '#ef4444', 'General');
      const formattedAnnivActions = mapActions(annivActionsData, '#8b5cf6', '175th');

      setEvents([...formattedEvents, ...formattedGenActions, ...formattedAnnivActions]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Add padding days from previous month (Start on Monday)
    let firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Make Sunday 7
    for (let i = 1; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, 1 - (firstDayOfWeek - i));
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Add padding days for next month to complete the grid (usually 42 cells)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  };

  const days = getDaysInMonth(currentDate);

  const handleDayClick = (day) => {
    setSelectedDay(day.date);
    setIsModalOpen(true);
    setShowAddForm(false);
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title) return;
    setIsSaving(true);
    
    // Convert selectedDay to local YYYY-MM-DD
    const tzOffset = selectedDay.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(selectedDay.getTime() - tzOffset)).toISOString().split('T')[0];
    
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEvent, event_date: localISOTime })
      });
      if (res.ok) {
        fetchAllData();
        setNewEvent({ title: '', description: '', event_time: '', location: '', resources: '', owner: '' });
        setShowAddForm(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const formatMonth = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const selectedDayEvents = events.filter(e => isSameDay(e.event_date, selectedDay));

  return (
    <div className="animate-fade-in stagger-1" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div className="glass-panel" style={{padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column'}}>
        
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <CalendarIcon size={24} color="var(--tier-1)" />
            <h2 style={{fontSize: '1.5rem', fontWeight: 600, margin: 0}}>{formatMonth(currentDate)}</h2>
          </div>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <button className="btn btn-outline" style={{padding: '0.5rem'}} onClick={goToday}>Today</button>
            <button className="btn btn-outline" style={{padding: '0.5rem'}} onClick={prevMonth}><ChevronLeft size={20}/></button>
            <button className="btn btn-outline" style={{padding: '0.5rem'}} onClick={nextMonth}><ChevronRight size={20}/></button>
          </div>
        </div>

        {/* Legend */}
        <div style={{display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', flexWrap: 'wrap'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6'}}></div> Standalone Events
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444'}}></div> General Actions Due
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#8b5cf6'}}></div> 175th Actions Due
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5}}>
             Completed Actions are faded out
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', flex: 1, minHeight: '600px'}}>
          {/* Day Headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} style={{fontWeight: 600, textAlign: 'center', padding: '0.5rem', color: 'var(--text-secondary)'}}>
              {day}
            </div>
          ))}

          {/* Day Cells */}
          {days.map((dayObj, i) => {
            const dayEvents = events.filter(e => isSameDay(e.event_date, dayObj.date));
            const isToday = isSameDay(new Date(), dayObj.date);

            return (
              <div 
                key={i} 
                onClick={() => handleDayClick(dayObj)}
                style={{
                  background: dayObj.isCurrentMonth ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                  border: isToday ? '1px solid var(--tier-1)' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  minHeight: '100px',
                  cursor: 'pointer',
                  opacity: dayObj.isCurrentMonth ? 1 : 0.4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseOut={(e) => e.currentTarget.style.background = dayObj.isCurrentMonth ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)'}
              >
                <div style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '24px',
                  lineHeight: '24px',
                  textAlign: 'center',
                  borderRadius: '50%',
                  background: isToday ? 'var(--tier-1)' : 'transparent',
                  color: isToday ? 'white' : 'var(--text-primary)',
                  fontWeight: isToday ? 'bold' : 'normal',
                  fontSize: '0.9rem',
                  marginBottom: '4px'
                }}>
                  {dayObj.date.getDate()}
                </div>
                
                {dayEvents.slice(0, 4).map(evt => (
                  <div key={evt.id} style={{
                    fontSize: '0.75rem',
                    background: `${evt.color}20`,
                    borderLeft: `3px solid ${evt.color}`,
                    color: 'var(--text-primary)',
                    padding: '2px 4px',
                    borderRadius: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    opacity: evt.completed ? 0.4 : 1,
                    textDecoration: evt.completed ? 'line-through' : 'none'
                  }}>
                    {evt.title}
                  </div>
                ))}
                {dayEvents.length > 4 && (
                  <div style={{fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center'}}>
                    +{dayEvents.length - 4} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Day details */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{zIndex: 2000}}>
          <div className="modal-content animate-fade-in" style={{maxWidth: '600px', width: '90%'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2 style={{margin: 0}}>
                {selectedDay.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'}}>
                <X size={24} />
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem'}}>
              {selectedDayEvents.length === 0 ? (
                <div style={{color: 'var(--text-secondary)'}}>No events or actions scheduled for this day.</div>
              ) : (
                selectedDayEvents.map(evt => (
                  <div key={evt.id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderLeft: `4px solid ${evt.color}`,
                    padding: '1rem',
                    borderRadius: '8px',
                    opacity: evt.completed ? 0.6 : 1
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <div>
                        <div style={{fontSize: '0.8rem', color: evt.color, fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase'}}>{evt.badge}</div>
                        <div style={{fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px', textDecoration: evt.completed ? 'line-through' : 'none'}}>{evt.title}</div>
                        
                        {(evt.event_time || evt.location) && (
                          <div style={{display: 'flex', gap: '1rem', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                            {evt.event_time && <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Clock size={14}/> {evt.event_time}</span>}
                            {evt.location && <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><MapPin size={14}/> {evt.location}</span>}
                          </div>
                        )}

                        {evt.description && <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px'}}>{evt.description}</div>}
                        
                        {evt.resources && (
                          <div style={{fontSize: '0.85rem', color: 'var(--tier-3)', background: 'var(--tier-3-bg)', padding: '0.5rem', borderRadius: '4px', marginBottom: '8px'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px'}}><FileText size={14}/> <strong>Resources:</strong></div>
                            <div>{evt.resources}</div>
                          </div>
                        )}

                        <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                          Owner: {evt.owner && evt.owner.split(',').map((o, idx) => (
                            <span key={idx} className="badge badge-tier-2" style={{marginRight: '0.25rem', fontSize: '0.7rem', padding: '0.15rem 0.5rem'}}>{o.trim()}</span>
                          ))}
                        </div>
                      </div>
                      {evt.type === 'event' && (
                        <button onClick={() => handleDeleteEvent(evt.real_id || evt.id)} style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {!showAddForm ? (
              <button className="btn btn-outline" style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}} onClick={() => setShowAddForm(true)}>
                <Plus size={18} /> Add Standalone Event
              </button>
            ) : (
              <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px'}}>
                <h4 style={{marginTop: 0, marginBottom: '1rem'}}>New Event</h4>
                <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                  <div style={{flex: 1}}>
                    <label className="form-label">Event Title</label>
                    <input type="text" className="form-control" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. Stakeholder Gala" />
                  </div>
                  <div style={{width: '250px'}}>
                    <label className="form-label">Time</label>
                    <input type="text" className="form-control" value={newEvent.event_time} onChange={e => setNewEvent({...newEvent, event_time: e.target.value})} placeholder="e.g. 14:00" />
                  </div>
                </div>
                
                <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                  <div style={{flex: 1}}>
                    <label className="form-label">Location</label>
                    <input type="text" className="form-control" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} placeholder="Where is this happening?" />
                  </div>
                  <div style={{flex: 1}}>
                    <label className="form-label">Organisers</label>
                    <MultiOwnerSelect selectedOwners={newEvent.owner} onChange={(val) => setNewEvent({...newEvent, owner: val})} />
                  </div>
                </div>

                <div style={{marginBottom: '1rem'}}>
                  <label className="form-label">Description (Optional)</label>
                  <textarea className="form-control" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} rows="2"></textarea>
                </div>

                <div style={{marginBottom: '1rem'}}>
                  <label className="form-label">Resources Needed (Optional)</label>
                  <textarea className="form-control" value={newEvent.resources} onChange={e => setNewEvent({...newEvent, resources: e.target.value})} rows="2" placeholder="e.g. Projector, 20 Chairs..."></textarea>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.5rem'}}>
                  <button className="btn btn-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveEvent} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Event'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
