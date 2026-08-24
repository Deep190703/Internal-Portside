import React from 'react';
import { TrendingUp, Clock, AlertTriangle, PieChart } from 'lucide-react';

export const AccountAnalyticsPage: React.FC = () => {
  return (
    <div style={{ padding: '32px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          INTERNAL PORTSIDE • ANALYTICS
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', marginTop: '4px' }}>
          Account Type Breakdown & Lifecycle Metrics
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
          Comprehensive SaaS distribution analytics querying Live, Onboarding In Progress, Demo, and Churned accounts.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
            <span>Live Account Rate</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', marginTop: '8px' }}>25.0%</div>
          <div style={{ fontSize: '12px', color: '#15803D', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} />
            <span>1 Production Tenant Active</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="#2563EB" />
            <span>Onboarding Pipeline</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', marginTop: '8px' }}>25.0%</div>
          <div style={{ fontSize: '12px', color: '#2563EB', marginTop: '4px' }}>
            1 Tenant setting up catalogue
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PieChart size={14} color="#7C3AED" />
            <span>Demo Conversion Trial</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', marginTop: '8px' }}>25.0%</div>
          <div style={{ fontSize: '12px', color: '#6D28D9', marginTop: '4px' }}>
            1 Demo evaluation account
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} color="#EF4444" />
            <span>Churn Rate</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', marginTop: '8px' }}>25.0%</div>
          <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '4px' }}>
            1 Churned account archived
          </div>
        </div>
      </div>

      {/* Account Type Distribution Progress Bars */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
          Account Type Query Distribution
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ color: '#166534' }}>🟢 Live Accounts</span>
              <span>1 / 4 Tenants (25%)</span>
            </div>
            <div style={{ height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '25%', backgroundColor: '#22C55E' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ color: '#1E40AF' }}>🔵 Onboarding In Progress</span>
              <span>1 / 4 Tenants (25%)</span>
            </div>
            <div style={{ height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '25%', backgroundColor: '#3B82F6' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ color: '#6B21A8' }}>🟣 Demo Accounts</span>
              <span>1 / 4 Tenants (25%)</span>
            </div>
            <div style={{ height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '25%', backgroundColor: '#8B5CF6' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ color: '#991B1B' }}>🔴 Churned Accounts</span>
              <span>1 / 4 Tenants (25%)</span>
            </div>
            <div style={{ height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '25%', backgroundColor: '#EF4444' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
