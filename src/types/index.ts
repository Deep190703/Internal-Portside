export type UserRole = 'SYSTEM_ADMIN' | 'ADMIN' | 'STORE_MANAGER' | 'SALES_REP' | 'CUSTOMER_USER';
export type AccountType = 'Live' | 'Onboarding In Progress' | 'Demo' | 'Churned';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  accountType: AccountType;
  status: 'Active' | 'Suspended' | 'Archived';
  primaryAdminEmail?: string;
  primaryAdminName?: string;
  productsCount?: number;
  usersCount?: number;
  createdAt?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
}
