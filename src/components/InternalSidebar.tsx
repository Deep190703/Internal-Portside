import React from 'react';
import { useLocation } from 'wouter';
import { 
  ShieldAlert, Building2, BarChart3, Users, Settings
} from 'lucide-react';

export const InternalSidebar: React.FC = () => {
  const [location, setLocation] = useLocation();

  const getActiveItem = () => {
    if (location.includes('/users')) return 'users';
    if (location.includes('/analytics')) return 'analytics';
    if (location.includes('/team')) return 'team';
    if (location.includes('/settings')) return 'settings';
    return 'tenants';
  };

  const activeItem = getActiveItem();

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      borderRight: '1px solid #1E293B',
      fontFamily: 'Inter, sans-serif',
      flexShrink: 0
    }}>
      <div>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 24px', borderBottom: '1px solid #1E293B' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#38BDF8',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900
          }}>
            <ShieldAlert size={20} />
          </div>

          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              INTERNAL PORTSIDE
            </div>
            <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Super-Admin Platform
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 8px' }}>
            OPERATIONS
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>
              <button
                type="button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeItem === 'tenants' ? '#1E293B' : 'transparent',
                  color: activeItem === 'tenants' ? '#38BDF8' : '#94A3B8',
                  fontWeight: activeItem === 'tenants' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => setLocation('/')}
              >
                <Building2 size={18} color={activeItem === 'tenants' ? '#38BDF8' : '#64748B'} />
                <span>Tenants Directory</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeItem === 'users' ? '#1E293B' : 'transparent',
                  color: activeItem === 'users' ? '#38BDF8' : '#94A3B8',
                  fontWeight: activeItem === 'users' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => setLocation('/users')}
              >
                <Users size={18} color={activeItem === 'users' ? '#38BDF8' : '#64748B'} />
                <span>User Directory</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeItem === 'analytics' ? '#1E293B' : 'transparent',
                  color: activeItem === 'analytics' ? '#38BDF8' : '#94A3B8',
                  fontWeight: activeItem === 'analytics' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => setLocation('/analytics')}
              >
                <BarChart3 size={18} color={activeItem === 'analytics' ? '#38BDF8' : '#64748B'} />
                <span>Account Type Analytics</span>
              </button>
            </li>
          </ul>
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 8px' }}>
            ADMINISTRATION
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>
              <button
                type="button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeItem === 'team' ? '#1E293B' : 'transparent',
                  color: activeItem === 'team' ? '#38BDF8' : '#94A3B8',
                  fontWeight: activeItem === 'team' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => setLocation('/team')}
              >
                <Users size={18} color={activeItem === 'team' ? '#38BDF8' : '#64748B'} />
                <span>Internal Team Members</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeItem === 'settings' ? '#1E293B' : 'transparent',
                  color: activeItem === 'settings' ? '#38BDF8' : '#94A3B8',
                  fontWeight: activeItem === 'settings' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => setLocation('/settings')}
              >
                <Settings size={18} color={activeItem === 'settings' ? '#38BDF8' : '#64748B'} />
                <span>Global Platform Config</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Internal User Profile Footer */}
      <div>
        <div style={{ 
          backgroundColor: '#1E293B', 
          borderRadius: '10px', 
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#38BDF8',
            color: '#0F172A',
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            IO
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Portside Ops Team
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              super_admin@portside.app
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
