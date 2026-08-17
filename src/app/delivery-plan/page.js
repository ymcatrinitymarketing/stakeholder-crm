'use client';

import { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import DeliveryTaskModal from '@/components/DeliveryTaskModal';

export default function DeliveryPlanPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery-plan');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return <div className="animate-fade-in" style={{textAlign: 'center', marginTop: '4rem'}}>Loading delivery plan...</div>;
  }

  // Group tasks by Month based on start_date
  const groupedTasks = {};
  tasks.forEach(task => {
    let monthKey = 'Unscheduled';
    if (task.start_date) {
      const d = new Date(task.start_date);
      monthKey = d.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
    }
    if (!groupedTasks[monthKey]) groupedTasks[monthKey] = [];
    groupedTasks[monthKey].push(task);
  });

  // Sort month keys chronologically (simple approach: parse back to date)
  const sortedMonths = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'Unscheduled') return 1;
    if (b === 'Unscheduled') return -1;
    return new Date(`1 ${a}`) - new Date(`1 ${b}`);
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Complete': return 'var(--tier-2)'; // Greenish
      case 'In Progress': return 'var(--tier-1)'; // Blueish/primary
      case 'On Hold': return 'var(--tier-3)'; // Orangeish
      default: return 'var(--text-secondary)'; // Grey
    }
  };

  return (
    <div className="animate-fade-in stagger-1">
      <div className="glass-panel" style={{padding: '2rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>175th Anniversary Delivery Plan</h2>
        </div>

        {tasks.length === 0 ? (
          <div style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem'}}>
            No tasks found in the delivery plan.
          </div>
        ) : (
          <div className="timeline-container" style={{display: 'flex', flexDirection: 'column', gap: '3rem'}}>
            {sortedMonths.map(month => (
              <div key={month} className="timeline-month-section">
                <h3 style={{
                  fontSize: '1.3rem', 
                  fontWeight: 700, 
                  marginBottom: '1.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)',
                  borderLeft: '4px solid #0284c7',
                  borderRadius: '8px',
                  color: '#fff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  {month}
                </h3>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {groupedTasks[month].map(task => (
                    <div key={task.id} className="timeline-task-card" onClick={() => setEditingTask(task)} style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      borderLeft: `4px solid ${getStatusColor(task.status)}`,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      display: 'grid',
                      gridTemplateColumns: '1fr 3fr 1fr 1fr',
                      gap: '1rem',
                      alignItems: 'center'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                      <div>
                        <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>{task.phase}</span>
                        <div style={{fontWeight: 600, marginTop: '0.25rem', fontSize: '0.9rem'}}>{task.workstream}</div>
                      </div>
                      
                      <div>
                        <div style={{fontSize: '1.05rem', fontWeight: 500, color: task.status === 'Complete' ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: task.status === 'Complete' ? 'line-through' : 'none'}}>{task.activity}</div>
                        {task.notes && <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontStyle: 'italic'}}>{task.notes}</div>}
                      </div>

                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                        <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{task.type}</span>
                        <span style={{fontSize: '0.9rem'}}>{task.lead}</span>
                      </div>
                      
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span style={{
                          fontSize: '0.8rem', 
                          padding: '0.25rem 0.6rem', 
                          borderRadius: '12px', 
                          background: `${getStatusColor(task.status)}20`, // 20% opacity
                          color: getStatusColor(task.status),
                          fontWeight: 600
                        }}>
                          {task.status}
                        </span>
                        <Edit size={16} color="var(--text-secondary)" style={{opacity: 0.5}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeliveryTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onSaveSuccess={() => {
          setEditingTask(null);
          fetchTasks();
        }}
      />
    </div>
  );
}
