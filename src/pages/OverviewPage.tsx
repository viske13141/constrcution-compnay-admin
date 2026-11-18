import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  FileBarChart,
  FolderPlus,
  HardHat,
  MapPinPlus,
  Package,
  Plus,
  ShoppingCart,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useErpStore } from '@/src/store/erpStore';
import { ADMIN_PROFILE, FINANCIAL_TREND_DATA } from '@/src/data/mockErpData';
import { formatDateIN, formatINRCompact, formatNumberIN } from '@/src/lib/format';
import { StatTile } from '@/src/components/shared/StatTile';
import { StatusText } from '@/src/components/shared/StatusText';
import { SiteGeofenceMap } from '@/src/components/shared/SiteGeofenceMap';
import { Button } from '@/src/components/ui/button';
import { toast } from 'sonner';

const PIE_COLORS = ['#2563EB', '#F59E0B', '#16A34A', '#64748B', '#0EA5E9'];

export function OverviewPage() {
  const navigate = useNavigate();
  const {
    branches,
    departments,
    selectedBranchId,
    setSelectedBranchId,
    projects,
    sites,
    employees,
    contractors,
    attendance,
    purchases,
    inventory,
    payrollRuns,
    approvals,
    activities,
    settings,
    processApproval,
  } = useErpStore();

  const [projectFilter, setProjectFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState<'month' | 'quarter' | 'fy'>('month');
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [workforceView, setWorkforceView] = useState<'dept' | 'project' | 'category' | 'branch'>('dept');
  const [selectedMapSiteId, setSelectedMapSiteId] = useState<string | undefined>(sites[0]?.id);

  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          (selectedBranchId === 'all' || p.branchId === selectedBranchId) &&
          (projectFilter === 'all' || p.id === projectFilter)
      ),
    [projects, selectedBranchId, projectFilter]
  );

  const filteredSites = useMemo(
    () =>
      sites.filter(
        (s) =>
          (selectedBranchId === 'all' || s.branchId === selectedBranchId) &&
          (projectFilter === 'all' || s.projectId === projectFilter)
      ),
    [sites, selectedBranchId, projectFilter]
  );

  const filteredApprovals = useMemo(
    () =>
      approvals.filter(
        (a) =>
          a.status === 'Pending' &&
          (selectedBranchId === 'all' || a.branchId === selectedBranchId) &&
          (projectFilter === 'all' || !a.projectId || a.projectId === projectFilter)
      ),
    [approvals, selectedBranchId, projectFilter]
  );

  const totalWorkforce = useMemo(() => {
    if (projectFilter !== 'all') {
      return filteredProjects.reduce((acc, p) => acc + p.workforceCount, 0);
    }
    if (selectedBranchId !== 'all') {
      return branches.find((b) => b.id === selectedBranchId)?.workforceCount ?? 0;
    }
    return branches.reduce((acc, b) => acc + b.workforceCount, 0);
  }, [branches, filteredProjects, projectFilter, selectedBranchId]);

  const presentToday = useMemo(
    () => filteredSites.reduce((acc, s) => acc + s.presentToday, 0),
    [filteredSites]
  );

  const activeProjectsCount = filteredProjects.filter((p) => p.status === 'Active' || p.status === 'Delayed').length;
  const activeSitesCount = filteredSites.length;

  const monthlyPayrollCost = useMemo(() => {
    const runs = payrollRuns.filter((r) => selectedBranchId === 'all' || r.branchId === selectedBranchId);
    const base = runs.reduce((acc, r) => acc + r.netPayable, 0);
    return periodFilter === 'month' ? base : periodFilter === 'quarter' ? base * 3 : base * 8;
  }, [payrollRuns, selectedBranchId, periodFilter]);

  const monthlyMaterialSpend = useMemo(() => {
    const base = purchases
      .filter((pr) => selectedBranchId === 'all' || pr.branchId === selectedBranchId)
      .reduce((acc, pr) => acc + pr.totalWithTax, 0);
    const scale = periodFilter === 'month' ? 3 : periodFilter === 'quarter' ? 8 : 24;
    return base * scale;
  }, [purchases, selectedBranchId, periodFilter]);

  const activeContractors = contractors.filter(
    (c) => selectedBranchId === 'all' || c.branchId === selectedBranchId
  );

  const lowStockItems = inventory.filter((i) => i.currentStock <= i.reorderLevel);
  const awaitingInspection = purchases.filter((p) => p.stage === 'Submitted' || p.stage === 'Site Engineer Verified');
  const rejectedStockQty = inventory.reduce((acc, i) => acc + i.damagedOrRejectedQty, 0);

  const workforceChartData = useMemo(() => {
    if (workforceView === 'dept') {
      return departments.map((d) => ({ name: d.code, label: d.name, count: d.employeeCount }));
    }
    if (workforceView === 'project') {
      return filteredProjects.map((p) => ({ name: p.code.replace('PRJ-', ''), label: p.name, count: p.workforceCount }));
    }
    if (workforceView === 'branch') {
      return branches.map((b) => ({ name: b.code, label: b.name, count: b.workforceCount }));
    }
    return [
      { name: 'Permanent', label: 'Permanent Staff & Engineers', count: 346 },
      { name: 'Daily-Wage', label: 'Skilled & Unskilled Daily-Wage', count: 449 },
      { name: 'Contract', label: 'Contractor Deployed Crew', count: 250 },
    ];
  }, [workforceView, departments, filteredProjects, branches]);

  const attendanceCounts = useMemo(() => {
    const scoped = attendance.filter(
      (a) =>
        (selectedBranchId === 'all' || a.branchId === selectedBranchId) &&
        (projectFilter === 'all' || a.projectId === projectFilter)
    );
    return {
      present: presentToday,
      absent: Math.max(42, totalWorkforce - presentToday - 26),
      late: scoped.filter((a) => a.state === 'Late').length + 18,
      missingCheckout: scoped.filter((a) => a.state === 'Missing Checkout').length + 6,
      pendingVerification: scoped.filter((a) => a.state === 'Pending Verification').length + 4,
      activeSessions: filteredSites.reduce((acc, s) => acc + s.activeTrackingSessions, 0),
    };
  }, [attendance, selectedBranchId, projectFilter, presentToday, totalWorkforce, filteredSites]);

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#64748B]">
              {settings.companyName} · Wednesday, 18 Nov 2026
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-semibold text-[#172B4D] tracking-tight">
              Welcome back, {ADMIN_PROFILE.name.split(' ')[0]} — Operations Command
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Dashboard Branch Filter"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-[#172B4D]"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Dashboard Project Filter"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-[#172B4D] max-w-[200px]"
            >
              <option value="all">All Active Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Time Period Filter"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as 'month' | 'quarter' | 'fy')}
              className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-[#172B4D]"
            >
              <option value="month">Nov 2026 (Current Month)</option>
              <option value="quarter">Q3 FY 2026–27</option>
              <option value="fy">FY 2026–27 YTD</option>
            </select>

            <div className="relative">
              <Button onClick={() => setCreateMenuOpen((o) => !o)} size="default">
                <Plus className="h-4 w-4" />
                <span>Create New</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              {createMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setCreateMenuOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1">
                    {[
                      { label: 'New Construction Project', path: '/projects?action=create' },
                      { label: 'Add Construction Site', path: '/sites?action=create' },
                      { label: 'Onboard Employee', path: '/workforce?action=create' },
                      { label: 'Create Purchase Request', path: '/procurement?action=create' },
                      { label: 'Register Contractor', path: '/contractors?action=create' },
                    ].map((act) => (
                      <button
                        key={act.path}
                        type="button"
                        onClick={() => {
                          setCreateMenuOpen(false);
                          navigate(act.path);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#172B4D] hover:bg-slate-50 cursor-pointer"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact 8-KPI Operational Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <StatTile
          label="Total Workforce"
          value={formatNumberIN(totalWorkforce)}
          comparison="+34 vs Oct"
          trend="up"
          trendTone="positive"
          onClick={() => navigate('/workforce')}
        />
        <StatTile
          label="Present Today"
          value={formatNumberIN(presentToday)}
          comparison={`${totalWorkforce ? Math.round((presentToday / totalWorkforce) * 100) : 0}% muster`}
          trend="up"
          trendTone="positive"
          onClick={() => navigate('/attendance')}
        />
        <StatTile
          label="Active Projects"
          value={activeProjectsCount}
          comparison={`${filteredProjects.length} total portfolio`}
          trend="neutral"
          onClick={() => navigate('/projects')}
        />
        <StatTile
          label="Active Sites"
          value={activeSitesCount}
          comparison={`${filteredSites.filter((s) => s.status === 'Safety Hold').length} safety hold`}
          trend={filteredSites.some((s) => s.status === 'Safety Hold') ? 'down' : 'neutral'}
          trendTone={filteredSites.some((s) => s.status === 'Safety Hold') ? 'warning' : 'neutral'}
          onClick={() => navigate('/sites')}
        />
        <StatTile
          label="Pending Approvals"
          value={filteredApprovals.length}
          comparison={`${filteredApprovals.filter((a) => a.priority === 'Urgent').length} urgent`}
          trend="up"
          trendTone={filteredApprovals.length > 0 ? 'warning' : 'positive'}
          onClick={() => navigate('/approvals')}
        />
        <StatTile
          label="Payroll Cost"
          value={formatINRCompact(monthlyPayrollCost)}
          comparison="Provisional run"
          trend="up"
          trendTone="neutral"
          onClick={() => navigate('/payroll')}
        />
        <StatTile
          label="Material Spend"
          value={formatINRCompact(monthlyMaterialSpend)}
          comparison="+6.2% vs budget"
          trend="up"
          trendTone="warning"
          onClick={() => navigate('/procurement')}
        />
        <StatTile
          label="Active Contractors"
          value={activeContractors.length}
          comparison={`${activeContractors.reduce((a, c) => a + c.deployedWorkers, 0)} crew`}
          trend="neutral"
          onClick={() => navigate('/contractors')}
        />
      </div>

      {/* Section A: Project Portfolio + Section G: Approval Centre */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <section className="xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#172B4D]">Project Portfolio</h2>
              <p className="text-xs text-[#64748B]">Execution velocity, budget utilization, and site deployment</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
              All Projects <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredProjects.slice(0, 4).map((project) => {
              const budgetPct = Math.round((project.actualSpent / project.approvedBudget) * 100);
              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:border-[#2563EB]/50 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono text-[#64748B]">
                        {project.code} · {project.city}
                      </div>
                      <h3 className="text-sm font-semibold text-[#172B4D] truncate mt-0.5">
                        {project.name}
                      </h3>
                    </div>
                    <StatusText status={project.status} />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">Physical Progress</span>
                      <span className="font-semibold text-[#172B4D] tabular-nums">{project.completionPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full"
                        style={{ width: `${project.completionPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-[11px] text-[#64748B]">Budget Used</div>
                      <div className="font-semibold text-[#172B4D] tabular-nums">
                        {budgetPct}% ({formatINRCompact(project.actualSpent)})
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#64748B]">Workforce / Sites</div>
                      <div className="font-semibold text-[#172B4D] tabular-nums">
                        {project.workforceCount} · {project.siteCount} sites
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#64748B]">Target End</div>
                      <div className="font-medium text-[#172B4D] tabular-nums">
                        {formatDateIN(project.targetCompletion)}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#64748B] truncate">
                    PM: <span className="text-[#172B4D] font-medium">{project.projectManagerName}</span> · Start{' '}
                    {formatDateIN(project.startDate)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section G: Approval Centre */}
        <section className="xl:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#172B4D]">Approval Centre</h2>
              <p className="text-xs text-[#64748B]">Actionable items awaiting sign-off</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/approvals')}>
              Queue ({filteredApprovals.length}) <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {filteredApprovals.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B]">
                All pending approvals in this scope are cleared.
              </div>
            ) : (
              filteredApprovals.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#64748B]">
                        {item.category} · <StatusText status={item.priority} className="inline-flex" />
                      </div>
                      <div className="text-xs font-semibold text-[#172B4D] line-clamp-1 mt-0.5">
                        {item.title}
                      </div>
                    </div>
                    {item.amount && (
                      <span className="text-xs font-semibold text-[#172B4D] tabular-nums shrink-0">
                        {formatINRCompact(item.amount)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#64748B] truncate">
                      {item.requesterName} · {item.submittedAt}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => navigate('/approvals')}
                      >
                        Inspect
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => {
                          processApproval(item.id, 'Approved', 'Quick approved from Command Overview');
                          toast.success(`Approved ${item.id}`);
                        }}
                      >
                        <Check className="h-3 w-3" /> Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Section B: Live Site Operations Map */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#172B4D]">Live Site Operations & Geofence Telemetry</h2>
            <p className="text-xs text-[#64748B]">
              Simulated site coordinates, 5-minute check-in tracking status, and active site alerts
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/sites')}>
            Manage Sites <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <SiteGeofenceMap
          sites={filteredSites}
          attendance={attendance}
          selectedSiteId={selectedMapSiteId}
          onSelectSite={setSelectedMapSiteId}
        />
      </section>

      {/* Section C: Workforce Overview & Section D: Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* C. Workforce Overview */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[#172B4D]">Workforce Distribution</h2>
              <p className="text-xs text-[#64748B]">
                346 Permanent · 449 Daily-Wage · 250 Contract · 14 On Leave
              </p>
            </div>
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-md text-xs">
              {(
                [
                  ['dept', 'Dept'],
                  ['project', 'Project'],
                  ['category', 'Category'],
                  ['branch', 'Branch'],
                ] as const
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setWorkforceView(k)}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    workforceView === k ? 'bg-white text-[#172B4D] shadow-sm' : 'text-[#64748B] hover:text-[#172B4D]'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {workforceView === 'category' ? (
                <PieChart>
                  <Pie
                    data={workforceChartData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={2}
                  >
                    {workforceChartData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val ?? 0} workers`, 'Headcount']} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              ) : (
                <BarChart data={workforceChartData} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(val) => [`${val ?? 0} workers`, 'Headcount']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ''}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={42} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* D. Financial Overview */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[#172B4D]">Financial Expenditure vs Budget</h2>
              <p className="text-xs text-[#64748B]">Values in ₹ Lakhs · Labour, Material & Contractor Outflow</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/finance')}>
              Ledger <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs border-y border-slate-100 py-2.5">
            <div>
              <span className="text-[#64748B] block">Payroll Cost</span>
              <span className="font-semibold text-[#172B4D] tabular-nums">₹3.18 Cr</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Material Spend</span>
              <span className="font-semibold text-[#172B4D] tabular-nums">₹3.16 Cr</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Contractor Bills</span>
              <span className="font-semibold text-[#172B4D] tabular-nums">₹84.0 L</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Site Expenses</span>
              <span className="font-semibold text-[#172B4D] tabular-nums">₹18.6 L</span>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={FINANCIAL_TREND_DATA} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip formatter={(val) => [`₹${val ?? 0} L`, '']} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="labour" name="Labour" stackId="a" fill="#2563EB" />
                <Bar dataKey="material" name="Material" stackId="a" fill="#F59E0B" />
                <Bar dataKey="contractor" name="Contractor" stackId="a" fill="#101F35" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="budget" name="Budget Cap" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Section E: Attendance Monitoring & Section F: Procurement & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* E. Attendance Monitoring */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#172B4D]">Attendance & Tracking Summary</h2>
              <p className="text-xs text-[#64748B]">Today's geofenced muster & active 5-minute sessions</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/attendance')}>
              Monitor <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Present', value: attendanceCounts.present, tone: 'text-[#16A34A]' },
              { label: 'Absent / Leave', value: attendanceCounts.absent, tone: 'text-[#DC2626]' },
              { label: 'Late Arrivals', value: attendanceCounts.late, tone: 'text-[#D97706]' },
              { label: 'Missing Checkouts', value: attendanceCounts.missingCheckout, tone: 'text-[#DC2626]' },
              { label: 'Pending Verification', value: attendanceCounts.pendingVerification, tone: 'text-[#D97706]' },
              { label: 'Active GPS Sessions', value: attendanceCounts.activeSessions, tone: 'text-[#2563EB]' },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-md bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-[#64748B]">{stat.label}</div>
                <div className={`mt-1 text-lg font-semibold tabular-nums ${stat.tone}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* F. Procurement & Inventory Alerts */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#172B4D]">Procurement & Inventory Alerts</h2>
              <p className="text-xs text-[#64748B]">Pending purchase approvals, GRN inspections & low-stock triggers</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>
              Inventory <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-md border border-slate-200">
              <span className="text-[#64748B] block">Pending POs</span>
              <span className="text-base font-semibold text-[#172B4D] tabular-nums">{purchases.filter((p) => p.stage !== 'Finance Authorized').length}</span>
            </div>
            <div className="p-2.5 rounded-md border border-slate-200">
              <span className="text-[#64748B] block">Awaiting QC</span>
              <span className="text-base font-semibold text-[#D97706] tabular-nums">{awaitingInspection.length}</span>
            </div>
            <div className="p-2.5 rounded-md border border-slate-200">
              <span className="text-[#64748B] block">Low-Stock Items</span>
              <span className="text-base font-semibold text-[#DC2626] tabular-nums">{lowStockItems.length}</span>
            </div>
            <div className="p-2.5 rounded-md border border-slate-200">
              <span className="text-[#64748B] block">Rejected Units</span>
              <span className="text-base font-semibold text-[#DC2626] tabular-nums">{rejectedStockQty}</span>
            </div>
          </div>

          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-amber-50/70 border border-amber-200/80 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
                  <span className="font-medium text-[#172B4D] truncate">
                    {item.materialName} — {item.siteName}
                  </span>
                </div>
                <span className="font-mono text-[#DC2626] font-semibold shrink-0 tabular-nums">
                  {item.currentStock}/{item.reorderLevel} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Section H: Recent Company Activity & Section I: Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* H. Recent Company Activity */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#172B4D]">Recent Company Activity</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/audit-logs')}>
              Audit Trail <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {activities.slice(0, 6).map((act) => (
              <div key={act.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#172B4D]">
                    <span className="font-semibold">{act.actor}</span> · {act.summary}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 truncate">
                    {act.module} · {act.detail}
                  </div>
                </div>
                <span className="text-[11px] text-[#64748B] whitespace-nowrap shrink-0">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </section>

        {/* I. Quick Actions */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <h2 className="text-base font-semibold text-[#172B4D] mb-1">Quick Administrative Actions</h2>
          <p className="text-xs text-[#64748B] mb-3.5">Direct operational shortcuts across company modules</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Add Employee', icon: UserPlus, path: '/workforce?action=create' },
              { label: 'Create Project', icon: FolderPlus, path: '/projects?action=create' },
              { label: 'Add Construction Site', icon: MapPinPlus, path: '/sites?action=create' },
              { label: 'Register Contractor', icon: HardHat, path: '/contractors?action=create' },
              { label: 'Purchase Request', icon: ShoppingCart, path: '/procurement?action=create' },
              { label: 'Assign Site Manager', icon: Users, path: '/sites' },
              { label: 'View Payroll Run', icon: Wallet, path: '/payroll' },
              { label: 'Generate Report', icon: FileBarChart, path: '/reports' },
            ].map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => navigate(qa.path)}
                  className="flex items-center gap-2.5 p-3 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-[#2563EB]/5 hover:border-[#2563EB]/40 text-left text-xs font-medium text-[#172B4D] transition-colors cursor-pointer"
                >
                  <Icon className="h-4 w-4 text-[#2563EB] shrink-0" />
                  <span className="truncate">{qa.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
