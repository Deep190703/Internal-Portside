import type { Tenant, AccountType } from '../types';

export async function fetchTenants(): Promise<Tenant[]> {
  const res = await fetch('/api/tenants');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch tenants (${res.status})`);
  }
  const data = await res.json();
  if (data.success && Array.isArray(data.tenants)) {
    return data.tenants;
  }
  return [];
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
  const res = await fetch('/api/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tenantData)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create tenant in database.');
  }

  return data.tenant;
}

export async function updateAccountTypeInDb(tenantId: string, accountType: AccountType): Promise<boolean> {
  const res = await fetch('/api/tenants', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, accountType })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update account type.');
  }
  return true;
}

export async function resetPasswordInDb(tenantId: string, newPassword: string): Promise<boolean> {
  const res = await fetch('/api/tenants', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, newPassword })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update password.');
  }
  return true;
}
