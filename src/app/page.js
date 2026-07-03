'use client';

import { useState, useEffect, useMemo } from 'react';
import StakeholderModal from '@/components/StakeholderModal';
import { Users, Filter, Search, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStakeholders = async () => {
    try {
      const res = await fetch('/api/stakeholders');
      const data = await res.json();
      setStakeholders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakeholders();
  }, []);

  const openModal = (stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedStakeholder(null);
    setIsModalOpen(false);
    fetchStakeholders(); // Refresh on close
  };

  const filteredData = useMemo(() => {
    return stakeholders.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                            s.category.toLowerCase().includes(search.toLowerCase()) ||
                            (s.organisation && s.organisation.toLowerCase().includes(search.toLowerCase()));
      const matchesTier = tierFilter === 'All' ? true : s.tier === parseInt(tierFilter);
      const matchesOwner = ownerFilter === 'All' ? true : s.owned_by === ownerFilter;
      return matchesSearch && matchesTier && matchesOwner;
    });
  }, [stakeholders, search, tierFilter, ownerFilter]);

  const stats = useMemo(() => {
    return {
      total: stakeholders.length,
      tier1: stakeholders.filter(s => s.tier === 1).length,
      tier2: stakeholders.filter(s => s.tier === 2).length,
      unassigned: stakeholders.filter(s => s.owned_by === 'Unassigned' || !s.owned_by).length
    };
  }, [stakeholders]);

  const getTierBadge = (tier) => {
    return <span className={`badge badge-tier-${tier}`}>{tier}</span>;
  };

  if (loading) {
    return <div className="animate-fade-in" style={{textAlign: 'center', marginTop: '4rem'}}>Loading stakeholders...</div>;
  }

  return (
    <>
      <div className="animate-fade-in stagger-1">
        <div className="stats-grid">
          <div className="glass-panel stat-card">
            <div className="stat-title">Total Stakeholders</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-title" style={{color: 'var(--tier-1)'}}>Tier 1 (Excellent)</div>
            <div className="stat-value">{stats.tier1}</div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-title" style={{color: 'var(--tier-2)'}}>Tier 2 (Good)</div>
            <div className="stat-value">{stats.tier2}</div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-title" style={{color: 'var(--tier-4)'}}>Unassigned Owners</div>
            <div className="stat-value">{stats.unassigned}</div>
          </div>
        </div>

        <div className="glass-panel" style={{padding: '1.5rem'}}>
          <div className="controls">
            <div style={{position: 'relative', flex: 1}}>
              <Search size={18} style={{position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)'}} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search stakeholders or organisations..." 
                style={{paddingLeft: '2.5rem', width: '100%'}}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="select-input" value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
              <option value="All">All Tiers</option>
              <option value="1">Tier 1 (Excellent)</option>
              <option value="2">Tier 2 (Good)</option>
              <option value="3">Tier 3 (Some)</option>
              <option value="4">Tier 4 (No Contact)</option>
            </select>
            <select className="select-input" value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
              <option value="All">All Owners</option>
              <option value="Unassigned">Unassigned</option>
              <option value="Jonathan">Jonathan</option>
              <option value="Amanda">Amanda</option>
              <option value="Ian">Ian</option>
            </select>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Stakeholder</th>
                  <th>Category</th>
                  <th>Tier</th>
                  <th>Owned By</th>
                  <th>Main Contact (YMCA)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(s => (
                  <tr key={s.id} onClick={() => openModal(s)}>
                    <td>
                      <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{s.name}</div>
                      <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{s.role || s.organisation}</div>
                    </td>
                    <td>{s.category}</td>
                    <td>{getTierBadge(s.tier)}</td>
                    <td>
                      {s.owned_by === 'Unassigned' ? (
                        <span style={{color: 'var(--tier-4)', fontSize: '0.9rem'}}>Unassigned</span>
                      ) : (
                        <span style={{color: 'var(--tier-2)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <ShieldCheck size={14} /> {s.owned_by}
                        </span>
                      )}
                    </td>
                    <td style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{s.main_contact || '-'}</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
                      No stakeholders found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <StakeholderModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        stakeholder={selectedStakeholder} 
      />
    </>
  );
}
