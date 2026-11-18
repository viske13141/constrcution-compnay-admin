import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightLeft, Eye, EyeOff, Plus, Search, UserX } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { formatDateIN, formatINR } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatusText } from '@/src/components/shared/StatusText';
import { ColumnDef, DataTable } from '@/src/components/shared/DataTable';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Sheet, SheetContent } from '@/src/components/ui/sheet';
import { Employee, EmployeeCategory } from '@/src/types/erp';
import { toast } from 'sonner';

const CATEGORIES: EmployeeCategory[] = [
  'Office Employee',
  'Engineer',
  'Supervisor',
  'Foreman',
  'Skilled Labour',
  'Unskilled Labour',
  'Driver',
  'Machine Operator',
  'Contract Labour',
];

const onboardSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  empCode: z.string().min(3),
  category: z.enum([
    'Office Employee',
    'Engineer',
    'Supervisor',
    'Foreman',
    'Skilled Labour',
    'Unskilled Labour',
    'Driver',
    'Machine Operator',
    'Contract Labour',
  ]),
  employmentType: z.enum(['Permanent', 'Daily-Wage', 'Contract']),
  designation: z.string().min(2),
  departmentId: z.string().min(1),
  projectId: z.string().min(1),
  siteId: z.string().min(1),
  reportingManager: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().min(3),
  dailyWageOrMonthlySalary: z.number().min(300),
  salaryUnit: z.enum(['Monthly', 'Daily']),
  contractorName: z.string().optional(),
});

type OnboardForm = z.infer<typeof onboardSchema>;

export function WorkforcePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    employees,
    departments,
    designations,
    projects,
    sites,
    selectedBranchId,
    addEmployee,
    transferEmployee,
    exitEmployee,
    settings,
  } = useErpStore();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [revealPII, setRevealPII] = useState(false);

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferProjectId, setTransferProjectId] = useState(projects[0]?.id || '');
  const [transferSiteId, setTransferSiteId] = useState(sites[0]?.id || '');
  const [transferManager, setTransferManager] = useState('Arvind Subramanian');
  const [transferReason, setTransferReason] = useState('');

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setOnboardOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const form = useForm<OnboardForm>({
    resolver: zodResolver(onboardSchema),
    defaultValues: {
      fullName: '',
      empCode: `AB-NEW-${Math.floor(800 + Math.random() * 199)}`,
      category: 'Skilled Labour',
      employmentType: 'Daily-Wage',
      designation: designations[6]?.title || 'Mason & Bar Bender (Skilled)',
      departmentId: departments[1]?.id || 'dept-ops',
      projectId: projects[0]?.id || '',
      siteId: sites[0]?.id || '',
      reportingManager: 'Rameshwar Patil',
      phone: '+91 98200 ',
      email: 'staff@aaravbuildcorp.in',
      dailyWageOrMonthlySalary: 950,
      salaryUnit: 'Daily',
      contractorName: '',
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      const matchBranch = selectedBranchId === 'all' || e.branchId === selectedBranchId;
      const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      const matchQ =
        !q ||
        e.fullName.toLowerCase().includes(q) ||
        e.empCode.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        e.siteName.toLowerCase().includes(q);
      return matchBranch && matchCat && matchStatus && matchQ;
    });
  }, [employees, selectedBranchId, categoryFilter, statusFilter, search]);

  const columns: ColumnDef<Employee>[] = [
    {
      key: 'name',
      header: 'Employee',
      sortValue: (e) => e.fullName,
      render: (e) => (
        <div>
          <div className="font-semibold text-[#172B4D]">{e.fullName}</div>
          <div className="text-[11px] font-mono text-[#64748B]">
            {e.empCode} · {e.designation}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortValue: (e) => e.category,
      render: (e) => (
        <div className="text-xs">
          <div className="font-medium text-[#172B4D]">{e.category}</div>
          <div className="text-[11px] text-[#64748B]">{e.employmentType}</div>
        </div>
      ),
    },
    {
      key: 'assignment',
      header: 'Project & Site',
      render: (e) => (
        <div className="text-xs max-w-[240px]">
          <div className="font-medium text-[#172B4D] truncate">{e.siteName}</div>
          <div className="text-[11px] text-[#64748B] truncate">{e.projectName}</div>
        </div>
      ),
    },
    {
      key: 'manager',
      header: 'Reporting Manager',
      render: (e) => <span className="text-xs text-[#64748B]">{e.reportingManager}</span>,
    },
    {
      key: 'wage',
      header: 'Compensation',
      align: 'right',
      sortValue: (e) => e.dailyWageOrMonthlySalary,
      render: (e) => (
        <span className="text-xs font-semibold tabular-nums">
          {formatINR(e.dailyWageOrMonthlySalary)}/{e.salaryUnit === 'Daily' ? 'day' : 'mo'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (e) => <StatusText status={e.status} />,
    },
  ];

  const onOnboard = form.handleSubmit((data) => {
    const dept = departments.find((d) => d.id === data.departmentId);
    const prj = projects.find((p) => p.id === data.projectId);
    const st = sites.find((s) => s.id === data.siteId);
    const created = addEmployee({
      empCode: data.empCode,
      fullName: data.fullName,
      category: data.category,
      employmentType: data.employmentType,
      designation: data.designation,
      departmentId: data.departmentId,
      departmentName: dept?.name || 'Site Execution & Supervision',
      branchId: st?.branchId || prj?.branchId || 'br-mum',
      projectId: data.projectId,
      projectName: prj?.name || 'Mumbai Metro Line 7A Elevated Corridor',
      siteId: data.siteId,
      siteName: st?.name || 'Andheri Pier 34–48 Viaduct Zone',
      reportingManager: data.reportingManager,
      projectManager: prj?.projectManagerName,
      siteManager: st?.siteManagerName,
      phone: data.phone,
      email: data.email,
      aadhaarMasked: `•••• •••• ${Math.floor(1000 + Math.random() * 8999)}`,
      panMasked: `•••••${Math.floor(1000 + Math.random() * 8999)}P`,
      bankAccountMasked: `HDFC •••• ${Math.floor(1000 + Math.random() * 8999)}`,
      dailyWageOrMonthlySalary: data.dailyWageOrMonthlySalary,
      salaryUnit: data.salaryUnit,
      joinDate: new Date().toISOString().slice(0, 10),
      status: 'Active',
      contractorName: data.contractorName || undefined,
    });
    toast.success(`Onboarded ${created.fullName}`);
    setOnboardOpen(false);
    form.reset();
  });

  const activeEmp = selectedEmployee
    ? employees.find((e) => e.id === selectedEmployee.id) || selectedEmployee
    : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Workforce Directory"
        description="Manage permanent staff, engineers, supervisors, daily-wage labour, operators, and contractor crew with preserved assignment history."
        actions={
          <Button onClick={() => setOnboardOpen(true)}>
            <Plus className="h-4 w-4" /> Onboard Employee
          </Button>
        }
      />

      {/* Category & Search Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, employee code, designation, site..."
            className="pl-9"
          />
        </div>
        <NativeSelect
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="md:w-52"
        >
          <option value="all">All 9 Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="md:w-40"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Exited">Exited</option>
        </NativeSelect>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(e) => e.id}
        onRowClick={(e) => {
          setRevealPII(false);
          setSelectedEmployee(e);
        }}
      />

      {/* Employee Profile Drawer */}
      <Sheet open={Boolean(activeEmp)} onOpenChange={(o) => !o && setSelectedEmployee(null)}>
        <SheetContent>
          {activeEmp && (
            <div className="space-y-5 pr-2">
              <div className="pr-8">
                <div className="text-xs font-mono text-[#64748B]">
                  {activeEmp.empCode} · {activeEmp.category} · {activeEmp.employmentType}
                </div>
                <h2 className="text-xl font-semibold text-[#172B4D] mt-0.5">{activeEmp.fullName}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-[#64748B]">{activeEmp.designation}</span>
                  <StatusText status={activeEmp.status} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setTransferProjectId(activeEmp.projectId);
                    setTransferSiteId(activeEmp.siteId);
                    setTransferManager(activeEmp.reportingManager);
                    setTransferReason('');
                    setTransferOpen(true);
                  }}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer Site / Project
                </Button>
                {activeEmp.status !== 'Exited' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      exitEmployee(activeEmp.id, 'Resignation / Contract closure processed by Admin');
                      toast.success(`${activeEmp.fullName} marked as Exited`);
                    }}
                  >
                    <UserX className="h-3.5 w-3.5" /> Process Exit
                  </Button>
                )}
              </div>

              {/* Current Reporting & Site Assignment */}
              <div className="p-3.5 border border-slate-200 rounded-md space-y-2 text-xs">
                <div className="font-semibold text-[#172B4D]">Current Operational Assignment</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[#64748B] block">Department</span>
                    <span className="font-medium">{activeEmp.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Reporting Manager</span>
                    <span className="font-medium">{activeEmp.reportingManager}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Project</span>
                    <span className="font-medium">{activeEmp.projectName}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Site</span>
                    <span className="font-medium">{activeEmp.siteName}</span>
                  </div>
                  {activeEmp.contractorName && (
                    <div className="col-span-2">
                      <span className="text-[#64748B] block">Contractor Agency</span>
                      <span className="font-medium">{activeEmp.contractorName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sensitive Statutory & Compensation Fields (Masked by Default) */}
              <div className="p-3.5 border border-slate-200 rounded-md space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#172B4D]">
                    Compensation & Statutory Identity ({settings.maskSensitivePII ? 'PII Masked' : 'Visible'})
                  </span>
                  <button
                    type="button"
                    onClick={() => setRevealPII((r) => !r)}
                    className="inline-flex items-center gap-1 text-[#2563EB] font-medium cursor-pointer"
                  >
                    {revealPII ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {revealPII ? 'Mask Fields' : 'Authorized Reveal'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[#64748B] block">Wage / Salary</span>
                    <span className="font-semibold tabular-nums">
                      {formatINR(activeEmp.dailyWageOrMonthlySalary)} / {activeEmp.salaryUnit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Phone</span>
                    <span className="font-mono">{activeEmp.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Aadhaar</span>
                    <span className="font-mono">
                      {revealPII ? `8421 9012 ${activeEmp.aadhaarMasked.slice(-4)}` : activeEmp.aadhaarMasked}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">PAN</span>
                    <span className="font-mono">
                      {revealPII ? `AFKPD${activeEmp.panMasked.slice(-5)}` : activeEmp.panMasked}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#64748B] block">Bank Account</span>
                    <span className="font-mono">
                      {revealPII ? `5010028491${activeEmp.bankAccountMasked.slice(-4)}` : activeEmp.bankAccountMasked}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignment History Timeline */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#172B4D]">Preserved Assignment History</div>
                <div className="border border-slate-200 rounded-md divide-y divide-slate-100">
                  {activeEmp.assignmentHistory.map((ah) => (
                    <div key={ah.id} className="p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#172B4D]">{ah.siteName}</span>
                        <span className="text-[11px] text-[#64748B] tabular-nums">
                          {formatDateIN(ah.fromDate)} → {ah.toDate ? formatDateIN(ah.toDate) : 'Present'}
                        </span>
                      </div>
                      <div className="text-[#64748B] mt-0.5">
                        {ah.projectName} · {ah.roleTitle} · Mgr: {ah.reportingManager}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Transfer Employee Modal */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Employee Between Sites / Projects</DialogTitle>
            <DialogDescription>
              Previous site assignment dates are preserved automatically in the employee's history log.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-medium block mb-1">Target Project</label>
              <NativeSelect
                value={transferProjectId}
                onChange={(e) => {
                  setTransferProjectId(e.target.value);
                  const firstSite = sites.find((s) => s.projectId === e.target.value);
                  if (firstSite) setTransferSiteId(firstSite.id);
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <label className="font-medium block mb-1">Target Site</label>
              <NativeSelect value={transferSiteId} onChange={(e) => setTransferSiteId(e.target.value)}>
                {sites
                  .filter((s) => s.projectId === transferProjectId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </NativeSelect>
            </div>
            <div>
              <label className="font-medium block mb-1">New Reporting Manager</label>
              <Input value={transferManager} onChange={(e) => setTransferManager(e.target.value)} />
            </div>
            <div>
              <label className="font-medium block mb-1">Transfer Reason</label>
              <Input
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="e.g. Mobilization for structural steel erection phase"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setTransferOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!activeEmp) return;
                  transferEmployee(
                    activeEmp.id,
                    transferProjectId,
                    transferSiteId,
                    transferManager,
                    transferReason || 'Operational site transfer'
                  );
                  toast.success(`Transferred ${activeEmp.fullName}`);
                  setTransferOpen(false);
                }}
              >
                Confirm Transfer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Onboarding Modal */}
      <Dialog open={onboardOpen} onOpenChange={setOnboardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Onboard Employee / Labour Worker</DialogTitle>
            <DialogDescription>
              Assign category, department, designation, site placement, and compensation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onOnboard} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium block mb-1">Full Name *</label>
                <Input {...form.register('fullName')} placeholder="e.g. Manoj Kumar Tiwari" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Employee Code</label>
                <Input {...form.register('empCode')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Category</label>
                <NativeSelect {...form.register('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Employment Type</label>
                <NativeSelect {...form.register('employmentType')}>
                  <option value="Permanent">Permanent</option>
                  <option value="Daily-Wage">Daily-Wage</option>
                  <option value="Contract">Contract</option>
                </NativeSelect>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Designation</label>
                <Input {...form.register('designation')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Project</label>
                <NativeSelect {...form.register('projectId')}>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Assigned Site</label>
                <NativeSelect {...form.register('siteId')}>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Department</label>
                <NativeSelect {...form.register('departmentId')}>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Reporting Manager</label>
                <Input {...form.register('reportingManager')} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Phone</label>
                <Input {...form.register('phone')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Salary / Wage (₹)</label>
                <Input type="number" {...form.register('dailyWageOrMonthlySalary', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Pay Basis</label>
                <NativeSelect {...form.register('salaryUnit')}>
                  <option value="Daily">Daily Wage</option>
                  <option value="Monthly">Monthly Salary</option>
                </NativeSelect>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Contractor (If Contract)</label>
                <Input {...form.register('contractorName')} placeholder="Optional" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="secondary" onClick={() => setOnboardOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Complete Onboarding</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
