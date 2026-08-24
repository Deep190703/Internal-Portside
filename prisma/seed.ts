import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial tenants into PostgreSQL Neon database...');

  const initialTenants = [
    {
      name: 'Tenant 1',
      slug: 't',
      domain: 't.com',
      accountType: 'ONBOARDING_IN_PROGRESS' as const,
      status: 'Active',
      primaryAdminEmail: 't@port.com'
    },
    {
      name: 'Aarav Exports',
      slug: 'aarav-exports',
      domain: 'aaravexports.portside.app',
      accountType: 'LIVE' as const,
      status: 'Active',
      primaryAdminEmail: 'aarav@aaravexports.com'
    },
    {
      name: 'Jaipur Home Crafts',
      slug: 'jaipur-crafts',
      domain: 'jaipurcrafts.portside.app',
      accountType: 'ONBOARDING_IN_PROGRESS' as const,
      status: 'Active',
      primaryAdminEmail: 'priya@jaipurcrafts.com'
    },
    {
      name: 'FabIndia B2B Catalogue',
      slug: 'fabindia-b2b',
      domain: 'b2b.fabindia.com',
      accountType: 'DEMO' as const,
      status: 'Active',
      primaryAdminEmail: 'demo@fabindia.com'
    },
    {
      name: 'Vintage Decor Global',
      slug: 'vintage-decor',
      domain: 'vintagedecor.portside.app',
      accountType: 'CHURNED' as const,
      status: 'Suspended',
      primaryAdminEmail: 'support@vintagedecor.com'
    }
  ];

  for (const t of initialTenants) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        accountType: t.accountType,
        domain: t.domain,
        primaryAdminEmail: t.primaryAdminEmail
      },
      create: t
    });

    const user = await prisma.user.upsert({
      where: { email: t.primaryAdminEmail },
      update: { fullName: `${t.name} Admin` },
      create: {
        email: t.primaryAdminEmail,
        fullName: `${t.name} Admin`,
        passwordHash: 'AdminPass123!',
        role: 'SYSTEM_ADMIN'
      }
    });

    await prisma.userTenantMap.upsert({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId: tenant.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        tenantId: tenant.id,
        role: 'SYSTEM_ADMIN'
      }
    });

    console.log(`✓ Tenant '${tenant.name}' (${tenant.slug}) synced to PostgreSQL!`);
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
