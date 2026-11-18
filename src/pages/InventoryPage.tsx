import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, PackageCheck, Search } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { formatINR, formatINRCompact } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatTile } from '@/src/components/shared/StatTile';
import { StatusText } from '@/src/components/shared/StatusText';
import { ColumnDef, DataTable } from '@/src/components/shared/DataTable';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { InventoryItem } from '@/src/types/erp';
import { toast } from 'sonner';

export function InventoryPage() {
  const { inventory, stockMovements, sites, purchases, issueOrTransferStock } = useErpStore();

  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [actionItem, setActionItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'Site Issue' | 'Inter-Site Transfer' | 'Damaged/Rejected'>('Site Issue');
  const [qty, setQty] = useState(5);
  const [targetSite, setTargetSite] = useState('Site Work Zone A');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventory.filter((item) => {
      const mSite = siteFilter === 'all' || item.siteId === siteFilter;
      const mQ =
        !q ||
        item.materialName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.siteName.toLowerCase().includes(q);
      return mSite && mQ;
    });
  }, [inventory, siteFilter, search]);

  const totalStockValue = inventory.reduce((a, i) => a + i.totalValue, 0);
  const lowStockCount = inventory.filter((i) => i.currentStock <= i.reorderLevel).length;
  const pendingDeliveries = purchases.filter((p) => !p.receiptApprovedBySiteManager).length;
  const rejectedQty = inventory.reduce((a, i) => a + i.damagedOrRejectedQty, 0);

  const columns: ColumnDef<InventoryItem>[] = [
    {
      key: 'mat',
      header: 'Material & SKU',
      sortValue: (i) => i.materialName,
      render: (i) => (
        <div>
          <div className="font-semibold text-[#172B4D]">{i.materialName}</div>
          <div className="text-[11px] font-mono text-[#64748B]">
            {i.sku} · {i.category}
          </div>
        </div>
      ),
    },
    {
      key: 'site',
      header: 'Site Store',
      render: (i) => (
        <div className="text-xs max-w-[210px]">
          <div className="font-medium text-[#172B4D] truncate">{i.siteName}</div>
          <div className="text-[11px] text-[#64748B] truncate">{i.preferredSupplier}</div>
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Available Stock',
      align: 'right',
      sortValue: (i) => i.currentStock,
      render: (i) => {
        const isLow = i.currentStock <= i.reorderLevel;
        return (
          <div className="tabular-nums">
            <span className={`font-semibold ${isLow ? 'text-[#DC2626]' : 'text-[#172B4D]'}`}>
              {i.currentStock} {i.unit}
            </span>
            <div className="text-[11px] text-[#64748B]">Min: {i.reorderLevel}</div>
          </div>
        );
      },
    },
    {
      key: 'pending',
      header: 'Pending / Damaged',
      align: 'right',
      render: (i) => (
        <div className="text-xs tabular-nums">
          <span className="text-[#2563EB]">+{i.pendingDeliveryQty} in transit</span>
          {i.damagedOrRejectedQty > 0 && (
            <div className="text-[#DC2626]">{i.damagedOrRejectedQty} damaged/rej</div>
          )}
        </div>
      ),
    },
    {
      key: 'value',
      header: 'Stock Value',
      align: 'right',
      sortValue: (i) => i.totalValue,
      render: (i) => <span className="font-semibold tabular-nums">{formatINR(i.totalValue)}</span>,
    },
    {
      key: 'action',
      header: 'Stock Control',
      align: 'right',
      render: (i) => (
        <Button
          size="sm"
          variant="secondary"
          className="h-7 px-2.5 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setActionItem(i);
            setQty(Math.min(5, i.currentStock));
            setMovementType('Site Issue');
            setTargetSite('Work Package Consumption');
          }}
        >
          <ArrowLeftRight className="h-3 w-3" /> Issue / Transfer
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory & Site Stock"
        description="Multi-site material catalog, stock levels, consumption issues, inter-site transfers, and damaged stock quarantine."
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatTile label="Material Categories" value={new Set(inventory.map((i) => i.category)).size} comparison="Active SKUs across sites" />
        <StatTile label="Total Stock Value" value={formatINRCompact(totalStockValue)} comparison="Verified site stores" trend="up" trendTone="positive" />
        <StatTile label="Low Stock SKUs" value={lowStockCount} comparison="Below reorder level" trendTone={lowStockCount > 0 ? 'negative' : 'positive'} />
        <StatTile label="Pending Deliveries" value={pendingDeliveries} comparison="Awaiting receipt verification" trendTone="warning" />
        <StatTile label="Damaged / Rejected" value={rejectedQty} comparison="Quarantined units" trendTone="negative" />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center gap-2.5 text-xs text-[#64748B]">
        <PackageCheck className="h-4 w-4 text-[#16A34A] shrink-0" />
        <span>
          <strong className="text-[#172B4D]">Stock Integrity Guard:</strong> Site stock increases strictly when a Purchase Request reaches <em>Site Manager Approved</em> receipt verification in Procurement.
        </span>
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Site Stock Ledger ({inventory.length})</TabsTrigger>
          <TabsTrigger value="movements">Stock History & Transfers ({stockMovements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search material, SKU, site..."
                className="pl-9"
              />
            </div>
            <NativeSelect value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="sm:w-64">
              <option value="all">All Construction Sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <DataTable data={filtered} columns={columns} keyExtractor={(i) => i.id} />
        </TabsContent>

        <TabsContent value="movements">
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {stockMovements.map((m) => (
              <div key={m.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-semibold text-[#172B4D]">
                    {m.materialName} · <span className="font-mono">{m.quantity} {m.unit}</span>
                  </div>
                  <div className="text-[#64748B] mt-0.5">
                    {m.fromSite} → {m.toSite} · Auth: {m.authorizedBy} · Ref: {m.referenceId}
                  </div>
                </div>
                <div className="sm:text-right">
                  <StatusText status={m.type === 'Damaged/Rejected' ? 'Rejected' : 'Verified'} />
                  <div className="text-[11px] text-[#64748B] mt-0.5">{m.date}</div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Issue / Transfer / Reject Modal */}
      <Dialog open={Boolean(actionItem)} onOpenChange={(o) => !o && setActionItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Movement — {actionItem?.materialName}</DialogTitle>
            <DialogDescription>
              Available at {actionItem?.siteName}: {actionItem?.currentStock} {actionItem?.unit}
            </DialogDescription>
          </DialogHeader>
          {actionItem && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium block mb-1">Movement Type</label>
                <NativeSelect
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as typeof movementType)}
                >
                  <option value="Site Issue">Issue for Site Consumption</option>
                  <option value="Inter-Site Transfer">Transfer to Another Site</option>
                  <option value="Damaged/Rejected">Mark Damaged / Rejected</option>
                </NativeSelect>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium block mb-1">Quantity ({actionItem.unit})</label>
                  <Input
                    type="number"
                    min={1}
                    max={actionItem.currentStock}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="font-medium block mb-1">Destination / Work Zone</label>
                  <Input value={targetSite} onChange={(e) => setTargetSite(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button variant="secondary" onClick={() => setActionItem(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (qty <= 0 || qty > actionItem.currentStock) {
                      toast.error('Invalid quantity');
                      return;
                    }
                    issueOrTransferStock({
                      inventoryId: actionItem.id,
                      type: movementType,
                      quantity: qty,
                      targetSiteName: targetSite,
                    });
                    toast.success(`${movementType} recorded for ${qty} ${actionItem.unit}`);
                    setActionItem(null);
                  }}
                >
                  Confirm Movement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
