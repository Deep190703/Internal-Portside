import { PrismaClient, AccountType } from '@prisma/client';

const prisma = new PrismaClient();

const mapAccountTypeToPrisma = (type: string): AccountType => {
  switch (type) {
    case 'Live':
      return 'LIVE';
    case 'Onboarding In Progress':
      return 'ONBOARDING_IN_PROGRESS';
    case 'Demo':
      return 'DEMO';
    case 'Churned':
      return 'CHURNED';
    default:
      return 'LIVE';
  }
};

const mapAccountTypeFromPrisma = (type: AccountType): string => {
  switch (type) {
    case 'LIVE':
      return 'Live';
    case 'ONBOARDING_IN_PROGRESS':
      return 'Onboarding In Progress';
    case 'DEMO':
      return 'Demo';
    case 'CHURNED':
      return 'Churned';
    default:
      return 'Live';
  }
};

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET /api/tenants — Fetch all tenants from PostgreSQL database
    if (req.method === 'GET') {
      const dbTenants = await prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { products: true, userMaps: true }
          }
        }
      });

      const formatted = dbTenants.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        domain: t.domain || `${t.slug}.portside.app`,
        accountType: mapAccountTypeFromPrisma(t.accountType),
        status: t.status,
        primaryAdminEmail: t.primaryAdminEmail || 'admin@portside.app',
        primaryAdminName: 'System Admin',
        productsCount: t._count.products,
        usersCount: t._count.userMaps || 1,
        createdAt: t.createdAt.toISOString().split('T')[0]
      }));

      return res.status(200).json({ success: true, tenants: formatted });
    }

    // POST /api/tenants — Provision a new Tenant in PostgreSQL
    if (req.method === 'POST') {
      const { name, slug, domain, accountType, adminName, adminEmail, adminPassword } = req.body || {};

      if (!name || !slug) {
        return res.status(400).json({ success: false, error: 'Tenant Name and Slug are required.' });
      }

      // Check if tenant slug already exists
      const existing = await prisma.tenant.findUnique({ where: { slug } });
      if (existing) {
        return res.status(400).json({ success: false, error: `Tenant slug '${slug}' already exists in database.` });
      }

      const prismaAccType = mapAccountTypeToPrisma(accountType || 'Live');

      // Execute transaction to insert Tenant, System Admin User, and UserTenantMap into PostgreSQL
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create Tenant row
        const newTenant = await tx.tenant.create({
          data: {
            name,
            slug,
            domain: domain || `${slug}.portside.app`,
            accountType: prismaAccType,
            status: 'Active',
            primaryAdminEmail: adminEmail || `admin@${slug}.com`
          }
        });

        // 2. Create or find System Admin User
        let user = await tx.user.findUnique({
          where: { email: adminEmail || `admin@${slug}.com` }
        });

        if (!user) {
          user = await tx.user.create({
            data: {
              email: adminEmail || `admin@${slug}.com`,
              fullName: adminName || 'System Admin',
              passwordHash: adminPassword || 'AdminPass123!',
              role: 'SYSTEM_ADMIN'
            }
          });
        }

        // 3. Create UserTenantMap link
        await tx.userTenantMap.create({
          data: {
            userId: user.id,
            tenantId: newTenant.id,
            role: 'SYSTEM_ADMIN'
          }
        });

        return newTenant;
      });

      return res.status(201).json({
        success: true,
        tenant: {
          id: result.id,
          name: result.name,
          slug: result.slug,
          domain: result.domain,
          accountType: mapAccountTypeFromPrisma(result.accountType),
          status: result.status,
          primaryAdminEmail: result.primaryAdminEmail,
          primaryAdminName: adminName || 'System Admin',
          productsCount: 0,
          usersCount: 1,
          createdAt: result.createdAt.toISOString().split('T')[0]
        }
      });
    }

    // PATCH /api/tenants — Update Account Type or Reset Password in PostgreSQL
    if (req.method === 'PATCH') {
      const { tenantId, accountType, newPassword } = req.body || {};

      if (!tenantId) {
        return res.status(400).json({ success: false, error: 'Tenant ID required.' });
      }

      if (accountType) {
        const updated = await prisma.tenant.update({
          where: { id: tenantId },
          data: { accountType: mapAccountTypeToPrisma(accountType) }
        });
        return res.status(200).json({ success: true, tenant: updated });
      }

      if (newPassword) {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (tenant && tenant.primaryAdminEmail) {
          await prisma.user.updateMany({
            where: { email: tenant.primaryAdminEmail },
            data: { passwordHash: newPassword }
          });
        }
        return res.status(200).json({ success: true, message: 'Password updated successfully.' });
      }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
}
