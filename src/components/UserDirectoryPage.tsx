import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserCheck, UserX, Building2, Search, RefreshCw, Trash2, AlertCircle
} from 'lucide-react';
import { fetchAllPlatformUsers, deletePlatformUser, updatePlatformUserStatus, type PlatformUser } from '../api/usersApi';

export const UserDirectoryPage: React.FC = () => {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllPlatformUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metric counts
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === 'Active').length;
  const invitedUsersCount = users.filter(u => u.status === 'Invited').length;
  const uniqueTenantsCount = useMemo(() => {
    const tenantSet = new Set(users.map(u => u.tenantSlug));
    return tenantSet.size;
  }, [users]);

  // Extract unique tenant names for dropdown filter
  const tenantOptions = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach(u => {
      if (u.tenantSlug && u.tenantName) {
        map.set(u.tenantSlug, u.tenantName);
      }
    });
    return Array.from(map.entries());
  }, [users]);

  // Extract unique roles for dropdown filter
  const roleOptions = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => { if (u.role) set.add(u.role); });
    return Array.from(set);
  }, [users]);

  // Filter users based on search and dropdown selections
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search text match
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.tenantName.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q)
      );

      // Tenant match
      const matchesTenant = selectedTenant === 'ALL' || user.tenantSlug === selectedTenant;

      // Role match
      const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;

      // Status match
      const matchesStatus = selectedStatus === 'ALL' || user.status === selectedStatus;

      return matchesSearch && matchesTenant && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedTenant, selectedRole, selectedStatus]);

  // Handle user status toggle
  const handleToggleStatus = async (user: PlatformUser) => {
    const nextStatus = user.status === 'Active' ? 'Deactivated' : 'Active';
    const confirmMsg = `Are you sure you want to change status for '${user.name}' to ${nextStatus}?`;
    if (!confirm(confirmMsg)) return;

    const ok = await updatePlatformUserStatus(user.id, nextStatus);
    if (ok) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    } else {
      alert('Failed to update user status.');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (user: PlatformUser) => {
    const confirmMsg = `Are you sure you want to permanently delete user '${user.name}' (${user.email})? This action cannot be undone.`;
    if (!confirm(confirmMsg)) return;

    const ok = await deletePlatformUser(user.id);
    if (ok) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      alert('Failed to delete user.');
    }
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#0F172A' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: '#0F172A' }}>
              Global User Directory
            </h1>
            <span style={{
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
              fontSize: '12px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Cross-Tenant View
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748B' }}>
            Inspect, manage, and audit all user accounts across all tenant organizations in PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            borderRadius: '9px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: '#334155',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.15s ease'
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Metric Cards Grid (4 KPI Widgets) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Total Users */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Users
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#475569" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', lineHeight: '1' }}>
            {totalUsersCount}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
            Registered platform accounts
          </div>
        </div>

        {/* Active Accounts */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Users
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={18} color="#166534" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#15803D', lineHeight: '1' }}>
            {activeUsersCount}
          </div>
          <div style={{ fontSize: '12px', color: '#166534', marginTop: '6px' }}>
            Active production members
          </div>
        </div>

        {/* Invited / Pending */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Invited / Pending
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={18} color="#B45309" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#D97706', lineHeight: '1' }}>
            {invitedUsersCount}
          </div>
          <div style={{ fontSize: '12px', color: '#B45309', marginTop: '6px' }}>
            Pending invitations
          </div>
        </div>

        {/* Unique Tenants */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tenants Represented
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color="#4338CA" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#3730A3', lineHeight: '1' }}>
            {uniqueTenantsCount}
          </div>
          <div style={{ fontSize: '12px', color: '#4338CA', marginTop: '6px' }}>
            Active organization accounts
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '14px 14px 0 0',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid #E2E8F0'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '400px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name, email, tenant, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
          />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Tenant Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Tenant:</span>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Tenants</option>
              {tenantOptions.map(([slug, name]) => (
                <option key={slug} value={slug}>{name}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Roles</option>
              {roleOptions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Invited">Invited</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div>Loading platform users from PostgreSQL...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
            <h3 style={{ margin: '0 0 4px', color: '#1E293B', fontSize: '16px' }}>No matching users found</h3>
            <p style={{ margin: 0, fontSize: '13px' }}>Try clearing filters or searching for a different user.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 20px' }}>User Name & Details</th>
                <th style={{ padding: '14px 20px' }}>Email Address</th>
                <th style={{ padding: '14px 20px' }}>Assigned Tenant</th>
                <th style={{ padding: '14px 20px' }}>Role</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px' }}>Created Date</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                const isActive = user.status === 'Active';
                const isInvited = user.status === 'Invited';

                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: idx === filteredUsers.length - 1 ? 'none' : '1px solid #F1F5F9',
                      transition: 'background-color 0.12s ease'
                    }}
                  >
                    {/* User Name & Initials */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? '#E0F2FE' : isInvited ? '#FEF3C7' : '#F1F5F9',
                          color: isActive ? '#0284C7' : isInvited ? '#D97706' : '#64748B',
                          fontWeight: 800,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {user.initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{user.name}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 20px', color: '#334155', fontWeight: 500 }}>
                      {user.email}
                    </td>

                    {/* Assigned Tenant */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={15} color="#0284C7" />
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{user.tenantName}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginLeft: '21px' }}>slug: {user.tenantSlug}</div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: user.role === 'Admin' || user.role === 'SYSTEM_ADMIN' ? '#EEF2FF' : '#F1F5F9',
                        color: user.role === 'Admin' || user.role === 'SYSTEM_ADMIN' ? '#4338CA' : '#475569'
                      }}>
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: isActive ? '#F0FDF4' : isInvited ? '#FEF3C7' : '#FEF2F2',
                        color: isActive ? '#15803D' : isInvited ? '#B45309' : '#991B1B'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? '#22C55E' : isInvited ? '#F59E0B' : '#EF4444'
                        }} />
                        <span>{user.status}</span>
                      </span>
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '12.5px' }}>
                      {user.createdAt}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {/* Toggle Status Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          title={isActive ? 'Deactivate user' : 'Reactivate user'}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: isActive ? '#D97706' : '#15803D',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>

                        {/* Delete User Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          title="Delete user"
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #FCA5A5',
                            backgroundColor: '#FEF2F2',
                            color: '#991B1B',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
