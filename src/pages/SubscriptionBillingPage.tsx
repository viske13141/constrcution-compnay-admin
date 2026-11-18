import React from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { SUBSCRIPTION_PLANS } from '@/src/data/mockErpData';
import { formatDateIN, formatINR } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatusText } from '@/src/components/shared/StatusText';
import { Button } from '@/src/components/ui/button';
import { downloadCsv } from '@/src/lib/utils';
import { toast } from 'sonner';

export function SubscriptionBillingPage() {
  const { selectedPlanId, changeSubscriptionPlan, branches, projects, sites, billingInvoices } = useErpStore();

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[2];
  const usedEmployees = branches.reduce((a, b) => a + b.workforceCount, 0);
  const usedProjects = projects.length;
  const usedSites = sites.length;
  const usedStorageGb = 342;

  const meters = [
    { label: 'Active Workforce Seats', used: usedEmployees, limit: currentPlan.employeeLimit, unit: 'workers' },
    { label: 'Projects Capacity', used: usedProjects, limit: currentPlan.projectLimit, unit: 'projects' },
    { label: 'Construction Sites', used: usedSites, limit: currentPlan.siteLimit, unit: 'sites' },
    { label: 'R2 Document & Selfie Storage', used: usedStorageGb, limit: currentPlan.storageLimitGb, unit: 'GB' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Subscription & Billing"
        description="Monitor active workspace entitlement consumption, renewal schedule, invoices, and plan tier configurations."
      />

      {/* Current Plan & Renewal Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs text-[#64748B]">Active Subscription Tier</div>
            <h2 className="text-xl font-semibold text-[#172B4D]">{currentPlan.name} Plan</h2>
            <div className="text-xs text-[#64748B] mt-0.5">
              {currentPlan.configuredPriceLabel} · Next Renewal: 01 Apr 2027 · Payment Status:{' '}
              <StatusText status="Paid" className="inline-flex" />
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              downloadCsv(
                'BuildFlow-Billing-History.csv',
                ['Invoice No', 'Date', 'Plan', 'Amount INR', 'Status'],
                billingInvoices.map((i) => [i.invoiceNumber, i.date, i.planName, i.amount, i.status])
              );
              toast.success('Billing history exported');
            }}
          >
            <Download className="h-4 w-4" /> Export Billing History
          </Button>
        </div>

        {/* Dynamic Usage Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {meters.map((m) => {
            const pct = Math.min(100, Math.round((m.used / m.limit) * 100));
            return (
              <div key={m.label} className="p-3.5 rounded-md border border-slate-200 space-y-2">
                <div className="text-xs font-medium text-[#64748B]">{m.label}</div>
                <div className="text-base font-semibold text-[#172B4D] tabular-nums">
                  {m.used} <span className="text-xs font-normal text-[#64748B]">/ {m.limit} {m.unit}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Comparison Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = plan.id === selectedPlanId;
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-lg p-5 border flex flex-col justify-between space-y-4 ${
                isCurrent ? 'border-[#2563EB] ring-1 ring-[#2563EB]' : 'border-slate-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[#172B4D]">{plan.name}</h3>
                  {isCurrent && <span className="text-xs font-semibold text-[#2563EB]">Current</span>}
                </div>
                <p className="text-xs text-[#64748B]">{plan.targetAudience}</p>
                <div className="text-sm font-semibold text-[#172B4D] pt-1">{plan.configuredPriceLabel}</div>
                <div className="text-[11px] text-[#64748B]">
                  Up to {plan.employeeLimit} workers · {plan.projectLimit} projects · {plan.siteLimit} sites · {plan.storageLimitGb} GB
                </div>
                <ul className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-[#172B4D]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant={isCurrent ? 'secondary' : 'default'}
                disabled={isCurrent}
                onClick={() => {
                  changeSubscriptionPlan(plan.id);
                  toast.success(`Switched workspace configuration to ${plan.name}`);
                }}
              >
                {isCurrent ? 'Active Configuration' : `Switch to ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Billing History */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 text-sm font-semibold text-[#172B4D]">
          Billing Invoices
        </div>
        <div className="divide-y divide-slate-100">
          {billingInvoices.map((inv) => (
            <div key={inv.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-mono font-semibold text-[#172B4D]">{inv.invoiceNumber}</span>
                <span className="text-[#64748B] ml-2">· {formatDateIN(inv.date)} · {inv.planName}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold tabular-nums">{formatINR(inv.amount)}</span>
                <StatusText status={inv.status} />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    downloadCsv(
                      `${inv.invoiceNumber}.csv`,
                      ['Invoice', 'Date', 'Description', 'Amount INR', 'Status'],
                      [[inv.invoiceNumber, inv.date, inv.planName, inv.amount, inv.status]]
                    );
                    toast.success(`Downloaded ${inv.invoiceNumber}`);
                  }}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
