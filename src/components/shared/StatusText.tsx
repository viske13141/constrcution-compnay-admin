import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, MinusCircle, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_MAP: Record<string, StatusTone> = {
  Active: 'success',
  Operational: 'success',
  Present: 'success',
  Live: 'success',
  Verified: 'success',
  Completed: 'success',
  Approved: 'success',
  Paid: 'success',
  'Finance Authorized': 'success',
  Compliant: 'success',
  Available: 'info',
  'In Use': 'success',
  'In Progress': 'info',
  Planning: 'info',
  Mobilizing: 'info',
  Submitted: 'info',
  'Site Engineer Verified': 'info',
  'Site Manager Approved': 'info',
  'Procurement Checked': 'info',
  'Pending Approval': 'warning',
  'Pending Verification': 'warning',
  'Pending Review': 'warning',
  Pending: 'warning',
  Late: 'warning',
  'Inspection Due': 'warning',
  'Renewal Due': 'warning',
  'Action Due': 'warning',
  'Under Maintenance': 'warning',
  'On Leave': 'warning',
  'Offline Queued': 'warning',
  'Stale (>15m)': 'danger',
  Delayed: 'danger',
  'Safety Hold': 'danger',
  'Missing Checkout': 'danger',
  Absent: 'danger',
  Rejected: 'danger',
  Expired: 'danger',
  'Out of Service': 'danger',
  Urgent: 'danger',
  High: 'warning',
  Normal: 'neutral',
  Draft: 'neutral',
  Stopped: 'neutral',
  Exited: 'neutral',
  'On Hold': 'warning',
};

export function StatusText({ status, className }: { status: string; className?: string }) {
  const tone = TONE_MAP[status] || 'neutral';

  const colorClass =
    tone === 'success'
      ? 'text-[#16A34A]'
      : tone === 'warning'
      ? 'text-[#D97706]'
      : tone === 'danger'
      ? 'text-[#DC2626]'
      : tone === 'info'
      ? 'text-[#2563EB]'
      : 'text-[#64748B]';

  const Icon =
    tone === 'success'
      ? CheckCircle2
      : tone === 'warning'
      ? Clock
      : tone === 'danger'
      ? status === 'Rejected' || status === 'Absent' || status === 'Expired'
        ? XCircle
        : AlertTriangle
      : MinusCircle;

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap', colorClass, className)}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
