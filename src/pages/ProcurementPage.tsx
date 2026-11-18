import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, FileText, Plus, Search, ShieldCheck } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { formatDateIN, formatINR, formatINRCompact } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatTile } from '@/src/components/shared/StatTile';
import { StatusText } from '@/src/components/shared/StatusText';
import { ColumnDef, DataTable } from '@/src/components/shared/DataTable';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect, Textarea } from '@/src/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Sheet, SheetContent } from '@/src/components/ui/sheet';
import { ProcurementStage, PurchaseRequest } from '@/src/types/erp';
import { toast } from 'sonner';

const STAGES: ProcurementStage[] = [
  'Submitted',
  'Site Engineer Verified',
  'Site Manager Approved',
  'Procurement Checked',
  'Finance Authorized',
];

export function ProcurementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    purchases,
    suppliers,
    projects,
    sites,
    selectedBranchId,
    addPurchaseRequest,
    advanceProcurementStage,
  } = useErpStore();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [stageNote, setStageNote] = useState('');

  // Create form state
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [siteId, setSiteId] = useState(sites[0]?.id || '');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [materialCategory, setMaterialCategory] = useState('Structural Steel & TMT');
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState(20);
  const [unit, setUnit] = useState('MT');
  const [unitPrice, setUnitPrice] = useState(64000);
  const [gstRatePct, setGstRatePct] = useState(18);
  const [purchaseLocation, setPurchaseLocation] = useState('Kalamboli Yard → Site Store');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setCreateOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchases.filter((pr) => {
      const mBranch = selectedBranchId === 'all' || pr.branchId === selectedBranchId;
      const mStage = stageFilter === 'all' || pr.stage === stageFilter;
      const mQ =
        !q ||
        pr.id.toLowerCase().includes(q) ||
        pr.materialName.toLowerCase().includes(q) ||
        pr.supplierName.toLowerCase().includes(q) ||
        pr.siteName.toLowerCase().includes(q);
      return mBranch && mStage && mQ;
    });
  }, [purchases, selectedBranchId, stageFilter, search]);

  const columns: ColumnDef<PurchaseRequest>[] = [
    {
      key: 'id',
      header: 'PR / PO',
      sortValue: (p) => p.id,
      render: (p) => (
        <div>
          <div className="font-mono text-xs font-semibold text-[#172B4D]">{p.id}</div>
          <div className="text-[11px] text-[#64748B]">{p.poNumber || 'PO Pending'}</div>
        </div>
      ),
    },
    {
      key: 'material',
      header: 'Material & Qty',
      sortValue: (p) => p.materialName,
      render: (p) => (
        <div>
          <div className="font-medium text-[#172B4D]">{p.materialName}</div>
          <div className="text-[11px] text-[#64748B] tabular-nums">
            {p.quantity} {p.unit} × {formatINR(p.unitPrice)} (+{p.gstRatePct}% GST)
          </div>
        </div>
      ),
    },
    {
      key: 'site',
      header: 'Project / Site',
      render: (p) => (
        <div className="text-xs max-w-[200px]">
          <div className="font-medium text-[#172B4D] truncate">{p.siteName}</div>
          <div className="text-[11px] text-[#64748B] truncate">{p.supplierName}</div>
        </div>
      ),
    },
    {
      key: 'gates',
      header: 'Receipt vs Invoice',
      render: (p) => (
        <div className="text-[11px] space-y-0.5">
          <div>
            Receipt QC:{' '}
            <span className={p.receiptApprovedBySiteManager ? 'text-[#16A34A] font-medium' : 'text-[#D97706]'}>
              {p.receiptApprovedBySiteManager ? 'SM Approved' : p.receiptVerifiedByEngineer ? 'Eng Verified' : 'Pending'}
            </span>
          </div>
          <div className="text-[#64748B]">
            Invoice: {p.invoiceSubmitted ? p.invoiceNumber : 'Not Uploaded'}
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total (Incl. Tax)',
      align: 'right',
      sortValue: (p) => p.totalWithTax,
      render: (p) => <span className="font-semibold tabular-nums">{formatINR(p.totalWithTax)}</span>,
    },
    {
      key: 'stage',
      header: 'Workflow Stage',
      render: (p) => <StatusText status={p.stage} />,
    },
  ];

  const activePR = selectedPR ? purchases.find((p) => p.id === selectedPR.id) || selectedPR : null;

  const nextActionForPR = (pr: PurchaseRequest): { label: string; next: ProcurementStage } | null => {
    if (pr.stage === 'Submitted') return { label: 'Verify Material QC (Site Engineer)', next: 'Site Engineer Verified' };
    if (pr.stage === 'Site Engineer Verified') return { label: 'Approve Material Receipt & Credit Stock (Site Manager)', next: 'Site Manager Approved' };
    if (pr.stage === 'Site Manager Approved') return { label: 'Verify Supplier & Tax Invoice (Procurement)', next: 'Procurement Checked' };
    if (pr.stage === 'Procurement Checked') return { label: 'Authorize Payment (Finance)', next: 'Finance Authorized' };
    return null;
  };

  const handleCreatePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim()) {
      toast.error('Please enter material name');
      return;
    }
    const prj = projects.find((p) => p.id === projectId);
    const st = sites.find((s) => s.id === siteId);
    const sup = suppliers.find((sp) => sp.id === supplierId);
    const base = quantity * unitPrice;
    const totalWithTax = Math.round(base * (1 + gstRatePct / 100));

    const created = addPurchaseRequest({
      projectId,
      projectName: prj?.name || '',
      siteId,
      siteName: st?.name || '',
      branchId: st?.branchId || prj?.branchId || 'br-mum',
      supplierId,
      supplierName: sup?.name || '',
      requesterName: 'Vikramaditya Deshmukh',
      materialCategory,
      materialName,
      quantity,
      unit,
      unitPrice,
      gstRatePct,
      totalWithTax,
      materialPhotoAttached: true,
      deliveryPhotoAttached: false,
      purchaseLocation,
      notes,
    });
    toast.success(`Purchase Request ${created.id} submitted`);
    setCreateOpen(false);
    setMaterialName('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Procurement & Material Receipts"
        description="5-stage construction procurement governance separating invoice submission, engineering QC, site receipt, and finance payment authorization."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create Purchase Request
          </Button>
        }
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Active Purchase Requests"
          value={purchases.length}
          comparison={`${purchases.filter((p) => p.stage !== 'Finance Authorized').length} in workflow`}
        />
        <StatTile
          label="Awaiting Receipt QC"
          value={purchases.filter((p) => !p.receiptApprovedBySiteManager).length}
          comparison="Stock held until SM approval"
          trendTone="warning"
        />
        <StatTile
          label="Ready for Finance"
          value={purchases.filter((p) => p.stage === 'Procurement Checked').length}
          comparison="3-way matched"
          trendTone="positive"
        />
        <StatTile
          label="Total Committed Value"
          value={formatINRCompact(purchases.reduce((a, p) => a + p.totalWithTax, 0))}
          comparison="Incl. applicable GST"
        />
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Purchase Requests & Orders ({purchases.length})</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Directory ({suppliers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PR ID, material, supplier, site..."
                className="pl-9"
              />
            </div>
            <NativeSelect
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="sm:w-56"
            >
              <option value="all">All Workflow Stages</option>
              {STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </NativeSelect>
          </div>

          <DataTable
            data={filtered}
            columns={columns}
            keyExtractor={(p) => p.id}
            onRowClick={(p) => {
              setStageNote('');
              setSelectedPR(p);
            }}
          />
        </TabsContent>

        <TabsContent value="suppliers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div key={sup.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[11px] text-[#64748B]">{sup.code} · {sup.city}</div>
                    <h3 className="text-sm font-semibold text-[#172B4D] mt-0.5">{sup.name}</h3>
                  </div>
                  <span className="font-mono font-semibold text-[#16A34A]">{sup.rating} ★</span>
                </div>
                <div className="text-[#64748B]">{sup.category} · GSTIN: <span className="font-mono text-[#172B4D]">{sup.gstin}</span></div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Contact: {sup.contactPerson}</span>
                  <span className="font-semibold text-[#172B4D] tabular-nums">
                    Payable: {formatINRCompact(sup.pendingPayable)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Procurement Inspection & 5-Stage Approval Drawer */}
      <Sheet open={Boolean(activePR)} onOpenChange={(o) => !o && setSelectedPR(null)}>
        <SheetContent>
          {activePR && (
            <div className="space-y-5 pr-2">
              <div className="pr-8">
                <div className="text-xs font-mono text-[#64748B]">
                  {activePR.id} · {activePR.poNumber || 'PO Pending'} · {formatDateIN(activePR.requestedDate)}
                </div>
                <h2 className="text-lg font-semibold text-[#172B4D] mt-0.5">{activePR.materialName}</h2>
                <div className="mt-1">
                  <StatusText status={activePR.stage} />
                </div>
              </div>

              {/* 5-Stage Separation Governance Stepper */}
              <div className="p-3.5 border border-slate-200 rounded-md space-y-2.5 text-xs">
                <div className="font-semibold text-[#172B4D] flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#2563EB]" /> 5-Stage Verification Pipeline
                </div>
                <div className="space-y-2">
                  {[
                    { label: '1. Submitted by Site Supervisor / Requester', done: true },
                    { label: '2. Material Verified by Site Engineer (QC)', done: activePR.receiptVerifiedByEngineer },
                    { label: '3. Receipt Approved by Site Manager (Updates Inventory)', done: activePR.receiptApprovedBySiteManager },
                    { label: '4. Supplier & Invoice Checked by Procurement', done: activePR.stage === 'Procurement Checked' || activePR.stage === 'Finance Authorized' },
                    { label: '5. Payment Authorized by Finance', done: activePR.financeAuthorized },
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 ${s.done ? 'text-[#16A34A]' : 'text-slate-300'}`}
                      />
                      <span className={s.done ? 'text-[#172B4D] font-medium' : 'text-[#64748B]'}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commercial & Evidence Details */}
              <div className="p-3.5 border border-slate-200 rounded-md grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#64748B] block">Supplier</span>
                  <span className="font-medium text-[#172B4D]">{activePR.supplierName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Site</span>
                  <span className="font-medium text-[#172B4D]">{activePR.siteName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Quantity & Rate</span>
                  <span className="font-semibold tabular-nums">
                    {activePR.quantity} {activePR.unit} @ {formatINR(activePR.unitPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Total incl. {activePR.gstRatePct}% GST</span>
                  <span className="font-semibold text-[#172B4D] tabular-nums">{formatINR(activePR.totalWithTax)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#64748B] block">Invoice & Evidence</span>
                  <span className="text-[#172B4D] flex items-center gap-2 mt-0.5">
                    <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
                    {activePR.invoiceSubmitted ? `Tax Invoice ${activePR.invoiceNumber}` : 'Invoice Pending'} · Material Photo: {activePR.materialPhotoAttached ? 'Attached' : 'No'} · Delivery Photo: {activePR.deliveryPhotoAttached ? 'Attached' : 'No'}
                  </span>
                </div>
              </div>

              {activePR.notes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-[#64748B]">
                  {activePR.notes}
                </div>
              )}

              {nextActionForPR(activePR) && (
                <div className="space-y-2.5 pt-3 border-t border-slate-200">
                  <Input
                    value={stageNote}
                    onChange={(e) => setStageNote(e.target.value)}
                    placeholder="Add inspection / GRN / invoice verification remarks..."
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const action = nextActionForPR(activePR)!;
                        advanceProcurementStage(activePR.id, action.next, stageNote);
                        toast.success(`${activePR.id} advanced to ${action.next}`);
                        setSelectedPR(null);
                      }}
                    >
                      {nextActionForPR(activePR)!.label}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        advanceProcurementStage(activePR.id, 'Rejected', stageNote || 'Rejected during verification');
                        toast.error(`${activePR.id} rejected`);
                        setSelectedPR(null);
                      }}
                    >
                      Reject Request
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Purchase Request Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Material Purchase Request</DialogTitle>
            <DialogDescription>
              Submit a site material indent for engineering verification, receipt approval, and finance release.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePR} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium block mb-1">Project</label>
                <NativeSelect value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <label className="font-medium block mb-1">Delivery Site</label>
                <NativeSelect value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium block mb-1">Supplier</label>
                <NativeSelect value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <label className="font-medium block mb-1">Material Category</label>
                <NativeSelect value={materialCategory} onChange={(e) => setMaterialCategory(e.target.value)}>
                  <option value="Structural Steel & TMT">Structural Steel & TMT</option>
                  <option value="Cement & RMC">Cement & RMC</option>
                  <option value="Facade & Glazing">Facade & Glazing</option>
                  <option value="Hardware & Safety">Hardware & Safety</option>
                  <option value="Finishing Materials">Finishing Materials</option>
                </NativeSelect>
              </div>
            </div>

            <div>
              <label className="font-medium block mb-1">Material Description *</label>
              <Input
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder="e.g. Fe 550D TMT Rebar 16mm"
                required
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-medium block mb-1">Quantity</label>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              </div>
              <div>
                <label className="font-medium block mb-1">Unit</label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
              </div>
              <div>
                <label className="font-medium block mb-1">Unit Price (₹)</label>
                <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} />
              </div>
              <div>
                <label className="font-medium block mb-1">GST %</label>
                <Input type="number" value={gstRatePct} onChange={(e) => setGstRatePct(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <label className="font-medium block mb-1">Purchase / Dispatch Location</label>
              <Input value={purchaseLocation} onChange={(e) => setPurchaseLocation(e.target.value)} />
            </div>

            <div>
              <label className="font-medium block mb-1">Remarks</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery instructions or BOQ ref..." />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="text-xs font-semibold text-[#172B4D] tabular-nums">
                Est. Total: {formatINR(Math.round(quantity * unitPrice * (1 + gstRatePct / 100)))}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
