import React, { useState } from 'react';
import { Lock, Plus, ShieldCheck } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Checkbox } from '@/src/components/ui/switch-checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { PermissionAction, PermissionScope } from '@/src/types/erp';
import { toast } from 'sonner';

const ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
const MODULES = [
  { key: 'Projects', label: 'Projects' },
  { key: 'Sites', label: 'Construction Sites' },
  { key: 'Workforce', label: 'Workforce & PII' },
  { key: 'Attendance', label: 'Attendance & GPS' },
  { key: 'Procurement', label: 'Procurement & Receipts' },
  { key: 'FinancePayroll', label: 'Finance & Payroll' },
  { key: 'Documents', label: 'Documents & Contracts' },
];
const SCOPES: PermissionScope[] = [
  'Company',
  'Branch',
  'Department',
  'Project',
  'Site',
  'Assigned Employees',
];

export function RolesPermissionsPage() {
  const { roles, toggleRolePermission, updateRoleScope, addCustomRole } = useErpStore();
  const [selectedRoleId, setSelectedRoleId] = useState(roles[1]?.id || roles[0]?.id);
  const [createOpen, setCreateOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customScope, setCustomScope] = useState<PermissionScope>('Project');

  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Roles & Permissions Matrix"
        description="Configure role-based access control across 10 default construction roles and custom roles with branch, department, project, and site scopes."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create Custom Role
          </Button>
        }
      />

      {/* Backend RLS Governance Notice */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-start gap-2.5 text-xs">
        <Lock className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-[#64748B]">
          <span className="font-semibold text-[#172B4D]">Backend Security & Supabase RLS Architecture: </span>
          Financial ledgers, salary figures, and employee statutory documents (Aadhaar/PAN/Bank) are enforced via Supabase Row Level Security policies tied to JWT role claims and assigned branch/project/site IDs—never solely via hidden frontend UI controls.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Role List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {roles.map((r) => {
            const isSelected = r.id === activeRole.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoleId(r.id)}
                className={`w-full text-left p-3.5 transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#2563EB]/6' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${isSelected ? 'text-[#2563EB]' : 'text-[#172B4D]'}`}>
                    {r.name}
                  </span>
                  <span className="text-[11px] font-mono text-[#64748B] tabular-nums">
                    {r.userCount} users
                  </span>
                </div>
                <div className="text-xs text-[#64748B] mt-0.5 line-clamp-2">{r.description}</div>
                <div className="text-[11px] text-[#2563EB] mt-1 font-medium">
                  Scope: {r.scope} · {r.isSystemDefault ? 'System Role' : 'Custom Role'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Permission Matrix */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                <h2 className="text-base font-semibold text-[#172B4D]">{activeRole.name}</h2>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">{activeRole.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#64748B]">Access Scope:</span>
              <NativeSelect
                value={activeRole.scope}
                onChange={(e) => {
                  updateRoleScope(activeRole.id, e.target.value as PermissionScope);
                  toast.success(`Updated scope for ${activeRole.name}`);
                }}
                className="w-44"
              >
                {SCOPES.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2.5 font-semibold text-[#64748B]">Module</th>
                  {ACTIONS.map((act) => (
                    <th key={act} className="px-3 py-2.5 text-center font-semibold text-[#64748B] capitalize">
                      {act}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MODULES.map((mod) => (
                  <tr key={mod.key} className="hover:bg-slate-50/50">
                    <td className="px-3 py-3 font-medium text-[#172B4D]">{mod.label}</td>
                    {ACTIONS.map((act) => {
                      const checked = activeRole.permissions[mod.key]?.[act] ?? false;
                      return (
                        <td key={act} className="px-3 py-3 text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => {
                                toggleRolePermission(activeRole.id, mod.key, act);
                                toast.success(`${activeRole.name}: ${mod.label} (${act}) updated`);
                              }}
                              aria-label={`${activeRole.name} ${mod.label} ${act}`}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Access Role</DialogTitle>
            <DialogDescription>Define a custom RBAC profile independent of HR job designations.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-medium block mb-1">Role Name *</label>
              <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Regional Quantity Surveyor" />
            </div>
            <div>
              <label className="font-medium block mb-1">Description</label>
              <Input value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} placeholder="Scope and responsibility summary" />
            </div>
            <div>
              <label className="font-medium block mb-1">Data Access Scope</label>
              <NativeSelect value={customScope} onChange={(e) => setCustomScope(e.target.value as PermissionScope)}>
                {SCOPES.map((sc) => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!customName.trim()) return;
                  addCustomRole(customName, customDesc || 'Custom company operational role', customScope);
                  toast.success(`Custom role "${customName}" created`);
                  setCreateOpen(false);
                  setCustomName('');
                  setCustomDesc('');
                }}
              >
                Create Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
