import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { formatINRCompact } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatTile } from '@/src/components/shared/StatTile';
import { StatusText } from '@/src/components/shared/StatusText';
import { ColumnDef, DataTable } from '@/src/components/shared/DataTable';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Contractor } from '@/src/types/erp';
import { toast } from 'sonner';

export function ContractorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { contractors, branches, projects, selectedBranchId, addContractor } = useErpStore();

  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [tradeSpecialty, setTradeSpecialty] = useState('Civil & Masonry Works');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+91 98200 ');
  const [gstNumber, setGstNumber] = useState('27AABCX1234K1Z5');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'br-mum');
  const [deployedWorkers, setDeployedWorkers] = useState(35);
  const [contractValue, setContractValue] = useState(12500000);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setCreateOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contractors.filter((c) => {
      const mBranch = selectedBranchId === 'all' || c.branchId === selectedBranchId;
      const mQ =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.tradeSpecialty.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q);
      return mBranch && mQ;
    });
  }, [contractors, selectedBranchId, search]);

  const columns: ColumnDef<Contractor>[] = [
    {
      key: 'name',
      header: 'Contractor Agency',
      sortValue: (c) => c.companyName,
      render: (c) => (
        <div>
          <div className="font-semibold text-[#172B4D]">{c.companyName}</div>
          <div className="text-[11px] font-mono text-[#64748B]">
            {c.code} · GST: {c.gstNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'trade',
      header: 'Trade & Contact',
      render: (c) => (
        <div className="text-xs">
          <div className="font-medium text-[#172B4D]">{c.tradeSpecialty}</div>
          <div className="text-[11px] text-[#64748B]">
            {c.contactPerson} · {c.phone}
          </div>
        </div>
      ),
    },
    {
      key: 'crew',
      header: 'Deployed Crew',
      align: 'right',
      sortValue: (c) => c.deployedWorkers,
      render: (c) => <span className="font-semibold tabular-nums">{c.deployedWorkers}</span>,
    },
    {
      key: 'billing',
      header: 'Billed / Contract Value',
      align: 'right',
      sortValue: (c) => c.contractValue,
      render: (c) => (
        <div className="text-xs tabular-nums">
          <div className="font-semibold">{formatINRCompact(c.billedToDate)} / {formatINRCompact(c.contractValue)}</div>
          <div className="text-[11px] text-[#64748B]">Retention: {formatINRCompact(c.retentionHeld)}</div>
        </div>
      ),
    },
    {
      key: 'compliance',
      header: 'Compliance',
      render: (c) => <StatusText status={c.complianceStatus} />,
    },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim()) {
      toast.error('Please fill contractor name and contact person');
      return;
    }
    const created = addContractor({
      code: `CON-${Math.floor(100 + Math.random() * 899)}`,
      companyName,
      tradeSpecialty,
      contactPerson,
      phone,
      gstNumber,
      panMasked: `•••••${gstNumber.slice(7, 12)}`,
      branchId,
      assignedProjects: [projects[0]?.name || 'Mumbai Metro Line 7A Elevated Corridor'],
      deployedWorkers,
      contractValue,
      billedToDate: 0,
      paidToDate: 0,
      retentionHeld: 0,
      complianceStatus: 'Pending Docs',
    });
    toast.success(`Registered ${created.companyName}`);
    setCreateOpen(false);
    setCompanyName('');
    setContactPerson('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contractors & Sub-Contract Packages"
        description="Manage labour contractors, trade packages, deployed crew headcount, RA billing, retention money, and statutory compliance."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Register Contractor
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Active Contractors" value={filtered.length} comparison="Registered trade partners" />
        <StatTile label="Contract Crew Deployed" value={filtered.reduce((a, c) => a + c.deployedWorkers, 0)} comparison="Active across sites" />
        <StatTile label="Total Contract Value" value={formatINRCompact(filtered.reduce((a, c) => a + c.contractValue, 0))} comparison="Committed work orders" />
        <StatTile label="Retention Held" value={formatINRCompact(filtered.reduce((a, c) => a + c.retentionHeld, 0))} comparison="Security deposit reserve" />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="relative max-w-sm">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contractor name, trade, code..."
            className="pl-9"
          />
        </div>
      </div>

      <DataTable data={filtered} columns={columns} keyExtractor={(c) => c.id} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Sub-Contractor Agency</DialogTitle>
            <DialogDescription>Add a trade contractor for labour deployment and RA billing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="font-medium block mb-1">Agency / Company Name *</label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium block mb-1">Trade Specialty</label>
                <Input value={tradeSpecialty} onChange={(e) => setTradeSpecialty(e.target.value)} />
              </div>
              <div>
                <label className="font-medium block mb-1">Branch</label>
                <NativeSelect value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-medium block mb-1">Contact Person *</label>
                <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
              </div>
              <div>
                <label className="font-medium block mb-1">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="font-medium block mb-1">GSTIN</label>
                <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium block mb-1">Initial Crew Deployment</label>
                <Input type="number" value={deployedWorkers} onChange={(e) => setDeployedWorkers(Number(e.target.value))} />
              </div>
              <div>
                <label className="font-medium block mb-1">Work Order Value (₹)</label>
                <Input type="number" value={contractValue} onChange={(e) => setContractValue(Number(e.target.value))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Register Contractor</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
