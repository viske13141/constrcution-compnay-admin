import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { formatDateIN, formatINR, formatINRCompact } from '@/src/lib/format';
import { StatusText } from '@/src/components/shared/StatusText';
import { ResilientImage } from '@/src/components/shared/ResilientImage';
import { Button } from '@/src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { downloadCsv } from '@/src/lib/utils';
import { toast } from 'sonner';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, sites, employees, purchases, inventory, documents, activities } = useErpStore();

  const project = projects.find((p) => p.id === id) || projects[0];
  if (!project) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-sm font-medium text-[#172B4D]">Project not found.</p>
        <Button className="mt-3" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const projectSites = sites.filter((s) => s.projectId === project.id);
  const projectEmployees = employees.filter((e) => e.projectId === project.id);
  const projectPurchases = purchases.filter((pr) => pr.projectId === project.id);
  const projectInventory = inventory.filter((i) => i.projectName === project.name);
  const projectDocs = documents.filter((d) =>
    d.projectOrBranch.toLowerCase().includes(project.name.split(' ')[0].toLowerCase())
  );

  const budgetData = [
    { name: 'Labour', allocated: Math.round(project.labourBudget / 100000), spent: Math.round((project.actualSpent * 0.34) / 100000) },
    { name: 'Materials', allocated: Math.round(project.materialBudget / 100000), spent: Math.round((project.actualSpent * 0.54) / 100000) },
    { name: 'Equipment & Other', allocated: Math.round(project.otherBudget / 100000), spent: Math.round((project.actualSpent * 0.12) / 100000) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-4 w-4" /> All Projects
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              downloadCsv(
                `${project.code}-summary.csv`,
                ['Code', 'Name', 'Client', 'Status', 'Completion %', 'Approved Budget INR', 'Actual Spent INR'],
                [[project.code, project.name, project.clientName, project.status, project.completionPct, project.approvedBudget, project.actualSpent]]
              );
              toast.success('Project summary CSV downloaded');
            }}
          >
            Export Summary
          </Button>
          <Button size="sm" onClick={() => navigate('/sites?action=create')}>
            <Plus className="h-4 w-4" /> Add Site
          </Button>
        </div>
      </div>

      {/* Project Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-4 h-48 lg:h-auto bg-slate-100">
          <ResilientImage
            src={project.coverImage}
            alt={project.name}
            className="h-full w-full object-cover"
            fallbackLabel={project.code}
          />
        </div>
        <div className="lg:col-span-8 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-[#64748B]">
                {project.code} · {project.category}
              </span>
              <StatusText status={project.status} />
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-semibold text-[#172B4D]">{project.name}</h1>
            <p className="mt-1 text-xs sm:text-sm text-[#64748B]">{project.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-[#64748B] block">Client</span>
              <span className="font-semibold text-[#172B4D]">{project.clientName}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Project Manager</span>
              <span className="font-semibold text-[#172B4D]">{project.projectManagerName}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Schedule</span>
              <span className="font-medium text-[#172B4D] tabular-nums">
                {formatDateIN(project.startDate)} – {formatDateIN(project.targetCompletion)}
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block">Budget Utilized</span>
              <span className="font-semibold text-[#172B4D] tabular-nums">
                {formatINRCompact(project.actualSpent)} / {formatINRCompact(project.approvedBudget)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 10 Required Project Tabs */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sites">Sites ({projectSites.length})</TabsTrigger>
            <TabsTrigger value="workforce">Workforce ({projectEmployees.length})</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="procurement">Procurement ({projectPurchases.length})</TabsTrigger>
            <TabsTrigger value="inventory">Inventory ({projectInventory.length})</TabsTrigger>
            <TabsTrigger value="milestones">Milestones ({project.milestones.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({projectDocs.length})</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 border border-slate-200 rounded-md space-y-1">
                <span className="text-[#64748B]">Site Location</span>
                <div className="font-semibold text-[#172B4D]">{project.address}</div>
                <div className="text-[#64748B]">
                  {project.city}, {project.state} · Mock Pin {project.mockGps.lat}°N, {project.mockGps.lng}°E
                </div>
              </div>
              <div className="p-4 border border-slate-200 rounded-md space-y-1">
                <span className="text-[#64748B]">Leadership & Ownership</span>
                <div className="font-semibold text-[#172B4D]">PM: {project.projectManagerName}</div>
                <div className="text-[#64748B]">Eng Lead: {project.engineeringLeadName}</div>
              </div>
              <div className="p-4 border border-slate-200 rounded-md space-y-1">
                <span className="text-[#64748B]">Execution Metrics</span>
                <div className="font-semibold text-[#172B4D] tabular-nums">
                  {project.completionPct}% Physical Completion
                </div>
                <div className="text-[#64748B] tabular-nums">
                  {project.workforceCount} Total Workers · {project.siteCount} Active Sites
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sites" className="space-y-3">
            {projectSites.length === 0 ? (
              <p className="text-xs text-[#64748B]">No construction sites linked yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectSites.map((site) => (
                  <div
                    key={site.id}
                    onClick={() => navigate(`/sites/${site.id}`)}
                    className="p-4 border border-slate-200 rounded-md hover:border-[#2563EB]/60 cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#64748B]">{site.code}</span>
                      <StatusText status={site.status} />
                    </div>
                    <div className="text-sm font-semibold text-[#172B4D] flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#2563EB]" /> {site.name}
                    </div>
                    <div className="text-xs text-[#64748B]">
                      Site Manager: {site.siteManagerName} · Present Today: {site.presentToday}/{site.workforceCount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="workforce">
            <div className="divide-y divide-slate-100">
              {projectEmployees.map((emp) => (
                <div key={emp.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#172B4D]">{emp.fullName}</div>
                    <div className="text-[#64748B]">
                      {emp.empCode} · {emp.designation} · {emp.siteName}
                    </div>
                  </div>
                  <StatusText status={emp.status} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 border border-slate-200 rounded-md">
                <span className="text-[#64748B] block">Labour Budget</span>
                <span className="text-base font-semibold tabular-nums text-[#172B4D]">
                  {formatINR(project.labourBudget)}
                </span>
              </div>
              <div className="p-3.5 border border-slate-200 rounded-md">
                <span className="text-[#64748B] block">Material Budget</span>
                <span className="text-base font-semibold tabular-nums text-[#172B4D]">
                  {formatINR(project.materialBudget)}
                </span>
              </div>
              <div className="p-3.5 border border-slate-200 rounded-md">
                <span className="text-[#64748B] block">Other Expense Budget</span>
                <span className="text-base font-semibold tabular-nums text-[#172B4D]">
                  {formatINR(project.otherBudget)}
                </span>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`₹${v ?? 0} Lakhs`, '']} />
                  <Bar dataKey="allocated" name="Allocated (₹L)" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Actual Spent (₹L)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="procurement">
            <div className="divide-y divide-slate-100">
              {projectPurchases.map((pr) => (
                <div key={pr.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#172B4D]">
                      {pr.id} · {pr.materialName} ({pr.quantity} {pr.unit})
                    </div>
                    <div className="text-[#64748B]">
                      {pr.supplierName} · {pr.siteName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums">{formatINR(pr.totalWithTax)}</div>
                    <StatusText status={pr.stage} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="divide-y divide-slate-100">
              {projectInventory.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#172B4D]">{item.materialName}</div>
                    <div className="text-[#64748B]">{item.siteName}</div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="font-semibold">
                      {item.currentStock} {item.unit}
                    </div>
                    <div className="text-[#64748B]">Value: {formatINRCompact(item.totalValue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="milestones">
            <div className="space-y-2.5">
              {project.milestones.map((ms) => (
                <div key={ms.id} className="p-3 border border-slate-200 rounded-md flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-[#172B4D]">{ms.title}</div>
                    <div className="text-[#64748B]">Target: {formatDateIN(ms.targetDate)}</div>
                  </div>
                  <div className="text-right">
                    <StatusText status={ms.status} />
                    <div className="font-mono text-[#172B4D] mt-0.5 tabular-nums">{ms.completionPct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="divide-y divide-slate-100">
              {projectDocs.map((d) => (
                <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#172B4D]">{d.title}</div>
                    <div className="text-[#64748B]">
                      {d.category} · {d.version} · Owner: {d.ownerName}
                    </div>
                  </div>
                  <StatusText status={d.verificationStatus} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="p-4 border border-slate-200 rounded-md flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-[#172B4D]">Project Cost, Muster & Progress Dossier</div>
                <div className="text-[#64748B]">Export structured CSV report for {project.code}</div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  downloadCsv(
                    `${project.code}-report.csv`,
                    ['Project', 'Progress %', 'Budget INR', 'Actual INR', 'Sites', 'Workforce'],
                    [[project.name, project.completionPct, project.approvedBudget, project.actualSpent, project.siteCount, project.workforceCount]]
                  );
                  toast.success('Project report exported');
                }}
              >
                Download CSV
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="divide-y divide-slate-100">
              {activities.map((a) => (
                <div key={a.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#172B4D]">{a.actor}</span> · {a.summary}
                    <div className="text-[#64748B]">{a.detail}</div>
                  </div>
                  <span className="text-[#64748B]">{a.timestamp}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
