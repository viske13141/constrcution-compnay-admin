import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useErpStore } from '@/src/store/erpStore';
import { formatINR, formatINRCompact, formatNumberIN } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatTile } from '@/src/components/shared/StatTile';
import { StatusText } from '@/src/components/shared/StatusText';
import { Button } from '@/src/components/ui/button';
import { toast } from 'sonner';

export function HrPayrollPage({ mode = 'payroll' }: { mode?: 'hr' | 'payroll' }) {
  const navigate = useNavigate();
  const { payrollRuns, branches, projects, selectedBranchId, approvePayrollRun } = useErpStore();

  const filteredRuns = payrollRuns.filter((r) => selectedBranchId === 'all' || r.branchId === selectedBranchId);

  const totalPermanent = branches
    .filter((b) => selectedBranchId === 'all' || b.id === selectedBranchId)
    .reduce((acc, b) => acc + Math.round(b.workforceCount * 0.33), 0);
  const totalLabour = branches
    .filter((b) => selectedBranchId === 'all' || b.id === selectedBranchId)
    .reduce((acc, b) => acc + Math.round(b.workforceCount * 0.67), 0);

  const totalMonthlyPayroll = filteredRuns.reduce((a, r) => a + r.netPayable, 0);
  const totalOvertime = filteredRuns.reduce((a, r) => a + r.overtimeCost, 0);
  const totalAdvanceOutstanding = filteredRuns.reduce((a, r) => a + r.advanceOutstanding, 0);

  const projectLabourCost = projects.slice(0, 5).map((p) => ({
    name: p.code.replace('PRJ-', ''),
    labourCostL: Math.round((p.labourBudget * 0.14) / 100000),
    overtimeL: Math.round((p.labourBudget * 0.018) / 100000),
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title={mode === 'hr' ? 'HR Management Consolidated Overview' : 'Payroll Overview'}
        description="Consolidated Company Admin summary of headcount, labour wages, overtime, advances, compliance alerts, and branch payroll approvals."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate('/workforce')}>
              <Users className="h-4 w-4" /> Employee Directory
            </Button>
            <Button variant="secondary" onClick={() => navigate('/attendance')}>
              Muster & Attendance <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatTile label="Permanent Headcount" value={formatNumberIN(totalPermanent)} comparison="Staff, Engineers & Supervisors" />
        <StatTile label="Labour Workforce" value={formatNumberIN(totalLabour)} comparison="Daily-wage & contract muster" />
        <StatTile label="Monthly Payroll Cost" value={formatINRCompact(totalMonthlyPayroll)} comparison="Nov 2026 provisional" />
        <StatTile label="Overtime Cost" value={formatINRCompact(totalOvertime)} comparison="Night shifts & concrete pours" trendTone="warning" />
        <StatTile label="Advances Outstanding" value={formatINRCompact(totalAdvanceOutstanding)} comparison="Recoverable from wages" />
      </div>

      {/* Branch Payroll Runs */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#172B4D]">Branch Payroll Processing & Approval Status</h2>
            <p className="text-xs text-[#64748B]">Dedicated HR/Payroll modules sync provisional muster totals here for Company Admin sign-off</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredRuns.map((run) => (
            <div key={run.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-[#172B4D]">{run.branchName}</span>
                  <StatusText status={run.status} />
                </div>
                <div className="text-xs text-[#64748B] tabular-nums">
                  {run.monthLabel} · {run.permanentCount} Permanent + {run.labourCount} Labour · Overtime: {formatINR(run.overtimeCost)} · Advance Deducted: {formatINR(run.advanceDeductions)}
                </div>
                {run.complianceAlerts.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    {run.complianceAlerts.map((al, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[11px] text-[#D97706]">
                        <AlertCircle className="h-3 w-3 shrink-0" /> {al}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
                <div className="text-left lg:text-right">
                  <div className="text-[11px] text-[#64748B]">Net Payable</div>
                  <div className="text-base font-semibold text-[#172B4D] tabular-nums">{formatINR(run.netPayable)}</div>
                </div>
                {run.status === 'Pending Approval' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      approvePayrollRun(run.id);
                      toast.success(`Approved payroll run for ${run.branchName}`);
                    }}
                  >
                    <Check className="h-3.5 w-3.5" /> Approve Run
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project-wise Labour & Overtime Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-3">
        <div>
          <h2 className="text-base font-semibold text-[#172B4D]">Project-wise Monthly Labour & Overtime Cost (₹ Lakhs)</h2>
          <p className="text-xs text-[#64748B]">Allocated labour spend across active sites</p>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectLabourCost} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip formatter={(val) => [`₹${val ?? 0} L`, '']} />
              <Bar dataKey="labourCostL" name="Base Labour Cost (₹L)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="overtimeL" name="Overtime Cost (₹L)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
