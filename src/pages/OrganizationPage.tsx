import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Info, Plus, Users } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { formatINRCompact } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { EmployeeCategory } from '@/src/types/erp';
import { toast } from 'sonner';

export function OrganizationPage({
  defaultTab = 'structure',
}: {
  defaultTab?: 'structure' | 'branches' | 'departments' | 'designations';
}) {
  const navigate = useNavigate();
  const {
    branches,
    departments,
    designations,
    employees,
    settings,
    addBranch,
    addDepartment,
    addDesignation,
  } = useErpStore();

  const [branchModal, setBranchModal] = useState(false);
  const [deptModal, setDeptModal] = useState(false);
  const [desModal, setDesModal] = useState(false);

  const [brName, setBrName] = useState('');
  const [brCode, setBrCode] = useState('');
  const [brCity, setBrCity] = useState('');
  const [brState, setBrState] = useState('');
  const [brHead, setBrHead] = useState('');

  const [dpName, setDpName] = useState('');
  const [dpCode, setDpCode] = useState('');
  const [dpHead, setDpHead] = useState('');
  const [dpBranch, setDpBranch] = useState(branches[0]?.id || 'br-mum');

  const [dsTitle, setDsTitle] = useState('');
  const [dsGrade, setDsGrade] = useState('L4');
  const [dsDept, setDsDept] = useState(departments[0]?.name || '');
  const [dsCat, setDsCat] = useState<EmployeeCategory>('Engineer');

  return (
    <div className="space-y-5">
      <PageHeader
        title="Company Organization & Structure"
        description="Configure multi-branch structure, departments, job designations (kept separate from RBAC permissions), and multi-manager reporting lines."
        actions={
          <Button variant="secondary" onClick={() => navigate('/roles')}>
            Manage System Roles & Permissions
          </Button>
        }
      />

      <Tabs defaultValue={defaultTab} key={defaultTab}>
        <TabsList>
          <TabsTrigger value="structure">Company Structure & Org Chart</TabsTrigger>
          <TabsTrigger value="branches">Branches ({branches.length})</TabsTrigger>
          <TabsTrigger value="departments">Departments ({departments.length})</TabsTrigger>
          <TabsTrigger value="designations">Designations ({designations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-4">
          <div className="p-3.5 bg-white border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs text-[#64748B]">
            <Info className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[#172B4D]">Multi-Matrix Reporting Model:</strong> Construction personnel may report concurrently to a <em>Department Head</em> (functional), a <em>Project Manager</em> (delivery), and an operational <em>Site Manager</em> (on-site muster & safety). Job designations remain decoupled from RBAC system permissions.
            </span>
          </div>

          {/* Organizational Tree Visualization */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
            <div className="max-w-md mx-auto p-4 rounded-lg bg-[#101F35] text-white text-center">
              <div className="text-[11px] text-slate-300">{settings.cin}</div>
              <div className="text-base font-semibold mt-0.5">{settings.companyName}</div>
              <div className="text-xs text-[#F59E0B] mt-1">Company Admin: Vikramaditya Deshmukh</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {branches.map((br) => {
                const brDepts = departments.filter((d) => d.branchId === br.id);
                return (
                  <div key={br.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/40">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#2563EB] font-semibold">{br.code}</span>
                      <span className="text-xs text-[#64748B] tabular-nums">{br.workforceCount} staff</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#172B4D]">{br.name}</div>
                      <div className="text-xs text-[#64748B]">Branch Head: {br.branchHead}</div>
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      {brDepts.map((d) => (
                        <div key={d.id} className="p-2 bg-white border border-slate-200 rounded text-xs">
                          <div className="font-medium text-[#172B4D]">{d.name}</div>
                          <div className="text-[11px] text-[#64748B]">
                            Head: {d.headName} · {d.employeeCount} crew
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Matrix Reporting Table Sample */}
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-[#172B4D] mb-2">Active Multi-Manager Employee Relationships</h3>
              <div className="border border-slate-200 rounded-md divide-y divide-slate-100">
                {employees.slice(0, 5).map((e) => (
                  <div key={e.id} className="p-3 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-[#172B4D]">{e.fullName}</span>
                      <div className="text-[11px] text-[#64748B]">{e.designation}</div>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Department Manager</span>
                      <span className="font-medium">{e.reportingManager}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Project Manager</span>
                      <span className="font-medium">{e.projectManager || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Operational Site Manager</span>
                      <span className="font-medium">{e.siteManager || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setBranchModal(true)}>
              <Plus className="h-4 w-4" /> Add Branch
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div key={b.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-[#2563EB]">{b.code}</span>
                  {b.isHeadquarters && <span className="font-semibold text-[#F59E0B]">Headquarters</span>}
                </div>
                <div className="text-sm font-semibold text-[#172B4D] flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-[#64748B]" /> {b.name}
                </div>
                <div className="text-[#64748B]">{b.address}</div>
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <span>Head: {b.branchHead}</span>
                  <span className="font-semibold tabular-nums">{b.workforceCount} workers</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setDeptModal(true)}>
              <Plus className="h-4 w-4" /> Add Department
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d) => (
              <div key={d.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono text-[#64748B]">
                  <span>{d.code}</span>
                  <span className="tabular-nums">{d.employeeCount} members</span>
                </div>
                <div className="text-sm font-semibold text-[#172B4D]">{d.name}</div>
                <div className="text-[#64748B]">Department Head: <span className="text-[#172B4D] font-medium">{d.headName}</span></div>
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <span className="text-[#64748B]">Annual Budget</span>
                  <span className="font-semibold tabular-nums">{formatINRCompact(d.budgetAllocated)}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="designations" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setDesModal(true)}>
              <Plus className="h-4 w-4" /> Add Designation
            </Button>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {designations.map((ds) => (
              <div key={ds.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#172B4D]">{ds.title}</div>
                  <div className="text-[#64748B]">
                    Grade {ds.grade} · {ds.departmentName} · Category: {ds.category}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 font-semibold text-[#172B4D] tabular-nums">
                  <Users className="h-3.5 w-3.5 text-[#64748B]" /> {ds.headcount}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Branch Modal */}
      <Dialog open={branchModal} onOpenChange={setBranchModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Regional Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="font-medium block mb-1">Branch Name</label>
                <Input value={brName} onChange={(e) => setBrName(e.target.value)} placeholder="e.g. Hyderabad Regional" />
              </div>
              <div>
                <label className="font-medium block mb-1">Code</label>
                <Input value={brCode} onChange={(e) => setBrCode(e.target.value)} placeholder="HYD-REG" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium block mb-1">City</label>
                <Input value={brCity} onChange={(e) => setBrCity(e.target.value)} />
              </div>
              <div>
                <label className="font-medium block mb-1">State</label>
                <Input value={brState} onChange={(e) => setBrState(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="font-medium block mb-1">Branch Head</label>
              <Input value={brHead} onChange={(e) => setBrHead(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setBranchModal(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!brName.trim()) return;
                  addBranch({
                    code: brCode || 'BR-NEW',
                    name: brName,
                    city: brCity || 'Hyderabad',
                    state: brState || 'Telangana',
                    address: `${brCity}, ${brState}`,
                    branchHead: brHead || 'Vikramaditya Deshmukh',
                    phone: '+91 40 4001 2200',
                  });
                  toast.success(`Branch ${brName} added`);
                  setBranchModal(false);
                  setBrName('');
                }}
              >
                Create Branch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Department Modal */}
      <Dialog open={deptModal} onOpenChange={setDeptModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="font-medium block mb-1">Department Name</label>
                <Input value={dpName} onChange={(e) => setDpName(e.target.value)} placeholder="e.g. Quality Control & Testing" />
              </div>
              <div>
                <label className="font-medium block mb-1">Code</label>
                <Input value={dpCode} onChange={(e) => setDpCode(e.target.value)} placeholder="QA-LAB" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium block mb-1">Branch</label>
                <NativeSelect value={dpBranch} onChange={(e) => setDpBranch(e.target.value)}>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <label className="font-medium block mb-1">Department Head</label>
                <Input value={dpHead} onChange={(e) => setDpHead(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setDeptModal(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!dpName.trim()) return;
                  addDepartment({
                    code: dpCode || 'DEPT-NEW',
                    name: dpName,
                    branchId: dpBranch,
                    headEmployeeId: 'emp-002',
                    headName: dpHead || 'Arvind Subramanian',
                    budgetAllocated: 15000000,
                  });
                  toast.success(`Department ${dpName} created`);
                  setDeptModal(false);
                  setDpName('');
                }}
              >
                Create Department
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Designation Modal */}
      <Dialog open={desModal} onOpenChange={setDesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Job Designation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="font-medium block mb-1">Designation Title</label>
                <Input value={dsTitle} onChange={(e) => setDsTitle(e.target.value)} placeholder="e.g. Quantity Surveyor" />
              </div>
              <div>
                <label className="font-medium block mb-1">Grade</label>
                <Input value={dsGrade} onChange={(e) => setDsGrade(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium block mb-1">Department</label>
                <NativeSelect value={dsDept} onChange={(e) => setDsDept(e.target.value)}>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <label className="font-medium block mb-1">Workforce Category</label>
                <NativeSelect value={dsCat} onChange={(e) => setDsCat(e.target.value as EmployeeCategory)}>
                  <option value="Engineer">Engineer</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Office Employee">Office Employee</option>
                  <option value="Skilled Labour">Skilled Labour</option>
                </NativeSelect>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setDesModal(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!dsTitle.trim()) return;
                  addDesignation({ title: dsTitle, grade: dsGrade, departmentName: dsDept, category: dsCat });
                  toast.success(`Designation ${dsTitle} added`);
                  setDesModal(false);
                  setDsTitle('');
                }}
              >
                Save Designation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
