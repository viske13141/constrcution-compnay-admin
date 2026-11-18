import {
  ADMIN_PROFILE,
  INITIAL_ACTIVITIES,
  INITIAL_APPROVALS,
  INITIAL_ASSETS,
  INITIAL_ATTENDANCE,
  INITIAL_AUDIT_LOGS,
  INITIAL_BILLING_INVOICES,
  INITIAL_BRANCHES,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_COMPLIANCE_RULES,
  INITIAL_CONTRACTORS,
  INITIAL_DEPARTMENTS,
  INITIAL_DESIGNATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_FINANCIAL_RECORDS,
  INITIAL_INVENTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYROLL_RUNS,
  INITIAL_PROJECTS,
  INITIAL_PURCHASES,
  INITIAL_ROLES,
  INITIAL_SITES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SUPPLIERS,
} from '@/src/data/mockErpData';

/**
 * Modular ERP Service Layer
 * Designed as an adapter boundary so Supabase PostgreSQL, Auth, RLS, Realtime,
 * Cloudflare R2, and Capacitor native device bridges can replace simulated methods.
 */
export interface ErpSnapshot {
  branches: typeof INITIAL_BRANCHES;
  departments: typeof INITIAL_DEPARTMENTS;
  designations: typeof INITIAL_DESIGNATIONS;
  projects: typeof INITIAL_PROJECTS;
  sites: typeof INITIAL_SITES;
  employees: typeof INITIAL_EMPLOYEES;
  contractors: typeof INITIAL_CONTRACTORS;
  attendance: typeof INITIAL_ATTENDANCE;
  suppliers: typeof INITIAL_SUPPLIERS;
  purchases: typeof INITIAL_PURCHASES;
  inventory: typeof INITIAL_INVENTORY;
  stockMovements: typeof INITIAL_STOCK_MOVEMENTS;
  assets: typeof INITIAL_ASSETS;
  payrollRuns: typeof INITIAL_PAYROLL_RUNS;
  financialRecords: typeof INITIAL_FINANCIAL_RECORDS;
  approvals: typeof INITIAL_APPROVALS;
  roles: typeof INITIAL_ROLES;
  documents: typeof INITIAL_DOCUMENTS;
  complianceRules: typeof INITIAL_COMPLIANCE_RULES;
  billingInvoices: typeof INITIAL_BILLING_INVOICES;
  auditLogs: typeof INITIAL_AUDIT_LOGS;
  activities: typeof INITIAL_ACTIVITIES;
  notifications: typeof INITIAL_NOTIFICATIONS;
  settings: typeof INITIAL_COMPANY_SETTINGS;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const erpService = {
  async fetchBootstrapSnapshot(): Promise<ErpSnapshot> {
    await sleep(160);
    return {
      branches: INITIAL_BRANCHES,
      departments: INITIAL_DEPARTMENTS,
      designations: INITIAL_DESIGNATIONS,
      projects: INITIAL_PROJECTS,
      sites: INITIAL_SITES,
      employees: INITIAL_EMPLOYEES,
      contractors: INITIAL_CONTRACTORS,
      attendance: INITIAL_ATTENDANCE,
      suppliers: INITIAL_SUPPLIERS,
      purchases: INITIAL_PURCHASES,
      inventory: INITIAL_INVENTORY,
      stockMovements: INITIAL_STOCK_MOVEMENTS,
      assets: INITIAL_ASSETS,
      payrollRuns: INITIAL_PAYROLL_RUNS,
      financialRecords: INITIAL_FINANCIAL_RECORDS,
      approvals: INITIAL_APPROVALS,
      roles: INITIAL_ROLES,
      documents: INITIAL_DOCUMENTS,
      complianceRules: INITIAL_COMPLIANCE_RULES,
      billingInvoices: INITIAL_BILLING_INVOICES,
      auditLogs: INITIAL_AUDIT_LOGS,
      activities: INITIAL_ACTIVITIES,
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_COMPANY_SETTINGS,
    };
  },

  getCurrentActor() {
    return ADMIN_PROFILE;
  },
};
