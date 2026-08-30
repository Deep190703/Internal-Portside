import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mapAccountTypeToPrisma = (type: string) => {
  switch (type) {
    case 'Live': return 'LIVE';
    case 'Onboarding In Progress': return 'ONBOARDING_IN_PROGRESS';
    case 'Demo': return 'DEMO';
    case 'Churned': return 'CHURNED';
    default: return 'LIVE';
  }
};

const mapAccountTypeFromPrisma = (type: string) => {
  switch (type) {
    case 'LIVE': return 'Live';
    case 'ONBOARDING_IN_PROGRESS': return 'Onboarding In Progress';
    case 'DEMO': return 'Demo';
    case 'CHURNED': return 'Churned';
    default: return 'Live';
  }
};

function expressApiMiddleware() {
  return {
    name: 'express-api-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/all-users')) {
          res.setHeader('Content-Type', 'application/json');
          try {
            if (req.method === 'GET') {
              const dbUsers = await prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                  customRole: true,
                  tenantMaps: { include: { tenant: true } }
                }
              });

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
                  initials: (u.fullName || u.email).slice(0, 2).toUpperCase(),
                  tenantId: tenantObj?.id || 'default-tenant',
                  tenantName: tenantObj?.name || 'Aarav Exports',
                  tenantSlug: tenantObj?.slug || 'aarav-exports',
                  createdAt: u.createdAt.toISOString().split('T')[0]
                };
              });

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, users: formatted }));
              return;
            }

            if (req.method === 'DELETE') {
              const url = new URL(req.url, `http://${req.headers.host}`);
              const id = url.searchParams.get('id');
              if (id) {
                await prisma.user.delete({ where: { id } });
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, message: 'User deleted' }));
              return;
            }

            if (req.method === 'PATCH') {
              let body = '';
              for await (const chunk of req) { body += chunk; }
              const data = JSON.parse(body || '{}');
              const { id, status } = data;
              if (id && status) {
                await prisma.user.update({ where: { id }, data: { status } });
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, message: 'Updated' }));
              return;
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
            return;
          }
        }

        if (!req.url?.startsWith('/api/tenants')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        try {
          if (req.method === 'GET') {
            const dbTenants = await prisma.tenant.findMany({
              orderBy: { createdAt: 'desc' },
              include: {
                _count: { select: { products: true, userMaps: true } }
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

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, tenants: formatted }));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const data = JSON.parse(body || '{}');
            const { name, slug, domain, accountType, adminName, adminEmail, adminPassword } = data;

            if (!name || !slug) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'Tenant Name and Slug are required.' }));
              return;
            }

            const prismaAccType = mapAccountTypeToPrisma(accountType || 'Live') as any;

            const result = await prisma.$transaction(async (tx) => {
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

              await tx.userTenantMap.create({
                data: {
                  userId: user.id,
                  tenantId: newTenant.id,
                  role: 'SYSTEM_ADMIN'
                }
              });

              return newTenant;
            });

            console.log(`\n[PostgreSQL DB] Successfully created Tenant '${result.name}' (slug: ${result.slug}) in Neon DB!\n`);

            res.statusCode = 201;
            res.end(JSON.stringify({
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
            }));
            return;
          }

          if (req.method === 'PATCH') {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const data = JSON.parse(body || '{}');
            const { tenantId, accountType, newPassword } = data;

            if (!tenantId) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'Tenant ID required' }));
              return;
            }

            if (accountType) {
              const updated = await prisma.tenant.update({
                where: { id: tenantId },
                data: { accountType: mapAccountTypeToPrisma(accountType) as any }
              });
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, tenant: updated }));
              return;
            }

            if (newPassword) {
              const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
              if (tenant && tenant.primaryAdminEmail) {
                await prisma.user.updateMany({
                  where: { email: tenant.primaryAdminEmail },
                  data: { passwordHash: newPassword }
                });
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, message: 'Password updated' }));
              return;
            }
          }

          next();
        } catch (err: any) {
          console.error('[API Middleware Error]:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), expressApiMiddleware()],
});
