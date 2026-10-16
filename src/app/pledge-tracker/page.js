'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  HeartHandshake,
  PoundSterling,
  Megaphone,
  MailCheck,
  Search,
  Filter,
  X
} from 'lucide-react';

export default function PledgeTrackerPage() {
  const [pledges, setPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPledge, setEditingPledge] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const emptyPledge = {
    name: '',
    pledge_type: 'Action',
    amount: '',
    pledge_date: new Date().toISOString().split('T')[0],
    target_completion_date: '',
    pledge_description: '',
    marketing_consent: false,
    thank_you_sent: false,
    status: 'In Progress',
    notes: ''
  };

  const [newPledge, setNewPledge] = useState(emptyPledge);

  const fetchPledges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pledges');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPledges(data);
      }
    } catch (err) {
      console.error('Failed to fetch pledges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPledges();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPledge((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreatePledge = async (e) => {
    e.preventDefault();
    if (!newPledge.name.trim() || !newPledge.pledge_date || !newPledge.pledge_description.trim()) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/pledges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPledge)
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewPledge({
          ...emptyPledge,
          pledge_date: new Date().toISOString().split('T')[0]
        });
        fetchPledges();
      }
    } catch (err) {
      console.error('Failed to create pledge:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePledge = async (id, updates) => {
    try {
      const res = await fetch(`/api/pledges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchPledges();
      }
    } catch (err) {
      console.error('Failed to update pledge:', err);
    }
  };

  const handleSaveEditModal = async (e) => {
    e.preventDefault();
    if (!editingPledge) return;
    setIsSaving(true);
    try {
      await handleUpdatePledge(editingPledge.id, {
        name: editingPledge.name,
        pledge_type: editingPledge.pledge_type,
        amount: editingPledge.pledge_type === 'Financial' ? editingPledge.amount : null,
        pledge_date: editingPledge.pledge_date,
        target_completion_date: editingPledge.target_completion_date || null,
        pledge_description: editingPledge.pledge_description,
        marketing_consent: editingPledge.marketing_consent,
        thank_you_sent: editingPledge.thank_you_sent,
        status: editingPledge.status,
        completed_date:
          editingPledge.status === 'Completed'
            ? editingPledge.completed_date || new Date().toISOString().split('T')[0]
            : null,
        notes: editingPledge.notes
      });
      setEditingPledge(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePledge = async (id) => {
    if (!confirm('Are you sure you want to delete this pledge?')) return;
    try {
      const res = await fetch(`/api/pledges/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchPledges();
      }
    } catch (err) {
      console.error('Failed to delete pledge:', err);
    }
  };

  // Summary metrics
  const totalPledges = pledges.length;
  const actionPledgesCount = pledges.filter((p) => p.pledge_type === 'Action').length;
  const financialPledgesCount = pledges.filter((p) => p.pledge_type === 'Financial').length;
  const totalFinancialAmount = pledges
    .filter((p) => p.pledge_type === 'Financial' && p.amount)
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const completedCount = pledges.filter((p) => p.status === 'Completed').length;
  const marketingConsentCount = pledges.filter((p) => p.marketing_consent).length;
  const thankYouSentCount = pledges.filter((p) => p.thank_you_sent).length;

  // Filtered list
  const filteredPledges = pledges.filter((p) => {
    const matchesSearch =
      !searchTerm.trim() ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pledge_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'All' || p.pledge_type === filterType;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isOverdue = (pledge) => {
    if (pledge.status === 'Completed' || !pledge.target_completion_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(pledge.target_completion_date) < today;
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        Loading 175th Anniversary Pledges...
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in stagger-1">
        {/* Top Stats Cards */}
        <div className="stats-grid">
          <div className="glass-panel stat-card">
            <span className="stat-title">Total 175th Pledges</span>
            <span className="stat-value" style={{ color: 'var(--text-primary)' }}>
              {totalPledges}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {actionPledgesCount} Action &bull; {financialPledgesCount} Financial
            </span>
          </div>

          <div className="glass-panel stat-card">
            <span className="stat-title">Financial Pledged</span>
            <span className="stat-value" style={{ color: 'var(--tier-1)' }}>
              £{totalFinancialAmount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Across {financialPledgesCount} financial {financialPledgesCount === 1 ? 'pledge' : 'pledges'}
            </span>
          </div>

          <div className="glass-panel stat-card">
            <span className="stat-title">Completed Pledges</span>
            <span className="stat-value" style={{ color: 'var(--tier-2)' }}>
              {completedCount} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ {totalPledges}</span>
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {totalPledges > 0 ? Math.round((completedCount / totalPledges) * 100) : 0}% completion rate
            </span>
          </div>

          <div className="glass-panel stat-card">
            <span className="stat-title">Comms &amp; Stewardship</span>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'baseline', marginTop: '0.25rem' }}>
              <div>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38bdf8' }}>
                  {marketingConsentCount}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                  PR / Social OK
                </span>
              </div>
              <div>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--tier-2)' }}>
                  {thankYouSentCount}/{totalPledges}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                  Thank You Sent
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <HeartHandshake size={24} color="var(--tier-1)" />
                175th Anniversary Pledge Tracker
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Log and track financial pledges and 175th anniversary action challenges (e.g. telling 175 people about YMCA Trinity Group).
              </p>
            </div>

            {!showAddForm && (
              <button
                className="btn"
                style={{ background: 'var(--tier-1)' }}
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={18} />
                Log New Pledge
              </button>
            )}
          </div>

          {/* Add Pledge Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreatePledge}
              className="animate-fade-in"
              style={{
                background: 'rgba(255,255,255,0.04)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                borderLeft: '4px solid var(--tier-1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Log a 175th Anniversary Pledge</h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Name (Person or Organisation) *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="form-control"
                    placeholder="e.g. Jane Doe / Local Partner Ltd"
                    value={newPledge.name}
                    onChange={handleInputChange}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="form-label">Pledge Type</label>
                  <select
                    name="pledge_type"
                    className="form-control"
                    value={newPledge.pledge_type}
                    onChange={handleInputChange}
                    style={{ width: '100%' }}
                  >
                    <option value="Action">Action / Challenge Pledge</option>
                    <option value="Financial">Financial Pledge (£)</option>
                  </select>
                </div>

                {newPledge.pledge_type === 'Financial' && (
                  <div>
                    <label className="form-label">Pledged Amount (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="amount"
                      className="form-control"
                      placeholder="e.g. 175.00"
                      value={newPledge.amount}
                      onChange={handleInputChange}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}

                <div>
                  <label className="form-label">Date of Pledge *</label>
                  <input
                    type="date"
                    name="pledge_date"
                    required
                    className="form-control"
                    value={newPledge.pledge_date}
                    onChange={handleInputChange}
                    onClick={(e) => {
                      try {
                        e.target.showPicker();
                      } catch (err) {}
                    }}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <label className="form-label">To Be Completed By</label>
                  <input
                    type="date"
                    name="target_completion_date"
                    className="form-control"
                    value={newPledge.target_completion_date}
                    onChange={handleInputChange}
                    onClick={(e) => {
                      try {
                        e.target.showPicker();
                      } catch (err) {}
                    }}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">What the Pledge Is *</label>
                <textarea
                  name="pledge_description"
                  required
                  rows="2"
                  className="form-control"
                  placeholder="e.g. Tell 175 people about YMCA Trinity Group, or raise £1,750 through a sponsored challenge..."
                  value={newPledge.pledge_description}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Notes / Progress Details (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  className="form-control"
                  placeholder="Any extra context, fundraising page link, or contact info..."
                  value={newPledge.notes}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--surface-border)'
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <input
                      type="checkbox"
                      name="marketing_consent"
                      checked={newPledge.marketing_consent}
                      onChange={handleInputChange}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--tier-1)', cursor: 'pointer' }}
                    />
                    <Megaphone size={16} color="#38bdf8" />
                    Happy to feature on social media / website? (Marketing / PR Consent)
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <input
                      type="checkbox"
                      name="thank_you_sent"
                      checked={newPledge.thank_you_sent}
                      onChange={handleInputChange}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--tier-2)', cursor: 'pointer' }}
                    />
                    <MailCheck size={16} color="var(--tier-2)" />
                    Thank You Sent
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    style={{ background: 'var(--tier-1)' }}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Pledge'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Search & Filters */}
          <div className="controls" style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search
                size={16}
                color="var(--text-secondary)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, pledge details, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.25rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px'
                }}
              >
                <Filter size={15} color="var(--text-secondary)" />
                <select
                  className="form-control"
                  style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-primary)', width: 'auto' }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Pledge Types</option>
                  <option value="Action">Action Pledges</option>
                  <option value="Financial">Financial Pledges</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px'
                }}
              >
                <select
                  className="form-control"
                  style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-primary)', width: 'auto' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pledge List */}
          {filteredPledges.length === 0 ? (
            <div
              style={{
                color: 'var(--text-secondary)',
                textAlign: 'center',
                padding: '3rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px'
              }}
            >
              {pledges.length === 0
                ? 'No pledges logged yet. Click "Log New Pledge" above to add your first 175th Anniversary pledge!'
                : 'No pledges match your current filters.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredPledges.map((pledge) => {
                const completed = pledge.status === 'Completed';
                const overdue = isOverdue(pledge);

                return (
                  <div
                    key={pledge.id}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem',
                      borderLeft: `4px solid ${
                        completed ? 'var(--tier-2)' : overdue ? 'var(--tier-4)' : 'var(--tier-1)'
                      }`,
                      opacity: completed ? 0.82 : 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1.5rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    {/* Left Column: Pledger & Dates */}
                    <div style={{ flex: '0 0 210px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {pledge.name}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                        {pledge.pledge_type === 'Financial' ? (
                          <span className="badge badge-tier-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <PoundSterling size={12} />
                            Financial{pledge.amount ? `: £${parseFloat(pledge.amount).toLocaleString('en-GB')}` : ''}
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(59, 130, 246, 0.15)',
                              color: '#60a5fa',
                              border: '1px solid #3b82f6'
                            }}
                          >
                            175th Action
                          </span>
                        )}

                        {completed && (
                          <span className="badge badge-tier-2">Completed</span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        <strong>Pledged:</strong> {formatDate(pledge.pledge_date)}
                      </div>

                      {pledge.target_completion_date && (
                        <div
                          style={{
                            fontSize: '0.82rem',
                            color: overdue ? 'var(--tier-4)' : 'var(--text-secondary)',
                            fontWeight: overdue ? 600 : 400
                          }}
                        >
                          <strong>Complete By:</strong> {formatDate(pledge.target_completion_date)}
                          {overdue && ' (Overdue)'}
                        </div>
                      )}
                    </div>

                    {/* Middle Column: Pledge Description, Notes & Interactive Toggles */}
                    <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          textDecoration: completed ? 'line-through' : 'none'
                        }}
                      >
                        {pledge.pledge_description}
                      </div>

                      {pledge.notes && (
                        <div
                          style={{
                            fontSize: '0.88rem',
                            color: 'var(--text-secondary)',
                            background: 'rgba(0,0,0,0.2)',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px'
                          }}
                        >
                          {pledge.notes}
                        </div>
                      )}

                      {/* Quick Action Toggles */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginTop: '0.25rem' }}>
                        {/* Marketing / PR Consent Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePledge(pledge.id, { marketing_consent: !pledge.marketing_consent })
                          }
                          title="Click to toggle Marketing / PR Consent"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            background: pledge.marketing_consent
                              ? 'rgba(56, 189, 248, 0.15)'
                              : 'rgba(255, 255, 255, 0.04)',
                            color: pledge.marketing_consent ? '#38bdf8' : 'var(--text-secondary)',
                            border: `1px solid ${
                              pledge.marketing_consent ? '#38bdf8' : 'var(--surface-border)'
                            }`
                          }}
                        >
                          <Megaphone size={13} />
                          {pledge.marketing_consent
                            ? 'PR / Social Consent: Yes ✓'
                            : 'PR / Social Consent: No'}
                        </button>

                        {/* Thank You Sent Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePledge(pledge.id, { thank_you_sent: !pledge.thank_you_sent })
                          }
                          title="Click to toggle Thank You Sent status"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            background: pledge.thank_you_sent
                              ? 'rgba(34, 197, 94, 0.15)'
                              : 'rgba(234, 179, 8, 0.12)',
                            color: pledge.thank_you_sent ? 'var(--tier-2)' : 'var(--tier-3)',
                            border: `1px solid ${
                              pledge.thank_you_sent ? 'var(--tier-2)' : 'rgba(234, 179, 8, 0.4)'
                            }`
                          }}
                        >
                          <MailCheck size={13} />
                          {pledge.thank_you_sent ? 'Thank You Sent ✓' : 'Thank You Pending'}
                        </button>

                        {/* Status Complete / In Progress Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePledge(pledge.id, {
                              status: completed ? 'In Progress' : 'Completed',
                              completed_date: completed ? null : new Date().toISOString().split('T')[0]
                            })
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            background: completed
                              ? 'rgba(34, 197, 94, 0.15)'
                              : 'rgba(255, 255, 255, 0.05)',
                            color: completed ? 'var(--tier-2)' : 'var(--text-primary)',
                            border: `1px solid ${
                              completed ? 'var(--tier-2)' : 'var(--surface-border)'
                            }`
                          }}
                        >
                          {completed ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                          {completed ? 'Completed ✓' : 'Mark Complete'}
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Edit & Delete */}
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingPledge({
                            ...pledge,
                            pledge_date: pledge.pledge_date
                              ? new Date(pledge.pledge_date).toISOString().split('T')[0]
                              : '',
                            target_completion_date: pledge.target_completion_date
                              ? new Date(pledge.target_completion_date).toISOString().split('T')[0]
                              : '',
                            amount: pledge.amount ?? ''
                          })
                        }
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '4px'
                        }}
                        title="Edit pledge"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePledge(pledge.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '4px'
                        }}
                        title="Delete pledge"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Pledge Modal */}
      <div className={`modal-overlay ${editingPledge ? 'active' : ''}`}>
        {editingPledge && (
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Edit Pledge</h3>
              <button
                type="button"
                onClick={() => setEditingPledge(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditModal}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name (Person or Organisation) *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={editingPledge.name}
                    onChange={(e) => setEditingPledge({ ...editingPledge, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Pledge Type</label>
                    <select
                      className="form-control"
                      value={editingPledge.pledge_type}
                      onChange={(e) => setEditingPledge({ ...editingPledge, pledge_type: e.target.value })}
                    >
                      <option value="Action">Action / Challenge Pledge</option>
                      <option value="Financial">Financial Pledge (£)</option>
                    </select>
                  </div>

                  {editingPledge.pledge_type === 'Financial' ? (
                    <div className="form-group">
                      <label className="form-label">Pledged Amount (£)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={editingPledge.amount}
                        onChange={(e) => setEditingPledge({ ...editingPledge, amount: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-control"
                        value={editingPledge.status}
                        onChange={(e) => setEditingPledge({ ...editingPledge, status: e.target.value })}
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  )}
                </div>

                {editingPledge.pledge_type === 'Financial' && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={editingPledge.status}
                      onChange={(e) => setEditingPledge({ ...editingPledge, status: e.target.value })}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date of Pledge *</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={editingPledge.pledge_date}
                      onChange={(e) => setEditingPledge({ ...editingPledge, pledge_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">To Be Completed By</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editingPledge.target_completion_date}
                      onChange={(e) =>
                        setEditingPledge({ ...editingPledge, target_completion_date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">What the Pledge Is *</label>
                  <textarea
                    rows="3"
                    required
                    className="form-control"
                    value={editingPledge.pledge_description}
                    onChange={(e) =>
                      setEditingPledge({ ...editingPledge, pledge_description: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Progress Details</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingPledge.notes || ''}
                    onChange={(e) => setEditingPledge({ ...editingPledge, notes: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingPledge.marketing_consent)}
                      onChange={(e) =>
                        setEditingPledge({ ...editingPledge, marketing_consent: e.target.checked })
                      }
                      style={{ width: '16px', height: '16px', accentColor: 'var(--tier-1)' }}
                    />
                    <Megaphone size={16} color="#38bdf8" />
                    Happy to feature on social media / website? (Marketing / PR Consent)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingPledge.thank_you_sent)}
                      onChange={(e) =>
                        setEditingPledge({ ...editingPledge, thank_you_sent: e.target.checked })
                      }
                      style={{ width: '16px', height: '16px', accentColor: 'var(--tier-2)' }}
                    />
                    <MailCheck size={16} color="var(--tier-2)" />
                    Thank You Sent
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingPledge(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: 'var(--tier-1)' }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
