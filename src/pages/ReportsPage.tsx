import React, { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useErpStore } from '@/src/store/erpStore';
import { formatINR } from '@/src/lib/format';
import { downloadCsv } from '@/src/lib/utils';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { toast } from 'sonner';

const REPORT_TYPES = [
  'Company Workforce',
  'Employee Headcount',
  'Attendance',
  'Project Progress',
  'Site Performance',
  'Labour Cost',
  'Payroll',
  'Procurement',
  'Material Consumption',
  'Inventory',
  'Contractor Expenses',
  'Equipment Utilization',
  'Project Budget',
  'Safety Incidents',
] as const;

export function ReportsPage() {
  const { projects, sites, employees, branches, departments, payrollRuns, purchases, inventory, assets, contractors } =
    useErpStore();

  const [selectedReport, setSelectedReport] = useState<(typeof REPORT_TYPES)[number]>('Project Budget');
  const [branchFilter, setBranchFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('2026-10-01');
  const [dateTo, setDateTo] = useState('2026-11-18');

  const dataset = useMemo(() => {
    if (selectedReport === 'Project Budget' || selectedReport === 'Project Progress') {
      const list = projects.filter(
        (p) => (branchFilter === 'all' || p.branchId === branchFilter) && (projectFilter === 'all' || p.id === projectFilter)
      );
      return {
        headers: ['Project Code', 'Project Name', 'Progress %', 'Approved Budget (INR)', 'Actual Spent (INR)', 'Status'],
        rows: list.map((p) => [p.code, p.name, p.completionPct, p.approvedBudget, p.actualSpent, p.status]),
        chart: list.map((p) => ({ name: p.code.replace('PRJ-', ''), value: Math.round(p.actualSpent / 100000) })),
        chartUnit: '₹ Lakhs Spent',
      };
    }
    if (selectedReport === 'Site Performance' || selectedReport === 'Attendance') {
      const list = sites.filter((s) => branchFilter === 'all' || s.branchId === branchFilter);
      return {
        headers: ['Site Code', 'Site Name', 'Manager', 'Workforce', 'Present Today', 'Active GPS Sessions', 'Status'],
        rows: list.map((s) => [s.code, s.name, s.siteManagerName, s.workforceCount, s.presentToday, s.activeTrackingSessions, s.status]),
        chart: list.map((s) => ({ name: s.code.replace('SITE-', ''), value: s.presentToday })),
        chartUnit: 'Workers Present',
      };
    }
    if (selectedReport === 'Payroll' || selectedReport === 'Labour Cost') {
      const list = payrollRuns.filter((r) => branchFilter === 'all' || r.branchId === branchFilter);
      return {
        headers: ['Branch', 'Month', 'Permanent', 'Labour', 'Overtime (INR)', 'Net Payable (INR)', 'Status'],
        rows: list.map((r) => [r.branchName, r.monthLabel, r.permanentCount, r.labourCount, r.overtimeCost, r.netPayable, r.status]),
        chart: list.map((r) => ({ name: r.branchName.split(' ')[0], value: Math.round(r.netPayable / 100000) })),
        chartUnit: '₹ Lakhs Net Payroll',
      };
    }
    if (selectedReport === 'Procurement') {
      return {
        headers: ['PR ID', 'Material', 'Supplier', 'Site', 'Qty', 'Total INR', 'Stage'],
        rows: purchases.map((p) => [p.id, p.materialName, p.supplierName, p.siteName, `${p.quantity} ${p.unit}`, p.totalWithTax, p.stage]),
        chart: purchases.map((p) => ({ name: p.id.slice(-3), value: Math.round(p.totalWithTax / 100000) })),
        chartUnit: '₹ Lakhs PO Value',
      };
    }
    if (selectedReport === 'Inventory' || selectedReport === 'Material Consumption') {
      return {
        headers: ['SKU', 'Material', 'Site', 'Current Stock', 'Reorder Level', 'Total Value (INR)'],
        rows: inventory.map((i) => [i.sku, i.materialName, i.siteName, `${i.currentStock} ${i.unit}`, i.reorderLevel, i.totalValue]),
        chart: inventory.map((i) => ({ name: i.sku, value: Math.round(i.totalValue / 100000) })),
        chartUnit: '₹ Lakhs Stock Value',
      };
    }
    if (selectedReport === 'Equipment Utilization') {
      return {
        headers: ['Asset Code', 'Equipment', 'Assigned Site', 'Hours (Month)', 'Daily Cost (INR)', 'Status'],
        rows: assets.map((a) => [a.assetCode, a.name, a.assignedSiteName, a.hoursLoggedMonth, a.dailyRunningCost, a.status]),
        chart: assets.map((a) => ({ name: a.assetCode, value: a.hoursLoggedMonth })),
        chartUnit: 'Monthly Operating Hours',
      };
    }
    if (selectedReport === 'Contractor Expenses') {
      return {
        headers: ['Code', 'Contractor', 'Trade', 'Workers', 'Contract Value (INR)', 'Billed (INR)', 'Retention (INR)'],
        rows: contractors.map((c) => [c.code, c.companyName, c.tradeSpecialty, c.deployedWorkers, c.contractValue, c.billedToDate, c.retentionHeld]),
        chart: contractors.map((c) => ({ name: c.code, value: Math.round(c.billedToDate / 100000) })),
        chartUnit: '₹ Lakhs Billed',
      };
    }
    // Workforce / Headcount / Safety fallback
    return {
      headers: ['Emp Code', 'Name', 'Category', 'Designation', 'Site', 'Status'],
      rows: employees.map((e) => [e.empCode, e.fullName, e.category, e.designation, e.siteName, e.status]),
      chart: departments.map((d) => ({ name: d.code, value: d.employeeCount })),
      chartUnit: 'Headcount',
    };
  }, [selectedReport, branchFilter, projectFilter, projects, sites, payrollRuns, purchases, inventory, assets, contractors, employees, departments]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports & Analytics Centre"
        description="14 enterprise operational, workforce, procurement, safety, and budget analytics with authorized CSV, Excel-compatible, and PDF print exports."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                downloadCsv(`BuildFlow-${selectedReport.replace(/\s+/g, '-')}.csv`, dataset.headers, dataset.rows);
                toast.success(`${selectedReport} exported as CSV`);
              }}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                downloadCsv(`BuildFlow-${selectedReport.replace(/\s+/g, '-')}-Excel.csv`, dataset.headers, dataset.rows);
                toast.success(`${selectedReport} Excel-compatible sheet exported`);
              }}
            >
              Export Excel (.csv)
            </Button>
            <Button
              size="sm"
              onClick={() => {
                window.print();
              }}
            >
              <Printer className="h-4 w-4" /> Print / PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Report Catalog */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg p-2 space-y-0.5">
          <div className="px-3 py-2 text-xs font-semibold text-[#64748B]">Report Definitions (14)</div>
          {REPORT_TYPES.map((rep) => (
            <button
              key={rep}
              type="button"
              onClick={() => setSelectedReport(rep)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedReport === rep
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#172B4D] hover:bg-slate-50'
              }`}
            >
              {rep}
            </button>
          ))}
        </div>

        {/* Right Analytics Preview */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <NativeSelect value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </NativeSelect>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#172B4D]">{selectedReport} Report</h2>
                <p className="text-xs text-[#64748B]">
                  {dataset.chartUnit} · {dateFrom} to {dateTo}
                </p>
              </div>
              <span className="text-xs font-mono text-[#64748B]">{dataset.rows.length} records</span>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataset.chart} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip />
                  <Bar dataKey="value" name={dataset.chartUnit} fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {dataset.headers.map((h) => (
                    <th key={h} className="px-4 py-2.5 font-semibold text-[#64748B] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataset.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2.5 tabular-nums text-[#172B4D] whitespace-nowrap">
                        {typeof cell === 'number' && dataset.headers[ci]?.includes('INR')
                          ? formatINR(cell)
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
