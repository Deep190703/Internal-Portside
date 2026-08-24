import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, KeyRound, ExternalLink, 
  ShieldAlert, Clock, AlertTriangle, X, 
  Filter, UserCheck, BarChart3, RefreshCw
} from 'lucide-react';
import type { Tenant, AccountType } from '../types';
import { fetchTenants, createTenantInDb, updateAccountTypeInDb, resetPasswordInDb } from '../api/tenantsApi';

export const InternalPortsideDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountTypeFilter, setAccountTypeFilter] = useState<'All' | AccountType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

  // Reset password modal state
  const [resetModalTenant, setResetModalTenant] = useState<Tenant | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // Provisioning form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('Live');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tenants on mount
  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (err) {
      console.error('Error loading tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // Filtered tenant list
  const filteredTenants = tenants.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = t.name.toLowerCase().includes(q) || 
                         t.slug.toLowerCase().includes(q) || 
                         (t.primaryAdminEmail && t.primaryAdminEmail.toLowerCase().includes(q));
    const matchesAccountType = accountTypeFilter === 'All' || t.accountType === accountTypeFilter;
    return matchesQuery && matchesAccountType;
  });

  // Calculate executive KPI counts
  const totalTenants = tenants.length;
  const liveCount = tenants.filter(t => t.accountType === 'Live').length;
  const onboardingCount = tenants.filter(t => t.accountType === 'Onboarding In Progress').length;
  const demoCount = tenants.filter(t => t.accountType === 'Demo').length;
  const churnedCount = tenants.filter(t => t.accountType === 'Churned').length;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !adminEmail) return;

    setIsSubmitting(true);
    try {
      const created = await createTenantInDb({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        domain: domain || `${slug || 'tenant'}.portside.app`,
        accountType,
        adminName: adminName || 'System Admin',
        adminEmail,
        adminPassword: adminPassword || 'AdminPass123!'
      });

      setTenants(prev => [created, ...prev]);
      setIsProvisionModalOpen(false);

      // Reset form
      setName('');
      setSlug('');
      setDomain('');
      setAccountType('Live');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
    } catch (err) {
      console.error('Failed to provision tenant:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeAccountType = async (tenantId: string, newType: AccountType) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, accountType: newType } : t));
    await updateAccountTypeInDb(tenantId, newType);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !resetModalTenant) return;
    await resetPasswordInDb(resetModalTenant.id, newPassword);
    setResetSuccessMsg(`Password successfully updated for System Admin (${resetModalTenant.primaryAdminEmail})!`);
    setTimeout(() => {
      setResetModalTenant(null);
      setNewPassword('');
      setResetSuccessMsg('');
    }, 1800);
  };

  return (
    <div className="internal-portside-view" style={{ padding: '32px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              backgroundColor: '#0F172A', 
              color: '#38BDF8', 
              padding: '6px 12px', 
              borderRadius: '8px', 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              fontSize: '13px'
            }}>
              <ShieldAlert size={16} color="#38BDF8" />
              <span>INTERNAL PORTSIDE</span>
            </div>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
              Super-Admin Operations & Multi-Tenant Management Platform
            </span>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', marginTop: '8px', letterSpacing: '-0.02em' }}>
            Tenant Provisioning & System Admin Directory
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={loadTenants}
            title="Refresh database"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Sync DB</span>
          </button>

          <button
            type="button"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(79,70,229,0.25)'
            }}
            onClick={() => setIsProvisionModalOpen(true)}
          >
            <Plus size={18} />
            <span>Provision New Tenant</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Metrics Cards Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Tenants</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>{totalTenants}</div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>Active database schemas</div>
        </div>

        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
            <span>Live Accounts</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#14532D', marginTop: '6px' }}>{liveCount}</div>
          <div style={{ fontSize: '11.5px', color: '#15803D', marginTop: '4px' }}>Active production tenants</div>
        </div>

        <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} color="#2563EB" />
            <span>Onboarding In Progress</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#1E3A8A', marginTop: '6px' }}>{onboardingCount}</div>
          <div style={{ fontSize: '11.5px', color: '#2563EB', marginTop: '4px' }}>Catalogue setup stage</div>
        </div>

        <div style={{ backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#5B21B6', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart3 size={13} color="#7C3AED" />
            <span>Demo Accounts</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#4C1D95', marginTop: '6px' }}>{demoCount}</div>
          <div style={{ fontSize: '11.5px', color: '#6D28D9', marginTop: '4px' }}>Sales evaluation trials</div>
        </div>

        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={13} color="#EF4444" />
            <span>Churned</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#7F1D1D', marginTop: '6px' }}>{churnedCount}</div>
          <div style={{ fontSize: '11.5px', color: '#B91C1C', marginTop: '4px' }}>Cancelled subscriptions</div>
        </div>
      </div>

      {/* Main Directory Filter Bar & Table Container */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        {/* Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {/* Account Type Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B', marginRight: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={14} />
              <span>Account Type:</span>
            </span>

            {(['All', 'Live', 'Onboarding In Progress', 'Demo', 'Churned'] as const).map((typeVal) => {
              const isSelected = accountTypeFilter === typeVal;
              return (
                <button
                  key={typeVal}
                  type="button"
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: isSelected ? 800 : 500,
                    border: isSelected ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#4F46E5' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setAccountTypeFilter(typeVal)}
                >
                  {typeVal}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by tenant name, slug, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Tenants Directory Table */}
        <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Tenant Name & Domain</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Account Type Column</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Primary System Admin</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Products</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Users</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Created Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Super-Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                    {loading ? 'Loading tenants from database...' : 'No tenants found matching your filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => {
                  const getAccountTypeBadge = (accType: AccountType) => {
                    switch (accType) {
                      case 'Live':
                        return { bg: '#DCFCE7', color: '#15803D' };
                      case 'Onboarding In Progress':
                        return { bg: '#DBEAFE', color: '#1E40AF' };
                      case 'Demo':
                        return { bg: '#F3E8FF', color: '#6B21A8' };
                      case 'Churned':
                        return { bg: '#FEE2E2', color: '#B91C1C' };
                      default:
                        return { bg: '#F1F5F9', color: '#475569' };
                    }
                  };

                  const badge = getAccountTypeBadge(t.accountType);

                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}>
                      {/* Tenant Name & Domain */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '8px', 
                            backgroundColor: '#EEF2FF', 
                            color: '#4F46E5', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 800,
                            flexShrink: 0
                          }}>
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>{t.name}</div>
                            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', fontFamily: 'monospace' }}>
                              slug: <strong>{t.slug}</strong> • {t.domain}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Account Type Column Dropdown Switcher */}
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          value={t.accountType}
                          onChange={(e) => handleChangeAccountType(t.id, e.target.value as AccountType)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Live">🟢 Live</option>
                          <option value="Onboarding In Progress">🔵 Onboarding In Progress</option>
                          <option value="Demo">🟣 Demo</option>
                          <option value="Churned">🔴 Churned</option>
                        </select>
                      </td>

                      {/* Primary System Admin */}
                      <td style={{ padding: '14px 16px' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UserCheck size={14} color="#4F46E5" />
                            <span>{t.primaryAdminName || 'System Admin'}</span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', fontFamily: 'monospace' }}>
                            {t.primaryAdminEmail}
                          </div>
                        </div>
                      </td>

                      {/* Products Count */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                        {t.productsCount || 0}
                      </td>

                      {/* Users Count */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                        {t.usersCount || 1}
                      </td>

                      {/* Created Date */}
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '12px' }}>
                        {t.createdAt}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#334155',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Reset System Admin Password"
                            onClick={() => setResetModalTenant(t)}
                          >
                            <KeyRound size={13} color="#475569" />
                            <span>Set Password</span>
                          </button>

                          <button
                            type="button"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #C7D2FE',
                              backgroundColor: '#EEF2FF',
                              color: '#4F46E5',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Launch Tenant Workspace"
                          >
                            <ExternalLink size={13} />
                            <span>Launch</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PROVISION NEW TENANT MODAL ── */}
      {isProvisionModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProvisionModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div>
                <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: 800 }}>Provision New Tenant Account</h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Create tenant organization and insert system_admin into PostgreSQL database.
                </p>
              </div>
              <button className="icon-btn-xs" onClick={() => setIsProvisionModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProvisionTenant} style={{ marginTop: '16px' }}>
              {/* Section 1: Tenant Information */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} color="#4F46E5" />
                  <span>Tenant Organization Details</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Tenant Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. FabIndia B2B Catalogue"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Tenant Slug Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="fabindia-b2b"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Account Type Column</label>
                    <select
                      className="form-select"
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value as AccountType)}
                    >
                      <option value="Live">🟢 Live</option>
                      <option value="Onboarding In Progress">🔵 Onboarding In Progress</option>
                      <option value="Demo">🟣 Demo</option>
                      <option value="Churned">🔴 Churned</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label className="form-label">Custom Subdomain / Domain</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="b2b.fabindia.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>
              </div>

              {/* Section 2: First System Admin Credentials */}
              <div style={{ backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E1B4B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={16} color="#4F46E5" />
                  <span>First System Admin Credentials (system_admin)</span>
                </div>

                <div className="form-group">
                  <label className="form-label">System Admin Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rohan Mehra"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">System Admin Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="admin@fabindia.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Set Admin Initial Password</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Set Password..."
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-footer" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsProvisionModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Writing to Database...' : 'Provision Tenant & Create System Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RESET SYSTEM ADMIN PASSWORD MODAL ── */}
      {resetModalTenant && (
        <div className="modal-overlay" onClick={() => setResetModalTenant(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Set System Admin Password</h3>
              <button className="icon-btn-xs" onClick={() => setResetModalTenant(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>
                Updating initial login password for <strong>{resetModalTenant.name}</strong> ({resetModalTenant.primaryAdminEmail}):
              </div>

              <div className="form-group">
                <label className="form-label">New System Admin Password</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              {resetSuccessMsg && (
                <div style={{ padding: '10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', borderRadius: '6px', fontSize: '12.5px', marginTop: '10px' }}>
                  {resetSuccessMsg}
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: '18px' }}>
                <button type="button" className="btn-secondary" onClick={() => setResetModalTenant(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update System Admin Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
