export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId?: string;
  status: string;
  initials: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  createdAt: string;
}

export async function fetchAllPlatformUsers(): Promise<PlatformUser[]> {
  try {
    const res = await fetch('/api/all-users');
    if (!res.ok) return [];
    const data = await res.json();
    if (data.success && Array.isArray(data.users)) {
      return data.users;
    }
  } catch (err) {
    console.error('Failed to fetch platform users:', err);
  }
  return [];
}

export async function deletePlatformUser(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/all-users?id=${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    });
    const data = await res.json().catch(() => ({}));
    return !!data.success;
  } catch (err) {
    console.error('Failed to delete platform user:', err);
    return false;
  }
}

export async function updatePlatformUserStatus(userId: string, status: string): Promise<boolean> {
  try {
    const res = await fetch('/api/all-users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, status })
    });
    const data = await res.json().catch(() => ({}));
    return !!data.success;
  } catch (err) {
    console.error('Failed to update platform user status:', err);
    return false;
  }
}
