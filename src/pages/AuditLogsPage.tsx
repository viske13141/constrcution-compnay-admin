import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { ColumnDef, DataTable } from '@/src/components/shared/DataTable';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { downloadCsv } from '@/src/lib/utils';
import { AuditLogEntry } from '@/src/types/erp';
import { toast } from 'sonner';

export function AuditLogsPage() {
  const { auditLogs } = useErpStore();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const modules = Array.from(new Set(auditLogs.map((a) => a.module)));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditLogs.filter((a) => {
      const mMod = moduleFilter === 'all' || a.module === moduleFilter;
      const mQ =
        !q ||
        a.action.toLowerCase().includes(q) ||
        a.userName.toLowerCase().includes(q) ||
        a.recordId.toLowerCase().includes(q) ||
        (a.reason || '').toLowerCase().includes(q);
      return mMod && mQ;
    });
  }, [auditLogs, moduleFilter, search]);

  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortValue: (a) => a.timestamp,
      render: (a) => <span className="font-mono text-xs text-[#64748B] tabular-nums">{a.timestamp}</span>,
    },
    {
      key: 'user',
      header: 'User & Role',
      render: (a) => (
        <div className="text-xs">
          <div className="font-semibold text-[#172B4D]">{a.userName}</div>
          <div className="text-[11px] text-[#64748B]">{a.userRole}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action & Module',
      render: (a) => (
        <div className="text-xs">
          <div className="font-medium text-[#172B4D]">{a.action}</div>
          <div className="text-[11px] font-mono text-[#2563EB]">
            {a.module} · {a.recordId}
          </div>
        </div>
      ),
    },
    {
      key: 'diff',
      header: 'Previous → New Value',
      render: (a) => (
        <div className="text-xs max-w-[260px]">
          {a.previousValue && <span className="text-[#64748B] line-through mr-1.5">{a.previousValue}</span>}
          {a.newValue && <span className="font-medium text-[#172B4D]">{a.newValue}</span>}
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason / Remarks',
      render: (a) => <span className="text-xs text-[#64748B]">{a.reason || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Administrative Audit Logs"
        description="Immutable ledger of workforce changes, wage revisions, role permission edits, project/site creation, procurement approvals, and settings updates."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              downloadCsv(
                'BuildFlow-Audit-Logs.csv',
                ['Timestamp', 'User', 'Role', 'Module', 'Record ID', 'Action', 'Previous', 'New', 'Reason'],
                filtered.map((a) => [a.timestamp, a.userName, a.userRole, a.module, a.recordId, a.action, a.previousValue || '', a.newValue || '', a.reason || ''])
              );
              toast.success('Audit log exported');
            }}
          >
            Export Audit CSV
          </Button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, action, record ID, reason..."
            className="pl-9"
          />
        </div>
        <NativeSelect value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="sm:w-52">
          <option value="all">All Modules</option>
          {modules.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </NativeSelect>
      </div>

      <DataTable data={filtered} columns={columns} keyExtractor={(a) => a.id} pageSize={10} />
    </div>
  );
}
