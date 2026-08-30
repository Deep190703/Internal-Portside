import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getInitials(name: string): string {
  if (!name) return 'US';
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1 && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET /api/all-users — List all platform users across all tenants
    if (req.method === 'GET') {
      const dbUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          customRole: true,
          tenantMaps: {
            include: {
              tenant: true
            }
          }
        }
      });

      // Also fetch default tenant for users without explicit UserTenantMap
      const defaultTenant = await prisma.tenant.findFirst({ where: { slug: 'aarav-exports' } });

      const formatted = dbUsers.map(u => {
        const primaryMap = u.tenantMaps?.[0];
        const tenantObj = primaryMap?.tenant || defaultTenant;

        return {
          id: u.id,
          name: u.fullName || 'User',
          email: u.email,
          role: u.customRole?.name || (u.role === 'ADMIN' ? 'Admin' : u.role === 'SYSTEM_ADMIN' ? 'System Admin' : 'Store Manager'),
          roleId: u.roleId,
          status: u.status || 'Active',
          initials: getInitials(u.fullName || u.email),
          tenantId: tenantObj?.id || 'default-tenant',
          tenantName: tenantObj?.name || 'Aarav Exports',
          tenantSlug: tenantObj?.slug || 'aarav-exports',
          createdAt: u.createdAt.toISOString().split('T')[0]
        };
      });

      return res.status(200).json({ success: true, users: formatted });
    }

    // PATCH /api/all-users — Update user status or role
    if (req.method === 'PATCH') {
      const { id, status, role, password } = req.body || {};
      if (!id) {
        return res.status(400).json({ success: false, error: 'User ID is required.' });
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (password) updateData.passwordHash = password;

      const updated = await prisma.user.update({
        where: { id },
        data: updateData
      });

      return res.status(200).json({ success: true, user: updated });
    }

    // DELETE /api/all-users — Permanently delete a user
    if (req.method === 'DELETE') {
      const id = req.query?.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ success: false, error: 'User ID is required.' });
      }

      await prisma.user.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'User deleted successfully.' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error /api/all-users:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
}
