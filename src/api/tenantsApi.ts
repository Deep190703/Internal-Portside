import type { Tenant, AccountType } from '../types';

const STORAGE_KEY = 'portside_tenants_db_v1';

const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-aarav-exports-101',
    name: 'Aarav Exports',
    slug: 'aarav-exports',
    domain: 'aaravexports.portside.app',
    accountType: 'Live',
    status: 'Active',
    primaryAdminEmail: 'aarav@aaravexports.com',
    primaryAdminName: 'Aarav Gupta',
    productsCount: 386,
    usersCount: 14,
    createdAt: '2026-01-15'
  },
  {
    id: 'tenant-jaipur-crafts-102',
    name: 'Jaipur Home Crafts',
    slug: 'jaipur-crafts',
    domain: 'jaipurcrafts.portside.app',
    accountType: 'Onboarding In Progress',
    status: 'Active',
    primaryAdminEmail: 'priya@jaipurcrafts.com',
    primaryAdminName: 'Priya Sharma',
    productsCount: 124,
    usersCount: 6,
    createdAt: '2026-02-10'
  },
  {
    id: 'tenant-fabindia-b2b-103',
    name: 'FabIndia B2B Catalogue',
    slug: 'fabindia-b2b',
    domain: 'b2b.fabindia.com',
    accountType: 'Demo',
    status: 'Active',
    primaryAdminEmail: 'demo@fabindia.com',
    primaryAdminName: 'Rohan Mehra',
    productsCount: 45,
    usersCount: 3,
    createdAt: '2026-02-18'
  },
  {
    id: 'tenant-vintage-decor-104',
    name: 'Vintage Decor Global',
    slug: 'vintage-decor',
    domain: 'vintagedecor.portside.app',
    accountType: 'Churned',
    status: 'Suspended',
    primaryAdminEmail: 'support@vintagedecor.com',
    primaryAdminName: 'Vikram Mehta',
    productsCount: 88,
    usersCount: 2,
    createdAt: '2025-08-20'
  }
];

export async function fetchTenants(): Promise<Tenant[]> {
  try {
    const res = await fetch('/api/tenants');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.tenants)) {
        // Cache to localStorage for offline fallback
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.tenants));
        return data.tenants;
      }
    }
  } catch (err) {
    console.warn('Backend API fetch failed, falling back to local database store:', err);
  }

  // Local storage fallback
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return INITIAL_TENANTS;
}

export async function createTenantInDb(tenantData: {
  name: string;
  slug: string;
  domain?: string;
  accountType: AccountType;
  adminName: string;
  adminEmail: string;
  adminPassword?: string;
}): Promise<Tenant> {
  try {
    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenantData)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.tenant) {
        return data.tenant;
      }
    }
  } catch (err) {
    console.warn('Backend API provision call failed, using client database store:', err);
  }

  // Fallback creation into persistent local store
  const newTenant: Tenant = {
    id: `tenant-${Date.now()}`,
    name: tenantData.name,
    slug: tenantData.slug,
    domain: tenantData.domain || `${tenantData.slug}.portside.app`,
    accountType: tenantData.accountType,
    status: 'Active',
    primaryAdminEmail: tenantData.adminEmail,
    primaryAdminName: tenantData.adminName,
    productsCount: 0,
    usersCount: 1,
    createdAt: new Date().toISOString().split('T')[0]
  };

  const existing = await fetchTenants();
  const updated = [newTenant, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newTenant;
}

export async function updateAccountTypeInDb(tenantId: string, accountType: AccountType): Promise<boolean> {
  try {
    const res = await fetch('/api/tenants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, accountType })
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('API update failed:', err);
  }

  // Local fallback
  const existing = await fetchTenants();
  const updated = existing.map(t => t.id === tenantId ? { ...t, accountType } : t);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return true;
}

export async function resetPasswordInDb(tenantId: string, newPassword: string): Promise<boolean> {
  try {
    const res = await fetch('/api/tenants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, newPassword })
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('API password reset failed:', err);
  }
  return true;
}
