import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useErpStore } from '@/src/store/erpStore';
import { formatDateIN, formatINR, formatINRCompact } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatTile } from '@/src/components/shared/StatTile';
import { StatusText } from '@/src/components/shared/StatusText';
import { ColumnDef, DataTable } from '@/src/components/shared/DataTable';
import { NativeSelect } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { downloadCsv } from '@/src/lib/utils';
import { FinancialRecord } from '@/src/types/erp';
import { toast } from 'sonner';

export function FinancePage() {
  const { financialRecords, projects, payrollRuns } = useErpStore();
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  const filtered = useMemo(() => {
    return financialRecords.filter((f) => {
      const mType = typeFilter === 'all' || f.type === typeFilter;
      const mPrj = projectFilter === 'all' || f.projectId === projectFilter;
      return mType && mPrj;
    });
  }, [financialRecords, typeFilter, projectFilter]);

  // Distinct financial buckets per Part 14 requirement
  const payrollLiabilities = payrollRuns.reduce((a, r) => a + r.netPayable, 0);
  const approvedPayments = financialRecords
    .filter((f) => f.paymentStatus === 'Approved')
    .reduce((a, f) => a + f.amount, 0);
  const actualBankPayments = financialRecords
    .filter((f) => f.paymentStatus === 'Paid')
    .reduce((a, f) => a + f.amount, 0);
  const pendingSupplierInvoices = financialRecords
    .filter((f) => f.type === 'Pending Supplier Invoice')
    .reduce((a, f) => a + f.amount, 0);
  const outstandingAdvances = payrollRuns.reduce((a, r) => a + r.advanceOutstanding, 0);

  const projectBudgetChart = projects.map((p) => ({
    name: p.code.replace('PRJ-', ''),
    budgetCr: Number((p.approvedBudget / 10000000).toFixed(2)),
    actualCr: Number((p.actualSpent / 10000000).toFixed(2)),
  }));

  const columns: ColumnDef<FinancialRecord>[] = [
    {
      key: 'ref',
      header: 'Reference & Date',
      sortValue: (f) => f.date,
      render: (f) => (
        <div>
          <div className="font-mono text-xs font-semibold text-[#172B4D]">{f.reference}</div>
          <div className="text-[11px] text-[#64748B]">{formatDateIN(f.date)}</div>
        </div>
      ),
    },
    {
      key: 'bucket',
      header: 'Financial Bucket',
      sortValue: (f) => f.type,
      render: (f) => <span className="text-xs font-medium text-[#172B4D]">{f.type}</span>,
    },
    {
      key: 'party',
      header: 'Party / Description',
      render: (f) => (
        <div className="text-xs max-w-[220px]">
          <div className="font-medium text-[#172B4D] truncate">{f.party}</div>
          <div className="text-[11px] text-[#64748B] truncate">
            {f.projectName} · {f.siteName}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount (INR)',
      align: 'right',
      sortValue: (f) => f.amount,
      render: (f) => <span className="font-semibold tabular-nums">{formatINR(f.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Payment Status',
      render: (f) => <StatusText status={f.paymentStatus} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Finance & Expense Operations"
        description="Consolidated project budgets vs actuals, strictly separating payroll liabilities, approved payments, actual bank settlements, supplier invoices, and advances."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              downloadCsv(
                'buildflow-financial-ledger.csv',
                ['Date', 'Reference', 'Bucket', 'Party', 'Project', 'Amount INR', 'Status'],
                filtered.map((f) => [f.date, f.reference, f.type, f.party, f.projectName, f.amount, f.paymentStatus])
              );
              toast.success('Financial ledger exported to CSV');
            }}
          >
            Export Ledger CSV
          </Button>
        }
      />

      {/* Separated Financial Liability & Cashflow Buckets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatTile label="Payroll Liabilities" value={formatINRCompact(payrollLiabilities)} comparison="Accrued Nov 2026" />
        <StatTile label="Approved Payments" value={formatINRCompact(approvedPayments)} comparison="Cleared for bank batch" trendTone="positive" />
        <StatTile label="Actual Bank Payments" value={formatINRCompact(actualBankPayments)} comparison="Settled NEFT / RTGS" trendTone="positive" />
        <StatTile label="Pending Supplier Invoices" value={formatINRCompact(pendingSupplierInvoices)} comparison="Awaiting 3-way match" trendTone="warning" />
        <StatTile label="Outstanding Advances" value={formatINRCompact(outstandingAdvances)} comparison="Staff & labour advances" />
      </div>

      {/* Budget vs Actual Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-3">
        <div>
          <h2 className="text-base font-semibold text-[#172B4D]">Project-wise Approved Budget vs Actual Spent (₹ Crores)</h2>
          <p className="text-xs text-[#64748B]">Includes labour, materials, contractor RA bills, and site equipment costs</p>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectBudgetChart} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip formatter={(val) => [`₹${val ?? 0} Cr`, '']} />
              <Bar dataKey="budgetCr" name="Approved Budget (₹Cr)" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actualCr" name="Actual Spent (₹Cr)" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter & Ledger */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row gap-2.5">
        <NativeSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="sm:w-64">
          <option value="all">All Financial Buckets</option>
          <option value="Payroll Liability">Payroll Liability</option>
          <option value="Approved Payment">Approved Payment</option>
          <option value="Bank Payment">Bank Payment</option>
          <option value="Pending Supplier Invoice">Pending Supplier Invoice</option>
          <option value="Contractor Bill">Contractor Bill</option>
          <option value="Employee Reimbursement">Employee Reimbursement</option>
          <option value="Site Expense">Site Expense</option>
        </NativeSelect>
        <NativeSelect value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="sm:w-64">
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </NativeSelect>
      </div>

      <DataTable data={filtered} columns={columns} keyExtractor={(f) => f.id} />
    </div>
  );
}
