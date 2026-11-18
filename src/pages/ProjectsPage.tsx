import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, FileUp, LayoutGrid, Plus, Search, Table as TableIcon } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { formatDateIN, formatINRCompact } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatusText } from '@/src/components/shared/StatusText';
import { ResilientImage } from '@/src/components/shared/ResilientImage';
import { ColumnDef, DataTable } from '@/src/components/shared/DataTable';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect, Textarea } from '@/src/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Project, ProjectCategory } from '@/src/types/erp';
import { toast } from 'sonner';

const projectWizardSchema = z.object({
  name: z.string().min(3, 'Project name is required'),
  code: z.string().min(3, 'Project code is required'),
  category: z.enum([
    'Commercial IT Park',
    'Metro & Transit',
    'Residential High-Rise',
    'Industrial & Logistics',
    'Highway & Bridges',
  ]),
  description: z.string().min(10, 'Provide a concise scope description'),
  clientName: z.string().min(2, 'Client name is required'),
  address: z.string().min(4, 'Project site address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  lat: z.number(),
  lng: z.number(),
  startDate: z.string().min(1, 'Start date is required'),
  targetCompletion: z.string().min(1, 'Target completion date is required'),
  projectManagerName: z.string().min(2, 'Project manager is required'),
  engineeringLeadName: z.string().min(2, 'Engineering lead is required'),
  departmentId: z.string().min(1),
  branchId: z.string().min(1),
  approvedBudget: z.number().min(100000),
  labourBudget: z.number().min(0),
  materialBudget: z.number().min(0),
  otherBudget: z.number().min(0),
});

type ProjectWizardForm = z.infer<typeof projectWizardSchema>;

const CATEGORY_COVER: Record<ProjectCategory, string> = {
  'Commercial IT Park': '/src/assets/images/project_it_park_1794989143447.jpg',
  'Metro & Transit': '/src/assets/images/project_metro_corridor_1794989143417.jpg',
  'Residential High-Rise': '/src/assets/images/project_residential_towers_1794989143656.jpg',
  'Industrial & Logistics': '/src/assets/images/project_logistics_hub_1794989144301.jpg',
  'Highway & Bridges': '/src/assets/images/project_metro_corridor_1794989143417.jpg',
};

export function ProjectsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects, branches, departments, selectedBranchId, addProject } = useErpStore();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [attachedDocs, setAttachedDocs] = useState<string[]>([
    'LOA_Main_Contract_Draft.pdf',
    'GFC_Structural_Drawing_Rev0.dwg',
  ]);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setWizardOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const form = useForm<ProjectWizardForm>({
    resolver: zodResolver(projectWizardSchema),
    defaultValues: {
      name: '',
      code: `PRJ-IND-${Math.floor(420 + Math.random() * 500)}`,
      category: 'Commercial IT Park',
      description: '',
      clientName: '',
      address: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.076,
      lng: 72.8777,
      startDate: '2026-12-01',
      targetCompletion: '2028-03-31',
      projectManagerName: 'Arvind Subramanian',
      engineeringLeadName: 'Siddharth Gokhale',
      departmentId: departments[0]?.id || 'dept-civil',
      branchId: branches[0]?.id || 'br-mum',
      approvedBudget: 85000000,
      labourBudget: 24000000,
      materialBudget: 49000000,
      otherBudget: 12000000,
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchBranch = selectedBranchId === 'all' || p.branchId === selectedBranchId;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);
      return matchBranch && matchStatus && matchSearch;
    });
  }, [projects, selectedBranchId, statusFilter, search]);

  const columns: ColumnDef<Project>[] = [
    {
      key: 'name',
      header: 'Project',
      sortValue: (p) => p.name,
      render: (p) => (
        <div>
          <div className="font-semibold text-[#172B4D]">{p.name}</div>
          <div className="text-[11px] font-mono text-[#64748B]">
            {p.code} · {p.clientName}
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      sortValue: (p) => p.city,
      render: (p) => (
        <span className="text-xs text-[#64748B]">
          {p.city}, {p.state}
        </span>
      ),
    },
    {
      key: 'pm',
      header: 'Project Manager',
      render: (p) => <span className="text-xs font-medium">{p.projectManagerName}</span>,
    },
    {
      key: 'progress',
      header: 'Progress',
      align: 'right',
      sortValue: (p) => p.completionPct,
      render: (p) => <span className="font-semibold tabular-nums">{p.completionPct}%</span>,
    },
    {
      key: 'budget',
      header: 'Spent / Budget',
      align: 'right',
      sortValue: (p) => p.approvedBudget,
      render: (p) => (
        <span className="text-xs tabular-nums">
          {formatINRCompact(p.actualSpent)} / {formatINRCompact(p.approvedBudget)}
        </span>
      ),
    },
    {
      key: 'sites',
      header: 'Sites & Crew',
      align: 'right',
      render: (p) => (
        <span className="text-xs tabular-nums">
          {p.siteCount} sites · {p.workforceCount}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <StatusText status={p.status} />,
    },
  ];

  const onSubmitWizard = form.handleSubmit((data) => {
    const created = addProject({
      code: data.code,
      name: data.name,
      category: data.category,
      description: data.description,
      clientName: data.clientName,
      branchId: data.branchId,
      address: data.address,
      city: data.city,
      state: data.state,
      mockGps: { lat: data.lat, lng: data.lng },
      startDate: data.startDate,
      targetCompletion: data.targetCompletion,
      projectManagerId: 'emp-002',
      projectManagerName: data.projectManagerName,
      engineeringLeadName: data.engineeringLeadName,
      departmentId: data.departmentId,
      status: 'Planning',
      completionPct: 5,
      approvedBudget: data.approvedBudget,
      labourBudget: data.labourBudget,
      materialBudget: data.materialBudget,
      otherBudget: data.otherBudget,
      coverImage: CATEGORY_COVER[data.category],
    });
    toast.success(`Project ${created.code} created`);
    setWizardOpen(false);
    setStep(1);
    form.reset();
    navigate(`/projects/${created.id}`);
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects Portfolio"
        description="Manage commercial, transit, residential, and industrial construction projects across all branches."
        actions={
          <Button
            onClick={() => {
              setStep(1);
              setWizardOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Create Project
          </Button>
        }
      />

      {/* Filter & View Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name, code, client, city..."
              className="pl-9"
            />
          </div>
          <NativeSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-44"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="Delayed">Delayed</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </NativeSelect>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-md self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-[#172B4D] shadow-sm' : 'text-[#64748B]'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-[#172B4D] shadow-sm' : 'text-[#64748B]'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" /> Table
          </button>
        </div>
      </div>

      {/* Cards or Table */}
      {viewMode === 'table' ? (
        <DataTable
          data={filtered}
          columns={columns}
          keyExtractor={(p) => p.id}
          onRowClick={(p) => navigate(`/projects/${p.id}`)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const budgetPct = Math.round((project.actualSpent / project.approvedBudget) * 100);
            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-[#2563EB]/60 transition-colors cursor-pointer flex flex-col"
              >
                <div className="h-40 w-full bg-slate-100 relative overflow-hidden">
                  <ResilientImage
                    src={project.coverImage}
                    alt={project.name}
                    className="h-full w-full object-cover"
                    fallbackLabel={project.code}
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-[#64748B]">
                      <span className="font-mono">{project.code}</span>
                      <StatusText status={project.status} />
                    </div>
                    <h3 className="mt-1 text-base font-semibold text-[#172B4D] line-clamp-1">
                      {project.name}
                    </h3>
                    <div className="mt-0.5 text-xs text-[#64748B] truncate">
                      {project.clientName} · {project.city}, {project.state}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">Completion</span>
                      <span className="font-semibold tabular-nums text-[#172B4D]">{project.completionPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full"
                        style={{ width: `${project.completionPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[11px] text-[#64748B] block">Budget Used</span>
                      <span className="font-semibold tabular-nums text-[#172B4D]">{budgetPct}%</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748B] block">Sites</span>
                      <span className="font-semibold tabular-nums text-[#172B4D]">{project.siteCount}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748B] block">Workforce</span>
                      <span className="font-semibold tabular-nums text-[#172B4D]">{project.workforceCount}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#64748B] flex items-center justify-between">
                    <span className="truncate">PM: {project.projectManagerName}</span>
                    <span className="tabular-nums shrink-0">{formatDateIN(project.targetCompletion)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6-Step Project Creation Wizard */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Construction Project — Step {step} of 6</DialogTitle>
            <DialogDescription>
              {
                [
                  'Basic information & client scope',
                  'Project site address & simulated coordinates',
                  'Start date & target completion schedule',
                  'Project management & department ownership',
                  'Approved budget & cost breakdown (INR)',
                  'Initial contracts & structural drawings',
                ][step - 1]
              }
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Indicator */}
          <div className="grid grid-cols-6 gap-1.5 mb-4">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s)}
                className={`h-1.5 rounded-full transition-colors cursor-pointer ${
                  s <= step ? 'bg-[#2563EB]' : 'bg-slate-200'
                }`}
                aria-label={`Jump to step ${s}`}
              />
            ))}
          </div>

          <form onSubmit={onSubmitWizard} className="space-y-4">
            {step === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Project Name *</label>
                    <Input {...form.register('name')} placeholder="e.g. Navi Mumbai Logistics Terminal" />
                    {form.formState.errors.name && (
                      <p className="text-[11px] text-[#DC2626] mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Project Code *</label>
                    <Input {...form.register('code')} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Category</label>
                    <NativeSelect {...form.register('category')}>
                      <option value="Commercial IT Park">Commercial IT Park</option>
                      <option value="Metro & Transit">Metro & Transit</option>
                      <option value="Residential High-Rise">Residential High-Rise</option>
                      <option value="Industrial & Logistics">Industrial & Logistics</option>
                      <option value="Highway & Bridges">Highway & Bridges</option>
                    </NativeSelect>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Client Name *</label>
                    <Input {...form.register('clientName')} placeholder="e.g. CIDCO / Private Developer" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#172B4D] block mb-1">Scope Description *</label>
                  <Textarea {...form.register('description')} placeholder="Describe structural scope, floors, or civil package..." />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#172B4D] block mb-1">Project Address *</label>
                  <Input {...form.register('address')} placeholder="Plot / Sector / Highway Stretch" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">City *</label>
                    <Input {...form.register('city')} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">State *</label>
                    <Input {...form.register('state')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Latitude (Mock Pin)</label>
                    <Input type="number" step="0.0001" {...form.register('lat', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Longitude (Mock Pin)</label>
                    <Input type="number" step="0.0001" {...form.register('lng', { valueAsNumber: true })} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Start Date *</label>
                    <Input type="date" {...form.register('startDate')} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Target Completion *</label>
                    <Input type="date" {...form.register('targetCompletion')} />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-[#64748B]">
                  Initial milestone <span className="font-medium text-[#172B4D]">Site Mobilization & Barricading</span> will be provisioned automatically; additional milestones can be scheduled in Project Details.
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Operating Branch</label>
                    <NativeSelect {...form.register('branchId')}>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Department</label>
                    <NativeSelect {...form.register('departmentId')}>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Project Manager</label>
                    <Input {...form.register('projectManagerName')} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Engineering Lead</label>
                    <Input {...form.register('engineeringLeadName')} />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Total Approved Budget (₹)</label>
                    <Input type="number" {...form.register('approvedBudget', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Labour Budget (₹)</label>
                    <Input type="number" {...form.register('labourBudget', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Material Budget (₹)</label>
                    <Input type="number" {...form.register('materialBudget', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#172B4D] block mb-1">Other Expense Budget (₹)</label>
                    <Input type="number" {...form.register('otherBudget', { valueAsNumber: true })} />
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-5 bg-slate-50 cursor-pointer hover:bg-slate-100">
                  <FileUp className="h-5 w-5 text-[#2563EB] mb-1.5" />
                  <span className="text-xs font-medium text-[#172B4D]">
                    Attach Contracts, BOQ or Structural Drawings (Simulated R2 Upload)
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setAttachedDocs((prev) => [...prev, file.name]);
                    }}
                  />
                </label>
                <div className="space-y-1.5">
                  {attachedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs px-3 py-2 bg-white border border-slate-200 rounded-md"
                    >
                      <span className="flex items-center gap-2 font-medium text-[#172B4D]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" /> {doc}
                      </span>
                      <span className="text-[#64748B]">Queued</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="secondary"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                Previous
              </Button>
              {step < 6 ? (
                <Button type="button" onClick={() => setStep((s) => Math.min(6, s + 1))}>
                  Continue
                </Button>
              ) : (
                <Button type="submit">Create Project</Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
