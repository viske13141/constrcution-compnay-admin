import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Plus, Search } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatusText } from '@/src/components/shared/StatusText';
import { ColumnDef, DataTable } from '@/src/components/shared/DataTable';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { ConstructionSite } from '@/src/types/erp';
import { toast } from 'sonner';

const siteSchema = z.object({
  name: z.string().min(3, 'Site name is required'),
  code: z.string().min(3, 'Site code is required'),
  projectId: z.string().min(1),
  address: z.string().min(4, 'Address is required'),
  city: z.string().min(2),
  lat: z.number(),
  lng: z.number(),
  geofenceRadiusMeters: z.number().min(50).max(2000),
  siteManagerName: z.string().min(2),
  siteEngineerName: z.string().min(2),
  supervisorName: z.string().min(2),
  startDate: z.string().min(1),
  expectedCompletion: z.string().min(1),
  shiftConfig: z.string().min(3),
});

type SiteForm = z.infer<typeof siteSchema>;

export function SitesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sites, projects, selectedBranchId, addSite } = useErpStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setCreateOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const form = useForm<SiteForm>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: '',
      code: `SITE-IND-${Math.floor(100 + Math.random() * 899)}`,
      projectId: projects[0]?.id || '',
      address: '',
      city: 'Mumbai',
      lat: 19.1204,
      lng: 72.8471,
      geofenceRadiusMeters: 250,
      siteManagerName: 'Rameshwar Patil',
      siteEngineerName: 'Siddharth Gokhale',
      supervisorName: 'Imran Shaikh',
      startDate: '2026-11-20',
      expectedCompletion: '2027-08-30',
      shiftConfig: 'Day Shift (07:30–17:30)',
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sites.filter((s) => {
      const matchBranch = selectedBranchId === 'all' || s.branchId === selectedBranchId;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.siteManagerName.toLowerCase().includes(q);
      return matchBranch && matchStatus && matchQ;
    });
  }, [sites, selectedBranchId, statusFilter, search]);

  const columns: ColumnDef<ConstructionSite>[] = [
    {
      key: 'name',
      header: 'Site Name & Code',
      sortValue: (s) => s.name,
      render: (s) => (
        <div>
          <div className="font-semibold text-[#172B4D]">{s.name}</div>
          <div className="text-[11px] font-mono text-[#64748B]">
            {s.code} · {s.city}
          </div>
        </div>
      ),
    },
    {
      key: 'project',
      header: 'Parent Project',
      render: (s) => {
        const prj = projects.find((p) => p.id === s.projectId);
        return <span className="text-xs text-[#172B4D]">{prj?.name || s.projectId}</span>;
      },
    },
    {
      key: 'leadership',
      header: 'Site Leadership',
      render: (s) => (
        <div className="text-xs">
          <div className="font-medium text-[#172B4D]">SM: {s.siteManagerName}</div>
          <div className="text-[11px] text-[#64748B]">
            Eng: {s.siteEngineerName} · Sup: {s.supervisorName}
          </div>
        </div>
      ),
    },
    {
      key: 'workforce',
      header: 'Present / Crew',
      align: 'right',
      sortValue: (s) => s.workforceCount,
      render: (s) => (
        <span className="text-xs font-semibold tabular-nums">
          {s.presentToday} / {s.workforceCount}
        </span>
      ),
    },
    {
      key: 'geofence',
      header: 'Geofence & Sync',
      render: (s) => (
        <div className="text-xs">
          <span className="font-mono">{s.geofenceRadiusMeters}m</span>
          <div className="text-[11px] text-[#64748B]">{s.lastLocationSync}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <StatusText status={s.status} />,
    },
  ];

  const onCreate = form.handleSubmit((data) => {
    const parent = projects.find((p) => p.id === data.projectId);
    const created = addSite({
      code: data.code,
      name: data.name,
      projectId: data.projectId,
      branchId: parent?.branchId || 'br-mum',
      address: data.address,
      city: data.city,
      mockGps: { lat: data.lat, lng: data.lng },
      geofenceRadiusMeters: data.geofenceRadiusMeters,
      siteManagerName: data.siteManagerName,
      siteEngineerName: data.siteEngineerName,
      supervisorName: data.supervisorName,
      startDate: data.startDate,
      expectedCompletion: data.expectedCompletion,
      shiftConfig: data.shiftConfig,
      status: 'Mobilizing',
      selfieCheckInRequired: true,
      selfieCheckOutRequired: true,
      geofenceStrictMode: true,
    });
    toast.success(`Site ${created.code} created`);
    setCreateOpen(false);
    form.reset();
    navigate(`/sites/${created.id}`);
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Construction Sites"
        description="Site operations, geofenced attendance boundaries, active tracking sessions, and site-level leadership."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Add Construction Site
          </Button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search site name, code, manager..."
            className="pl-9"
          />
        </div>
        <NativeSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48"
        >
          <option value="all">All Site Statuses</option>
          <option value="Operational">Operational</option>
          <option value="Mobilizing">Mobilizing</option>
          <option value="Inspection Due">Inspection Due</option>
          <option value="Safety Hold">Safety Hold</option>
        </NativeSelect>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => navigate(`/sites/${s.id}`)}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Construction Site</DialogTitle>
            <DialogDescription>
              Configure site boundaries, geofence radius (simulated coordinates), shift timings, and site leadership.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onCreate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium block mb-1">Site Name *</label>
                <Input {...form.register('name')} placeholder="e.g. Pier 49–62 South Viaduct" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Site Code *</label>
                <Input {...form.register('code')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Parent Project *</label>
                <NativeSelect {...form.register('projectId')}>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">City *</label>
                <Input {...form.register('city')} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1">Site Address *</label>
              <Input {...form.register('address')} placeholder="Gate / Road / Sector" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Mock Lat</label>
                <Input type="number" step="0.0001" {...form.register('lat', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Mock Lng</label>
                <Input type="number" step="0.0001" {...form.register('lng', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Geofence (m)</label>
                <Input type="number" {...form.register('geofenceRadiusMeters', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Site Manager</label>
                <Input {...form.register('siteManagerName')} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Site Engineer</label>
                <Input {...form.register('siteEngineerName')} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Supervisor</label>
                <Input {...form.register('supervisorName')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Start Date</label>
                <Input type="date" {...form.register('startDate')} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Expected Completion</label>
                <Input type="date" {...form.register('expectedCompletion')} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Shift Config</label>
                <Input {...form.register('shiftConfig')} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <MapPin className="h-4 w-4" /> Create Site
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
