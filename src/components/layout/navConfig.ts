import {
  Activity,
  BarChart3,
  Briefcase,
  Building,
  Building2,
  CheckSquare,
  CreditCard,
  FileText,
  FolderKanban,
  HardHat,
  IndianRupee,
  Layers,
  LayoutDashboard,
  MapPin,
  Package,
  Plug,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserCheck,
  Users,
  Wallet,
  Wrench,
  BadgeCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavGroup {
  id: string;
  label: string;
  defaultOpen?: boolean;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    defaultOpen: true,
    items: [
      { id: 'overview', label: 'Overview', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    id: 'operations',
    label: 'Business Operations',
    defaultOpen: true,
    items: [
      { id: 'projects', label: 'Projects', path: '/projects', icon: FolderKanban },
      { id: 'sites', label: 'Construction Sites', path: '/sites', icon: MapPin },
      { id: 'workforce', label: 'Workforce', path: '/workforce', icon: Users },
      { id: 'attendance', label: 'Attendance & Tracking', path: '/attendance', icon: UserCheck },
      { id: 'procurement', label: 'Procurement', path: '/procurement', icon: ShoppingCart },
      { id: 'inventory', label: 'Inventory', path: '/inventory', icon: Package },
      { id: 'equipment', label: 'Equipment & Assets', path: '/equipment', icon: Wrench },
      { id: 'contractors', label: 'Contractors', path: '/contractors', icon: HardHat },
    ],
  },
  {
    id: 'people-finance',
    label: 'People & Finance',
    defaultOpen: true,
    items: [
      { id: 'hr', label: 'HR Management', path: '/hr', icon: Briefcase },
      { id: 'payroll', label: 'Payroll Overview', path: '/payroll', icon: Wallet },
      { id: 'finance', label: 'Finance & Expenses', path: '/finance', icon: IndianRupee },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    defaultOpen: true,
    items: [
      { id: 'approvals', label: 'Approvals', path: '/approvals', icon: CheckSquare },
      { id: 'reports', label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    ],
  },
  {
    id: 'organization',
    label: 'Organization',
    defaultOpen: false,
    items: [
      { id: 'structure', label: 'Company Structure', path: '/organization/structure', icon: Layers },
      { id: 'branches', label: 'Branches', path: '/organization/branches', icon: Building2 },
      { id: 'departments', label: 'Departments', path: '/organization/departments', icon: Building },
      { id: 'designations', label: 'Designations', path: '/organization/designations', icon: BadgeCheck },
      { id: 'roles', label: 'Roles & Permissions', path: '/roles', icon: ShieldCheck },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    defaultOpen: false,
    items: [
      { id: 'documents', label: 'Documents', path: '/documents', icon: FileText },
      { id: 'compliance', label: 'Compliance', path: '/compliance', icon: Truck },
      { id: 'subscription', label: 'Subscription & Billing', path: '/subscription', icon: CreditCard },
      { id: 'integrations', label: 'Integrations', path: '/integrations', icon: Plug },
      { id: 'audit', label: 'Audit Logs', path: '/audit-logs', icon: Activity },
      { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
