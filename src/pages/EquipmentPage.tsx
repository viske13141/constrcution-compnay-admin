import React, { useMemo, useState } from 'react';
import { ArrowRightLeft, Search, Wrench } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { formatDateIN, formatINR } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatTile } from '@/src/components/shared/StatTile';
import { StatusText } from '@/src/components/shared/StatusText';
import { ColumnDef, DataTable } from '@/src/components/shared/DataTable';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { EquipmentAsset } from '@/src/types/erp';
import { toast } from 'sonner';

export function EquipmentPage() {
  const { assets, projects, sites, selectedBranchId, transferAsset, updateAssetStatus } = useErpStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transferTarget, setTransferTarget] = useState<EquipmentAsset | null>(null);
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id || '');
  const [newSiteId, setNewSiteId] = useState(sites[0]?.id || '');
  const [newOperator, setNewOperator] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets.filter((a) => {
      const mBranch = selectedBranchId === 'all' || a.branchId === selectedBranchId;
      const mStatus = statusFilter === 'all' || a.status === statusFilter;
      const mQ =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.assetCode.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.assignedSiteName.toLowerCase().includes(q);
      return mBranch && mStatus && mQ;
    });
  }, [assets, selectedBranchId, statusFilter, search]);

  const columns: ColumnDef<EquipmentAsset>[] = [
    {
      key: 'asset',
      header: 'Asset & Serial',
      sortValue: (a) => a.name,
      render: (a) => (
        <div>
          <div className="font-semibold text-[#172B4D]">{a.name}</div>
          <div className="text-[11px] font-mono text-[#64748B]">
            {a.assetCode} · {a.category} · SN: {a.serialNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'site',
      header: 'Assigned Site & Operator',
      render: (a) => (
        <div className="text-xs max-w-[210px]">
          <div className="font-medium text-[#172B4D] truncate">{a.assignedSiteName}</div>
          <div className="text-[11px] text-[#64748B] truncate">Op: {a.operatorName}</div>
        </div>
      ),
    },
    {
      key: 'maintenance',
      header: 'Service & Insurance',
      render: (a) => (
        <div className="text-xs tabular-nums">
          <div>Service: {formatDateIN(a.nextMaintenanceDate)}</div>
          <div className="text-[11px] text-[#64748B]">Ins Exp: {formatDateIN(a.insuranceExpiryDate)}</div>
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Month Hours / Cost',
      align: 'right',
      sortValue: (a) => a.hoursLoggedMonth,
      render: (a) => (
        <div className="text-xs tabular-nums">
          <div className="font-semibold">{a.hoursLoggedMonth} hrs</div>
          <div className="text-[11px] text-[#64748B]">{formatINR(a.dailyRunningCost)}/day</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => <StatusText status={a.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 px-2.5 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setTransferTarget(a);
              setNewProjectId(a.assignedProjectId);
              setNewSiteId(a.assignedSiteId);
              setNewOperator(a.operatorName);
            }}
          >
            <ArrowRightLeft className="h-3 w-3" /> Transfer
          </Button>
          {a.status !== 'Under Maintenance' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                updateAssetStatus(a.id, 'Under Maintenance');
                toast.info(`${a.assetCode} moved to maintenance`);
              }}
            >
              <Wrench className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Equipment & Heavy Assets"
        description="Track cranes, excavators, transit mixers, DG sets, safety cradles, preventive maintenance, and inter-site asset transfers."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Total Fleet Assets" value={assets.length} comparison="Across 8 machinery categories" />
        <StatTile label="In Active Site Use" value={assets.filter((a) => a.status === 'In Use').length} comparison="Deployed to live zones" trendTone="positive" />
        <StatTile label="Under Maintenance" value={assets.filter((a) => a.status === 'Under Maintenance').length} comparison="Workshop / preventive check" trendTone="warning" />
        <StatTile label="Out of Service" value={assets.filter((a) => a.status === 'Out of Service').length} comparison="Safety hold / cert expired" trendTone="negative" />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment name, asset code, serial, site..."
            className="pl-9"
          />
        </div>
        <NativeSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-48">
          <option value="all">All Asset Statuses</option>
          <option value="In Use">In Use</option>
          <option value="Available">Available</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Out of Service">Out of Service</option>
        </NativeSelect>
      </div>

      <DataTable data={filtered} columns={columns} keyExtractor={(a) => a.id} />

      <Dialog open={Boolean(transferTarget)} onOpenChange={(o) => !o && setTransferTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Equipment — {transferTarget?.assetCode}</DialogTitle>
            <DialogDescription>Reassign {transferTarget?.name} to another project site and operator.</DialogDescription>
          </DialogHeader>
          {transferTarget && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium block mb-1">Target Project</label>
                <NativeSelect
                  value={newProjectId}
                  onChange={(e) => {
                    setNewProjectId(e.target.value);
                    const s = sites.find((st) => st.projectId === e.target.value);
                    if (s) setNewSiteId(s.id);
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
                <NativeSelect value={newSiteId} onChange={(e) => setNewSiteId(e.target.value)}>
                  {sites
                    .filter((s) => s.projectId === newProjectId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </NativeSelect>
              </div>
              <div>
                <label className="font-medium block mb-1">Assigned Operator</label>
                <Input value={newOperator} onChange={(e) => setNewOperator(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button variant="secondary" onClick={() => setTransferTarget(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    transferAsset(transferTarget.id, newProjectId, newSiteId, newOperator);
                    toast.success(`Transferred ${transferTarget.assetCode}`);
                    setTransferTarget(null);
                  }}
                >
                  Confirm Transfer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
