import React, { useMemo, useState } from 'react';
import { Check, CheckCircle2, Clock, X, XCircle } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { formatINR } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatTile } from '@/src/components/shared/StatTile';
import { StatusText } from '@/src/components/shared/StatusText';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Sheet, SheetContent } from '@/src/components/ui/sheet';
import { ApprovalCategory, ApprovalItem } from '@/src/types/erp';
import { toast } from 'sonner';

const CATEGORIES: ApprovalCategory[] = [
  'Employee Onboarding',
  'Employee Transfer',
  'Attendance Correction',
  'Leave',
  'Overtime',
  'Purchase Request',
  'Material Receipt',
  'Expense Claim',
  'Contractor Invoice',
  'Payroll',
  'Financial Payment',
];

export function ApprovalsPage() {
  const { approvals, selectedBranchId, processApproval } = useErpStore();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected' | 'all'>('Pending');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  const filtered = useMemo(() => {
    return approvals.filter((a) => {
      const mBranch = selectedBranchId === 'all' || a.branchId === selectedBranchId;
      const mCat = categoryFilter === 'all' || a.category === categoryFilter;
      const mStatus = statusFilter === 'all' || a.status === statusFilter;
      const mPrio = priorityFilter === 'all' || a.priority === priorityFilter;
      return mBranch && mCat && mStatus && mPrio;
    });
  }, [approvals, selectedBranchId, categoryFilter, statusFilter, priorityFilter]);

  const pendingCount = approvals.filter((a) => a.status === 'Pending').length;
  const urgentCount = approvals.filter((a) => a.status === 'Pending' && a.priority === 'Urgent').length;

  const activeItem = selectedItem ? approvals.find((a) => a.id === selectedItem.id) || selectedItem : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Central Approval Centre"
        description="Unified multi-stage approval queue for onboarding, transfers, attendance exceptions, procurement, receipts, payroll, and contractor invoices."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Pending Approvals" value={pendingCount} comparison="Awaiting action" trendTone={pendingCount > 0 ? 'warning' : 'positive'} />
        <StatTile label="Urgent Priority" value={urgentCount} comparison="Payroll & critical deliveries" trendTone={urgentCount > 0 ? 'negative' : 'positive'} />
        <StatTile label="Approved (Session)" value={approvals.filter((a) => a.status === 'Approved').length} comparison="Logged to Audit Trail" trendTone="positive" />
        <StatTile label="Rejected" value={approvals.filter((a) => a.status === 'Rejected').length} comparison="Returned to requester" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <NativeSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All 11 Approval Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
        </NativeSelect>
        <NativeSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
        >
          <option value="Pending">Pending Only</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="all">All Statuses</option>
        </NativeSelect>
      </div>

      {/* Responsive Approval Cards List (optimized for both desktop & mobile) */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-[#64748B]">
            No approval requests match your active filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setDecisionNote('');
                setSelectedItem(item);
              }}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:border-[#2563EB]/60 transition-colors cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                    <span className="font-mono font-semibold text-[#172B4D]">{item.id}</span>
                    <span>·</span>
                    <span>{item.category}</span>
                    <span>·</span>
                    <StatusText status={item.priority} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#172B4D]">{item.title}</h3>
                  <div className="text-xs text-[#64748B]">
                    Requester: <span className="text-[#172B4D] font-medium">{item.requesterName}</span> ({item.requesterRole}) · Submitted {item.submittedAt}
                    {item.siteName ? ` · ${item.siteName}` : ''}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  {item.amount ? (
                    <div className="text-sm font-semibold text-[#172B4D] tabular-nums">
                      {formatINR(item.amount)}
                    </div>
                  ) : null}
                  <StatusText status={item.status} />
                </div>
              </div>

              {item.status === 'Pending' && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-[#64748B] truncate max-w-xl">
                    Evidence: {item.evidenceSummary}
                  </span>
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setDecisionNote('');
                        setSelectedItem(item);
                      }}
                    >
                      Review Stages
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => {
                        processApproval(item.id, 'Approved', 'Approved by Company Admin');
                        toast.success(`Approved ${item.id}`);
                      }}
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Multi-Stage Approval Detail Drawer */}
      <Sheet open={Boolean(activeItem)} onOpenChange={(o) => !o && setSelectedItem(null)}>
        <SheetContent>
          {activeItem && (
            <div className="space-y-5 pr-2">
              <div className="pr-8">
                <div className="text-xs font-mono text-[#64748B]">
                  {activeItem.id} · {activeItem.category}
                </div>
                <h2 className="text-lg font-semibold text-[#172B4D] mt-0.5">{activeItem.title}</h2>
                <div className="mt-1 flex items-center gap-3">
                  <StatusText status={activeItem.status} />
                  {activeItem.amount && (
                    <span className="text-sm font-semibold tabular-nums">{formatINR(activeItem.amount)}</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 border border-slate-200 rounded-md space-y-1.5 text-xs">
                <div className="font-semibold text-[#172B4D]">Evidence & Context</div>
                <p className="text-[#64748B] leading-relaxed">{activeItem.evidenceSummary}</p>
                {activeItem.projectName && (
                  <div className="text-[#172B4D] pt-1">
                    Project: {activeItem.projectName} · Site: {activeItem.siteName}
                  </div>
                )}
              </div>

              {/* Multi-Stage Workflow Stepper */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#172B4D]">Multi-Stage Approval History</div>
                <div className="border border-slate-200 rounded-md divide-y divide-slate-100">
                  {activeItem.history.map((h, i) => (
                    <div key={i} className="p-3 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2">
                        {h.decision === 'Approved' || h.decision === 'Verified' || h.decision === 'Submitted' ? (
                          <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                        ) : h.decision === 'Rejected' ? (
                          <XCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold text-[#172B4D]">{h.stage}</div>
                          <div className="text-[#64748B]">
                            {h.actor} · {h.decision}
                          </div>
                          {h.note && <div className="text-[#172B4D] mt-0.5 italic">"{h.note}"</div>}
                        </div>
                      </div>
                      <span className="text-[11px] text-[#64748B] shrink-0">{h.timestamp || 'Pending'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {activeItem.status === 'Pending' && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <label className="text-xs font-medium text-[#172B4D] block">
                    Decision Remarks / Audit Reason
                  </label>
                  <Input
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    placeholder="Enter approval remarks or rejection reason..."
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="success"
                      className="flex-1"
                      onClick={() => {
                        processApproval(activeItem.id, 'Approved', decisionNote || 'Verified and approved by Company Admin');
                        toast.success(`${activeItem.id} approved`);
                        setSelectedItem(null);
                      }}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        if (!decisionNote.trim()) {
                          toast.error('Provide a rejection reason for the audit log');
                          return;
                        }
                        processApproval(activeItem.id, 'Rejected', decisionNote);
                        toast.error(`${activeItem.id} rejected`);
                        setSelectedItem(null);
                      }}
                    >
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
