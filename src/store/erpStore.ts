import { create } from 'zustand';
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
import {
  ActivityEvent,
  ApprovalItem,
  AttendanceRecord,
  AuditLogEntry,
  BillingInvoice,
  Branch,
  CompanySettings,
  ComplianceRule,
  ConstructionSite,
  Contractor,
  Department,
  Designation,
  DocumentRecord,
  Employee,
  EquipmentAsset,
  FinancialRecord,
  InventoryItem,
  NotificationItem,
  PayrollRunSummary,
  PermissionAction,
  PermissionScope,
  ProcurementStage,
  Project,
  PurchaseRequest,
  RoleDefinition,
  StockMovement,
  SubscriptionPlanConfig,
  Supplier,
} from '@/src/types/erp';

interface ErpState {
  selectedBranchId: string;
  selectedPlanId: SubscriptionPlanConfig['id'];
  branches: Branch[];
  departments: Department[];
  designations: Designation[];
  projects: Project[];
  sites: ConstructionSite[];
  employees: Employee[];
  contractors: Contractor[];
  attendance: AttendanceRecord[];
  suppliers: Supplier[];
  purchases: PurchaseRequest[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  assets: EquipmentAsset[];
  payrollRuns: PayrollRunSummary[];
  financialRecords: FinancialRecord[];
  approvals: ApprovalItem[];
  roles: RoleDefinition[];
  documents: DocumentRecord[];
  complianceRules: ComplianceRule[];
  billingInvoices: BillingInvoice[];
  auditLogs: AuditLogEntry[];
  activities: ActivityEvent[];
  notifications: NotificationItem[];
  settings: CompanySettings;

  setSelectedBranchId: (branchId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  addProject: (project: Omit<Project, 'id' | 'actualSpent' | 'workforceCount' | 'siteCount' | 'milestones'>) => Project;
  addSite: (site: Omit<ConstructionSite, 'id' | 'workforceCount' | 'presentToday' | 'lastLocationSync' | 'activeTrackingSessions' | 'offlineQueuedUpdates' | 'staleTrackers' | 'alerts' | 'assignments' | 'safetyLogs'>) => ConstructionSite;
  updateSiteAttendanceConfig: (siteId: string, config: { selfieCheckInRequired: boolean; selfieCheckOutRequired: boolean; geofenceStrictMode: boolean; geofenceRadiusMeters: number }) => void;

  addEmployee: (emp: Omit<Employee, 'id' | 'assignmentHistory'>) => Employee;
  transferEmployee: (employeeId: string, newProjectId: string, newSiteId: string, newManager: string, reason: string) => void;
  exitEmployee: (employeeId: string, reason: string) => void;

  addContractor: (contractor: Omit<Contractor, 'id'>) => Contractor;

  resolveAttendanceException: (attendanceId: string, decision: 'Approve' | 'Reject', note: string) => void;

  addPurchaseRequest: (pr: Omit<PurchaseRequest, 'id' | 'stage' | 'requestedDate' | 'receiptVerifiedByEngineer' | 'receiptApprovedBySiteManager' | 'financeAuthorized' | 'invoiceSubmitted'>) => PurchaseRequest;
  advanceProcurementStage: (prId: string, nextStage: ProcurementStage, note?: string) => void;

  issueOrTransferStock: (payload: {
    inventoryId: string;
    type: 'Site Issue' | 'Inter-Site Transfer' | 'Damaged/Rejected';
    quantity: number;
    targetSiteName: string;
  }) => void;

  transferAsset: (assetId: string, projectId: string, siteId: string, operatorName: string) => void;
  updateAssetStatus: (assetId: string, status: EquipmentAsset['status']) => void;

  approvePayrollRun: (runId: string) => void;
  processApproval: (approvalId: string, decision: 'Approved' | 'Rejected', reason: string) => void;

  addBranch: (branch: Omit<Branch, 'id' | 'activeProjects' | 'workforceCount'>) => void;
  addDepartment: (dept: Omit<Department, 'id' | 'employeeCount'>) => void;
  addDesignation: (des: Omit<Designation, 'id' | 'headcount'>) => void;

  toggleRolePermission: (roleId: string, moduleKey: string, action: PermissionAction) => void;
  updateRoleScope: (roleId: string, scope: PermissionScope) => void;
  addCustomRole: (name: string, description: string, scope: PermissionScope) => void;

  addDocument: (doc: Omit<DocumentRecord, 'id' | 'uploadedAt' | 'version'>) => void;
  changeSubscriptionPlan: (planId: SubscriptionPlanConfig['id']) => void;
  updateSettings: (partial: Partial<CompanySettings>) => void;
}

const createAuditEntry = (
  action: string,
  module: string,
  recordId: string,
  previousValue?: string,
  newValue?: string,
  reason?: string
): AuditLogEntry => ({
  id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  userName: ADMIN_PROFILE.name,
  userRole: ADMIN_PROFILE.role,
  action,
  timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
  module,
  recordId,
  previousValue,
  newValue,
  reason,
});

const createActivityEntry = (module: string, summary: string, detail: string): ActivityEvent => ({
  id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  timestamp: 'Just now',
  actor: ADMIN_PROFILE.name,
  module,
  summary,
  detail,
});

export const useErpStore = create<ErpState>((set, get) => ({
  selectedBranchId: 'all',
  selectedPlanId: 'Enterprise',
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

  setSelectedBranchId: (selectedBranchId) => set({ selectedBranchId }),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  addProject: (input) => {
    const newProject: Project = {
      ...input,
      id: `prj-${Date.now()}`,
      actualSpent: 0,
      workforceCount: 0,
      siteCount: 0,
      milestones: [
        {
          id: `ms-${Date.now()}`,
          title: 'Site Mobilization & Barricading',
          targetDate: input.startDate,
          status: 'In Progress',
          completionPct: 10,
        },
      ],
    };
    set((s) => ({
      projects: [newProject, ...s.projects],
      auditLogs: [createAuditEntry('Project Created', 'Projects', newProject.code, undefined, newProject.name, 'New project initiated via wizard'), ...s.auditLogs],
      activities: [createActivityEntry('Projects', `Created project ${newProject.name}`, `${newProject.code} · ${newProject.city}`), ...s.activities],
    }));
    return newProject;
  },

  addSite: (input) => {
    const newSite: ConstructionSite = {
      ...input,
      id: `site-${Date.now()}`,
      workforceCount: 0,
      presentToday: 0,
      lastLocationSync: 'Just initialized (Simulated)',
      activeTrackingSessions: 0,
      offlineQueuedUpdates: 0,
      staleTrackers: 0,
      alerts: [],
      assignments: [],
      safetyLogs: [],
    };
    set((s) => ({
      sites: [newSite, ...s.sites],
      projects: s.projects.map((p) => (p.id === input.projectId ? { ...p, siteCount: p.siteCount + 1 } : p)),
      auditLogs: [createAuditEntry('Site Created', 'Construction Sites', newSite.code, undefined, newSite.name, `Geofence ${newSite.geofenceRadiusMeters}m configured`), ...s.auditLogs],
      activities: [createActivityEntry('Construction Sites', `Added site ${newSite.name}`, `${newSite.code} · Geofence ${newSite.geofenceRadiusMeters}m`), ...s.activities],
    }));
    return newSite;
  },

  updateSiteAttendanceConfig: (siteId, config) =>
    set((s) => ({
      sites: s.sites.map((site) => (site.id === siteId ? { ...site, ...config } : site)),
      auditLogs: [createAuditEntry('Site Attendance Policy Updated', 'Construction Sites', siteId, undefined, `Geofence ${config.geofenceRadiusMeters}m, Strict=${config.geofenceStrictMode}`), ...s.auditLogs],
    })),

  addEmployee: (input) => {
    const newEmp: Employee = {
      ...input,
      id: `emp-${Date.now()}`,
      assignmentHistory: [
        {
          id: `ah-${Date.now()}`,
          projectId: input.projectId,
          projectName: input.projectName,
          siteId: input.siteId,
          siteName: input.siteName,
          roleTitle: input.designation,
          fromDate: input.joinDate,
          reportingManager: input.reportingManager,
        },
      ],
    };
    set((s) => ({
      employees: [newEmp, ...s.employees],
      projects: s.projects.map((p) => (p.id === input.projectId ? { ...p, workforceCount: p.workforceCount + 1 } : p)),
      sites: s.sites.map((site) => (site.id === input.siteId ? { ...site, workforceCount: site.workforceCount + 1 } : site)),
      auditLogs: [createAuditEntry('Employee Onboarded', 'Workforce', newEmp.empCode, undefined, `${newEmp.fullName} (${newEmp.category})`, 'Onboarded via Company Admin Portal'), ...s.auditLogs],
      activities: [createActivityEntry('Workforce', `Onboarded ${newEmp.fullName}`, `${newEmp.designation} · ${newEmp.siteName}`), ...s.activities],
    }));
    return newEmp;
  },

  transferEmployee: (employeeId, newProjectId, newSiteId, newManager, reason) => {
    const state = get();
    const emp = state.employees.find((e) => e.id === employeeId);
    const project = state.projects.find((p) => p.id === newProjectId);
    const site = state.sites.find((st) => st.id === newSiteId);
    if (!emp || !project || !site) return;

    const today = new Date().toISOString().slice(0, 10);
    set((s) => ({
      employees: s.employees.map((e) => {
        if (e.id !== employeeId) return e;
        const closedHistory = e.assignmentHistory.map((ah, idx) => (idx === 0 && !ah.toDate ? { ...ah, toDate: today } : ah));
        return {
          ...e,
          projectId: project.id,
          projectName: project.name,
          siteId: site.id,
          siteName: site.name,
          branchId: site.branchId,
          reportingManager: newManager,
          assignmentHistory: [
            {
              id: `ah-${Date.now()}`,
              projectId: project.id,
              projectName: project.name,
              siteId: site.id,
              siteName: site.name,
              roleTitle: e.designation,
              fromDate: today,
              reportingManager: newManager,
            },
            ...closedHistory,
          ],
        };
      }),
      auditLogs: [createAuditEntry('Employee Transferred', 'Workforce', emp.empCode, emp.siteName, site.name, reason), ...s.auditLogs],
      activities: [createActivityEntry('Workforce', `Transferred ${emp.fullName} to ${site.name}`, reason), ...s.activities],
    }));
  },

  exitEmployee: (employeeId, reason) => {
    const emp = get().employees.find((e) => e.id === employeeId);
    if (!emp) return;
    set((s) => ({
      employees: s.employees.map((e) => (e.id === employeeId ? { ...e, status: 'Exited' } : e)),
      auditLogs: [createAuditEntry('Employee Exited', 'Workforce', emp.empCode, emp.status, 'Exited', reason), ...s.auditLogs],
    }));
  },

  addContractor: (input) => {
    const c: Contractor = { ...input, id: `con-${Date.now()}` };
    set((s) => ({
      contractors: [c, ...s.contractors],
      auditLogs: [createAuditEntry('Contractor Registered', 'Contractors', c.code, undefined, c.companyName), ...s.auditLogs],
      activities: [createActivityEntry('Contractors', `Registered contractor ${c.companyName}`, `${c.tradeSpecialty} · ${c.deployedWorkers} workers`), ...s.activities],
    }));
    return c;
  },

  resolveAttendanceException: (attendanceId, decision, note) =>
    set((s) => ({
      attendance: s.attendance.map((a) =>
        a.id === attendanceId
          ? {
              ...a,
              state: decision === 'Approve' ? 'Present' : 'Absent',
              selfieVerified: decision === 'Approve' ? true : a.selfieVerified,
              geofenceMatch: decision === 'Approve' ? true : a.geofenceMatch,
              exceptionReason: note ? `${decision}d: ${note}` : a.exceptionReason,
            }
          : a
      ),
      auditLogs: [createAuditEntry('Attendance Exception Resolved', 'Attendance', attendanceId, 'Pending Verification', decision === 'Approve' ? 'Present (Verified)' : 'Absent (Rejected)', note), ...s.auditLogs],
    })),

  addPurchaseRequest: (input) => {
    const pr: PurchaseRequest = {
      ...input,
      id: `PR-2026-${Math.floor(415 + Math.random() * 500)}`,
      stage: 'Submitted',
      requestedDate: new Date().toISOString().slice(0, 10),
      invoiceSubmitted: false,
      receiptVerifiedByEngineer: false,
      receiptApprovedBySiteManager: false,
      financeAuthorized: false,
    };
    set((s) => ({
      purchases: [pr, ...s.purchases],
      auditLogs: [createAuditEntry('Purchase Request Created', 'Procurement', pr.id, undefined, `${pr.materialName} (${pr.quantity} ${pr.unit})`), ...s.auditLogs],
      activities: [createActivityEntry('Procurement', `Submitted ${pr.id} for ${pr.materialName}`, `${pr.siteName} · ₹${pr.totalWithTax.toLocaleString('en-IN')}`), ...s.activities],
    }));
    return pr;
  },

  advanceProcurementStage: (prId, nextStage, note) => {
    const state = get();
    const pr = state.purchases.find((p) => p.id === prId);
    if (!pr) return;

    const shouldUpdateInventory = nextStage === 'Site Manager Approved' && !pr.receiptApprovedBySiteManager;

    set((s) => {
      let updatedInventory = s.inventory;
      let updatedMovements = s.stockMovements;

      if (shouldUpdateInventory) {
        const existingIdx = s.inventory.findIndex(
          (inv) => inv.siteId === pr.siteId && inv.materialName.toLowerCase().includes(pr.materialName.toLowerCase().slice(0, 12))
        );
        if (existingIdx >= 0) {
          updatedInventory = s.inventory.map((inv, idx) =>
            idx === existingIdx
              ? {
                  ...inv,
                  currentStock: inv.currentStock + pr.quantity,
                  pendingDeliveryQty: Math.max(0, inv.pendingDeliveryQty - pr.quantity),
                  totalValue: (inv.currentStock + pr.quantity) * inv.unitCost,
                  lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
                }
              : inv
          );
        } else {
          updatedInventory = [
            {
              id: `inv-${Date.now()}`,
              sku: `MAT-${pr.id.slice(-3)}`,
              materialName: pr.materialName,
              category: pr.materialCategory,
              unit: pr.unit,
              siteId: pr.siteId,
              siteName: pr.siteName,
              projectName: pr.projectName,
              currentStock: pr.quantity,
              reorderLevel: Math.max(5, Math.round(pr.quantity * 0.25)),
              unitCost: pr.unitPrice,
              totalValue: pr.quantity * pr.unitPrice,
              pendingDeliveryQty: 0,
              damagedOrRejectedQty: 0,
              lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
              preferredSupplier: pr.supplierName,
            },
            ...s.inventory,
          ];
        }
        updatedMovements = [
          {
            id: `sm-${Date.now()}`,
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            materialName: pr.materialName,
            type: 'Receipt (Verified)',
            quantity: pr.quantity,
            unit: pr.unit,
            fromSite: pr.supplierName,
            toSite: pr.siteName,
            authorizedBy: ADMIN_PROFILE.name,
            referenceId: pr.id,
          },
          ...s.stockMovements,
        ];
      }

      return {
        purchases: s.purchases.map((p) =>
          p.id !== prId
            ? p
            : {
                ...p,
                stage: nextStage,
                receiptVerifiedByEngineer:
                  nextStage === 'Site Engineer Verified' ||
                  nextStage === 'Site Manager Approved' ||
                  nextStage === 'Procurement Checked' ||
                  nextStage === 'Finance Authorized'
                    ? true
                    : p.receiptVerifiedByEngineer,
                receiptApprovedBySiteManager:
                  nextStage === 'Site Manager Approved' ||
                  nextStage === 'Procurement Checked' ||
                  nextStage === 'Finance Authorized'
                    ? true
                    : p.receiptApprovedBySiteManager,
                financeAuthorized: nextStage === 'Finance Authorized' ? true : p.financeAuthorized,
                notes: note || p.notes,
              }
        ),
        inventory: updatedInventory,
        stockMovements: updatedMovements,
        auditLogs: [createAuditEntry('Procurement Stage Updated', 'Procurement', prId, pr.stage, nextStage, note || 'Workflow progressed'), ...s.auditLogs],
        activities: [
          createActivityEntry(
            'Procurement',
            `${prId} moved to ${nextStage}`,
            shouldUpdateInventory ? `${pr.quantity} ${pr.unit} verified & credited to ${pr.siteName} inventory` : pr.materialName
          ),
          ...s.activities,
        ],
      };
    });
  },

  issueOrTransferStock: ({ inventoryId, type, quantity, targetSiteName }) => {
    const item = get().inventory.find((i) => i.id === inventoryId);
    if (!item || quantity <= 0 || quantity > item.currentStock) return;
    set((s) => ({
      inventory: s.inventory.map((i) =>
        i.id === inventoryId
          ? {
              ...i,
              currentStock: i.currentStock - quantity,
              damagedOrRejectedQty: type === 'Damaged/Rejected' ? i.damagedOrRejectedQty + quantity : i.damagedOrRejectedQty,
              totalValue: (i.currentStock - quantity) * i.unitCost,
              lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : i
      ),
      stockMovements: [
        {
          id: `sm-${Date.now()}`,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          materialName: item.materialName,
          type,
          quantity,
          unit: item.unit,
          fromSite: item.siteName,
          toSite: targetSiteName,
          authorizedBy: ADMIN_PROFILE.name,
          referenceId: `MOV-${Math.floor(100 + Math.random() * 900)}`,
        },
        ...s.stockMovements,
      ],
      auditLogs: [createAuditEntry(`Inventory ${type}`, 'Inventory', item.sku, `${item.currentStock} ${item.unit}`, `${item.currentStock - quantity} ${item.unit}`, `Destination: ${targetSiteName}`), ...s.auditLogs],
    }));
  },

  transferAsset: (assetId, projectId, siteId, operatorName) => {
    const state = get();
    const project = state.projects.find((p) => p.id === projectId);
    const site = state.sites.find((st) => st.id === siteId);
    const asset = state.assets.find((a) => a.id === assetId);
    if (!project || !site || !asset) return;

    set((s) => ({
      assets: s.assets.map((a) =>
        a.id === assetId
          ? {
              ...a,
              assignedProjectId: project.id,
              assignedProjectName: project.name,
              assignedSiteId: site.id,
              assignedSiteName: site.name,
              operatorName,
            }
          : a
      ),
      auditLogs: [createAuditEntry('Asset Transferred', 'Equipment & Assets', asset.assetCode, asset.assignedSiteName, site.name, `Assigned operator: ${operatorName}`), ...s.auditLogs],
    }));
  },

  updateAssetStatus: (assetId, status) =>
    set((s) => ({
      assets: s.assets.map((a) => (a.id === assetId ? { ...a, status } : a)),
      auditLogs: [createAuditEntry('Asset Status Updated', 'Equipment & Assets', assetId, undefined, status), ...s.auditLogs],
    })),

  approvePayrollRun: (runId) =>
    set((s) => ({
      payrollRuns: s.payrollRuns.map((r) => (r.id === runId ? { ...r, status: 'Approved' } : r)),
      auditLogs: [createAuditEntry('Payroll Run Approved', 'Payroll', runId, 'Pending Approval', 'Approved', 'Authorized for bank disbursement batch'), ...s.auditLogs],
      activities: [createActivityEntry('Payroll', `Approved payroll run ${runId}`, 'Authorized by Company Admin'), ...s.activities],
    })),

  processApproval: (approvalId, decision, reason) => {
    const item = get().approvals.find((a) => a.id === approvalId);
    if (!item) return;

    set((s) => ({
      approvals: s.approvals.map((a) =>
        a.id !== approvalId
          ? a
          : {
              ...a,
              status: decision,
              history: [
                ...a.history.slice(0, -1),
                {
                  stage: a.history[a.history.length - 1]?.stage || 'Final Review',
                  actor: ADMIN_PROFILE.name,
                  decision,
                  timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
                  note: reason,
                },
              ],
            }
      ),
      auditLogs: [createAuditEntry(`Approval ${decision}`, 'Approvals', approvalId, 'Pending', decision, reason), ...s.auditLogs],
      activities: [createActivityEntry('Approvals', `${decision}: ${item.title}`, reason || item.category), ...s.activities],
    }));

    if (decision === 'Approved' && item.linkedEntityId) {
      if (item.category === 'Payroll') {
        get().approvePayrollRun(item.linkedEntityId);
      } else if (item.category === 'Attendance Correction') {
        get().resolveAttendanceException(item.linkedEntityId, 'Approve', reason || 'Approved from Central Approval Queue');
      } else if (item.category === 'Material Receipt') {
        get().advanceProcurementStage(item.linkedEntityId, 'Site Manager Approved', reason);
      } else if (item.category === 'Purchase Request') {
        get().advanceProcurementStage(item.linkedEntityId, 'Finance Authorized', reason);
      }
    }
  },

  addBranch: (branch) =>
    set((s) => ({
      branches: [...s.branches, { ...branch, id: `br-${Date.now()}`, activeProjects: 0, workforceCount: 0 }],
      auditLogs: [createAuditEntry('Branch Added', 'Organization', branch.code, undefined, branch.name), ...s.auditLogs],
    })),

  addDepartment: (dept) =>
    set((s) => ({
      departments: [...s.departments, { ...dept, id: `dept-${Date.now()}`, employeeCount: 0 }],
      auditLogs: [createAuditEntry('Department Created', 'Organization', dept.code, undefined, dept.name), ...s.auditLogs],
    })),

  addDesignation: (des) =>
    set((s) => ({
      designations: [...s.designations, { ...des, id: `des-${Date.now()}`, headcount: 0 }],
      auditLogs: [createAuditEntry('Designation Created', 'Organization', des.title, undefined, `${des.grade} · ${des.category}`), ...s.auditLogs],
    })),

  toggleRolePermission: (roleId, moduleKey, action) =>
    set((s) => ({
      roles: s.roles.map((r) => {
        if (r.id !== roleId) return r;
        const current = r.permissions[moduleKey]?.[action] ?? false;
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [moduleKey]: {
              ...r.permissions[moduleKey],
              [action]: !current,
            },
          },
        };
      }),
      auditLogs: [createAuditEntry('Role Permission Toggled', 'Roles & Permissions', roleId, undefined, `${moduleKey}.${action}`), ...s.auditLogs],
    })),

  updateRoleScope: (roleId, scope) =>
    set((s) => ({
      roles: s.roles.map((r) => (r.id === roleId ? { ...r, scope } : r)),
      auditLogs: [createAuditEntry('Role Scope Updated', 'Roles & Permissions', roleId, undefined, scope), ...s.auditLogs],
    })),

  addCustomRole: (name, description, scope) =>
    set((s) => ({
      roles: [
        ...s.roles,
        {
          id: `role-${Date.now()}`,
          name,
          description,
          isSystemDefault: false,
          userCount: 0,
          scope,
          permissions: {
            Projects: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
            Sites: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
            Workforce: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
            Attendance: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
            Procurement: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
            FinancePayroll: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
            Documents: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
          },
        },
      ],
      auditLogs: [createAuditEntry('Custom Role Created', 'Roles & Permissions', name, undefined, `Scope: ${scope}`), ...s.auditLogs],
    })),

  addDocument: (doc) =>
    set((s) => ({
      documents: [
        {
          ...doc,
          id: `doc-${Date.now()}`,
          version: 'v1.0',
          uploadedAt: new Date().toISOString().slice(0, 10),
        },
        ...s.documents,
      ],
      auditLogs: [createAuditEntry('Document Uploaded', 'Documents', doc.title, undefined, doc.category), ...s.auditLogs],
    })),

  changeSubscriptionPlan: (planId) =>
    set((s) => ({
      selectedPlanId: planId,
      auditLogs: [createAuditEntry('Subscription Plan Changed', 'Subscription & Billing', planId, s.selectedPlanId, planId), ...s.auditLogs],
    })),

  updateSettings: (partial) =>
    set((s) => ({
      settings: { ...s.settings, ...partial },
      auditLogs: [createAuditEntry('Company Settings Updated', 'Settings', 'ORG-CFG', undefined, Object.keys(partial).join(', ')), ...s.auditLogs],
    })),
}));
