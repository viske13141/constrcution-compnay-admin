export type ProjectStatus = 'Active' | 'Planning' | 'On Hold' | 'Delayed' | 'Completed';
export type ProjectCategory =
  | 'Commercial IT Park'
  | 'Metro & Transit'
  | 'Residential High-Rise'
  | 'Industrial & Logistics'
  | 'Highway & Bridges';

export type SiteStatus = 'Operational' | 'Mobilizing' | 'Safety Hold' | 'Inspection Due' | 'Completed';

export type EmployeeCategory =
  | 'Office Employee'
  | 'Engineer'
  | 'Supervisor'
  | 'Foreman'
  | 'Skilled Labour'
  | 'Unskilled Labour'
  | 'Driver'
  | 'Machine Operator'
  | 'Contract Labour';

export type EmploymentType = 'Permanent' | 'Daily-Wage' | 'Contract';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Transferred' | 'Exited';

export type AttendanceState = 'Present' | 'Absent' | 'Late' | 'Missing Checkout' | 'Pending Verification';
export type TrackingFreshness = 'Live' | 'Stale (>15m)' | 'Offline Queued' | 'Stopped';

export type ProcurementStage =
  | 'Submitted'
  | 'Site Engineer Verified'
  | 'Site Manager Approved'
  | 'Procurement Checked'
  | 'Finance Authorized'
  | 'Rejected';

export type AssetCategory =
  | 'Excavator'
  | 'Crane'
  | 'Concrete Mixer'
  | 'Loader'
  | 'Generator'
  | 'Vehicle'
  | 'Safety Equipment'
  | 'Tools';

export type AssetStatus = 'Available' | 'In Use' | 'Under Maintenance' | 'Out of Service';

export type ApprovalCategory =
  | 'Employee Onboarding'
  | 'Employee Transfer'
  | 'Attendance Correction'
  | 'Leave'
  | 'Overtime'
  | 'Purchase Request'
  | 'Material Receipt'
  | 'Expense Claim'
  | 'Contractor Invoice'
  | 'Payroll'
  | 'Financial Payment';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';
export type PermissionScope = 'Company' | 'Branch' | 'Department' | 'Project' | 'Site' | 'Assigned Employees';

export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  address: string;
  branchHead: string;
  phone: string;
  activeProjects: number;
  workforceCount: number;
  isHeadquarters?: boolean;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  branchId: string;
  headEmployeeId: string;
  headName: string;
  employeeCount: number;
  budgetAllocated: number;
}

export interface Designation {
  id: string;
  title: string;
  grade: string;
  departmentName: string;
  category: EmployeeCategory;
  headcount: number;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  targetDate: string;
  status: 'Completed' | 'In Progress' | 'Upcoming' | 'Delayed';
  completionPct: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  category: ProjectCategory;
  description: string;
  clientName: string;
  branchId: string;
  address: string;
  city: string;
  state: string;
  mockGps: { lat: number; lng: number };
  startDate: string;
  targetCompletion: string;
  projectManagerId: string;
  projectManagerName: string;
  engineeringLeadName: string;
  departmentId: string;
  status: ProjectStatus;
  completionPct: number;
  approvedBudget: number;
  labourBudget: number;
  materialBudget: number;
  otherBudget: number;
  actualSpent: number;
  workforceCount: number;
  siteCount: number;
  coverImage: string;
  milestones: ProjectMilestone[];
}

export interface SiteWorkAssignment {
  id: string;
  title: string;
  zone: string;
  supervisorName: string;
  crewSize: number;
  progressPct: number;
  dueDate: string;
  status: 'Active' | 'Completed' | 'Blocked';
}

export interface SiteSafetyIncident {
  id: string;
  date: string;
  type: 'Near Miss' | 'Toolbox Talk' | 'PPE Audit' | 'First Aid';
  summary: string;
  reportedBy: string;
  status: 'Closed' | 'Open';
}

export interface ConstructionSite {
  id: string;
  code: string;
  name: string;
  projectId: string;
  branchId: string;
  address: string;
  city: string;
  mockGps: { lat: number; lng: number };
  geofenceRadiusMeters: number;
  siteManagerName: string;
  siteEngineerName: string;
  supervisorName: string;
  startDate: string;
  expectedCompletion: string;
  shiftConfig: string;
  workforceCount: number;
  presentToday: number;
  status: SiteStatus;
  lastLocationSync: string;
  activeTrackingSessions: number;
  offlineQueuedUpdates: number;
  staleTrackers: number;
  alerts: string[];
  selfieCheckInRequired: boolean;
  selfieCheckOutRequired: boolean;
  geofenceStrictMode: boolean;
  assignments: SiteWorkAssignment[];
  safetyLogs: SiteSafetyIncident[];
}

export interface AssignmentHistoryEntry {
  id: string;
  projectId: string;
  projectName: string;
  siteId: string;
  siteName: string;
  roleTitle: string;
  fromDate: string;
  toDate?: string;
  reportingManager: string;
}

export interface Employee {
  id: string;
  empCode: string;
  fullName: string;
  category: EmployeeCategory;
  employmentType: EmploymentType;
  designation: string;
  departmentId: string;
  departmentName: string;
  branchId: string;
  projectId: string;
  projectName: string;
  siteId: string;
  siteName: string;
  reportingManager: string;
  projectManager?: string;
  siteManager?: string;
  phone: string;
  email: string;
  aadhaarMasked: string;
  panMasked: string;
  bankAccountMasked: string;
  dailyWageOrMonthlySalary: number;
  salaryUnit: 'Monthly' | 'Daily';
  joinDate: string;
  status: EmployeeStatus;
  contractorName?: string;
  assignmentHistory: AssignmentHistoryEntry[];
}

export interface Contractor {
  id: string;
  code: string;
  companyName: string;
  tradeSpecialty: string;
  contactPerson: string;
  phone: string;
  gstNumber: string;
  panMasked: string;
  branchId: string;
  assignedProjects: string[];
  deployedWorkers: number;
  contractValue: number;
  billedToDate: number;
  paidToDate: number;
  retentionHeld: number;
  complianceStatus: 'Verified' | 'Renewal Due' | 'Pending Docs';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  empCode: string;
  category: EmployeeCategory;
  branchId: string;
  projectId: string;
  projectName: string;
  siteId: string;
  siteName: string;
  supervisorName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  state: AttendanceState;
  selfieVerified: boolean;
  gpsAccuracyMeters: number;
  geofenceMatch: boolean;
  trackingStatus: TrackingFreshness;
  lastLocationUpdate: string;
  offlineQueueCount: number;
  exceptionReason?: string;
  mockCoordOffset: { x: number; y: number };
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  category: string;
  gstin: string;
  city: string;
  contactPerson: string;
  phone: string;
  rating: number;
  activePOs: number;
  pendingPayable: number;
}

export interface PurchaseRequest {
  id: string;
  poNumber?: string;
  projectId: string;
  projectName: string;
  siteId: string;
  siteName: string;
  branchId: string;
  supplierId: string;
  supplierName: string;
  requesterName: string;
  materialCategory: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstRatePct: number;
  totalWithTax: number;
  invoiceNumber?: string;
  invoiceSubmitted: boolean;
  materialPhotoAttached: boolean;
  deliveryPhotoAttached: boolean;
  purchaseLocation: string;
  stage: ProcurementStage;
  requestedDate: string;
  receiptVerifiedByEngineer: boolean;
  receiptApprovedBySiteManager: boolean;
  financeAuthorized: boolean;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  materialName: string;
  category: string;
  unit: string;
  siteId: string;
  siteName: string;
  projectName: string;
  currentStock: number;
  reorderLevel: number;
  unitCost: number;
  totalValue: number;
  pendingDeliveryQty: number;
  damagedOrRejectedQty: number;
  lastUpdated: string;
  preferredSupplier: string;
}

export interface StockMovement {
  id: string;
  date: string;
  materialName: string;
  type: 'Receipt (Verified)' | 'Site Issue' | 'Inter-Site Transfer' | 'Damaged/Rejected';
  quantity: number;
  unit: string;
  fromSite: string;
  toSite: string;
  authorizedBy: string;
  referenceId: string;
}

export interface EquipmentAsset {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  serialNumber: string;
  purchaseDate: string;
  branchId: string;
  assignedProjectId: string;
  assignedProjectName: string;
  assignedSiteId: string;
  assignedSiteName: string;
  operatorName: string;
  status: AssetStatus;
  nextMaintenanceDate: string;
  insuranceExpiryDate: string;
  dailyRunningCost: number;
  hoursLoggedMonth: number;
}

export interface PayrollRunSummary {
  id: string;
  monthLabel: string;
  branchId: string;
  branchName: string;
  permanentCount: number;
  labourCount: number;
  grossPayroll: number;
  overtimeCost: number;
  advanceDeductions: number;
  advanceOutstanding: number;
  netPayable: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Bank Disbursed';
  complianceAlerts: string[];
}

export interface FinancialRecord {
  id: string;
  date: string;
  type:
    | 'Payroll Liability'
    | 'Approved Payment'
    | 'Bank Payment'
    | 'Pending Supplier Invoice'
    | 'Employee Reimbursement'
    | 'Site Expense'
    | 'Contractor Bill';
  reference: string;
  party: string;
  projectId: string;
  projectName: string;
  siteName: string;
  amount: number;
  paymentStatus: 'Pending' | 'Approved' | 'Paid' | 'On Hold';
}

export interface ApprovalHistoryStep {
  stage: string;
  actor: string;
  decision: 'Submitted' | 'Verified' | 'Approved' | 'Rejected' | 'Pending';
  timestamp?: string;
  note?: string;
}

export interface ApprovalItem {
  id: string;
  category: ApprovalCategory;
  title: string;
  priority: 'Urgent' | 'High' | 'Normal';
  requesterName: string;
  requesterRole: string;
  amount?: number;
  projectId?: string;
  projectName?: string;
  siteId?: string;
  siteName?: string;
  branchId: string;
  currentApprover: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  linkedEntityId?: string;
  evidenceSummary: string;
  history: ApprovalHistoryStep[];
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystemDefault: boolean;
  userCount: number;
  scope: PermissionScope;
  permissions: Record<string, Record<PermissionAction, boolean>>;
}

export interface DocumentRecord {
  id: string;
  title: string;
  category:
    | 'Company Registration'
    | 'Project Contract'
    | 'Site Approval'
    | 'Employee Document'
    | 'Contractor Document'
    | 'Supplier Invoice'
    | 'Safety Certificate'
    | 'Statutory Record'
    | 'Payroll Record';
  ownerName: string;
  projectOrBranch: string;
  expiryDate?: string;
  verificationStatus: 'Verified' | 'Pending Review' | 'Expired';
  accessLevel: string;
  version: string;
  uploadedAt: string;
}

export interface ComplianceRule {
  id: string;
  jurisdiction: string;
  establishmentType: string;
  title: string;
  filingCadence: string;
  configuredDueRule: string;
  configuredRateNote: string;
  ownerRole: string;
  status: 'Compliant' | 'Action Due' | 'Under Review';
}

export interface SubscriptionPlanConfig {
  id: 'Starter' | 'Professional' | 'Enterprise';
  name: string;
  targetAudience: string;
  configuredPriceLabel: string;
  billingCycle: string;
  employeeLimit: number;
  projectLimit: number;
  siteLimit: number;
  storageLimitGb: number;
  features: string[];
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  planName: string;
  amount: number;
  status: 'Paid' | 'Pending';
}

export interface AuditLogEntry {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  timestamp: string;
  module: string;
  recordId: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  actor: string;
  module: string;
  summary: string;
  detail: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRoute: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface CompanySettings {
  companyName: string;
  legalEntityName: string;
  gstin: string;
  cin: string;
  primaryEmail: string;
  primaryPhone: string;
  hqAddress: string;
  currency: string;
  timezone: string;
  financialYear: string;
  dateFormat: string;
  workingDays: string[];
  holidays: { date: string; name: string }[];
  notifyApprovalAlerts: boolean;
  notifyLowStock: boolean;
  notifyStaleGps: boolean;
  notifyComplianceExpiry: boolean;
  enforce2FA: boolean;
  maskSensitivePII: boolean;
  sessionTimeoutMins: number;
  documentRetentionYears: number;
}
