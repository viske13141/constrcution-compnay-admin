import React, { useMemo } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { erpService } from '@/src/services/erpService';
import { AppShell } from '@/src/components/layout/AppShell';
import { OverviewPage } from '@/src/pages/OverviewPage';
import { ProjectsPage } from '@/src/pages/ProjectsPage';
import { ProjectDetailPage } from '@/src/pages/ProjectDetailPage';
import { SitesPage } from '@/src/pages/SitesPage';
import { SiteDetailPage } from '@/src/pages/SiteDetailPage';
import { WorkforcePage } from '@/src/pages/WorkforcePage';
import { AttendancePage } from '@/src/pages/AttendancePage';
import { ProcurementPage } from '@/src/pages/ProcurementPage';
import { InventoryPage } from '@/src/pages/InventoryPage';
import { EquipmentPage } from '@/src/pages/EquipmentPage';
import { ContractorsPage } from '@/src/pages/ContractorsPage';
import { HrPayrollPage } from '@/src/pages/HrPayrollPage';
import { FinancePage } from '@/src/pages/FinancePage';
import { ApprovalsPage } from '@/src/pages/ApprovalsPage';
import { ReportsPage } from '@/src/pages/ReportsPage';
import { OrganizationPage } from '@/src/pages/OrganizationPage';
import { RolesPermissionsPage } from '@/src/pages/RolesPermissionsPage';
import { DocumentsCompliancePage } from '@/src/pages/DocumentsCompliancePage';
import { SubscriptionBillingPage } from '@/src/pages/SubscriptionBillingPage';
import { IntegrationsPage } from '@/src/pages/IntegrationsPage';
import { AuditLogsPage } from '@/src/pages/AuditLogsPage';
import { SettingsPage } from '@/src/pages/SettingsPage';

function ErpRouter() {
  const { isLoading, isError, refetch } = useQuery({
    queryKey: ['erp-bootstrap'],
    queryFn: () => erpService.fetchBootstrapSnapshot(),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 w-full max-w-md space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-[#F59E0B] text-[#101F35] flex items-center justify-center font-bold text-sm">
              BF
            </div>
            <div>
              <div className="text-sm font-semibold text-[#172B4D]">BuildFlow Company Admin</div>
              <div className="text-xs text-[#64748B]">Loading enterprise workspace...</div>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-2.5 bg-slate-100 rounded w-3/4 animate-pulse" />
            <div className="h-2.5 bg-slate-100 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md text-center space-y-3">
          <h2 className="text-base font-semibold text-[#172B4D]">Unable to initialize ERP workspace</h2>
          <p className="text-xs text-[#64748B]">Check network or service adapter status and retry.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-medium bg-[#2563EB] text-white rounded-md cursor-pointer"
          >
            Retry Bootstrap
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/sites/:id" element={<SiteDetailPage />} />
        <Route path="/workforce" element={<WorkforcePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/procurement" element={<ProcurementPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/contractors" element={<ContractorsPage />} />
        <Route path="/hr" element={<HrPayrollPage mode="hr" />} />
        <Route path="/payroll" element={<HrPayrollPage mode="payroll" />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/organization/structure" element={<OrganizationPage defaultTab="structure" />} />
        <Route path="/organization/branches" element={<OrganizationPage defaultTab="branches" />} />
        <Route path="/organization/departments" element={<OrganizationPage defaultTab="departments" />} />
        <Route path="/organization/designations" element={<OrganizationPage defaultTab="designations" />} />
        <Route path="/roles" element={<RolesPermissionsPage />} />
        <Route path="/documents" element={<DocumentsCompliancePage defaultTab="documents" />} />
        <Route path="/compliance" element={<DocumentsCompliancePage defaultTab="compliance" />} />
        <Route path="/subscription" element={<SubscriptionBillingPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErpRouter />
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
