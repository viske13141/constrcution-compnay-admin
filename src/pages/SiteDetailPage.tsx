import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Info, ShieldAlert } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { formatDateIN, formatINR, formatINRCompact } from '@/src/lib/format';
import { StatusText } from '@/src/components/shared/StatusText';
import { SiteGeofenceMap } from '@/src/components/shared/SiteGeofenceMap';
import { Button } from '@/src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Switch } from '@/src/components/ui/switch-checkbox';
import { Input } from '@/src/components/ui/input';
import { downloadCsv } from '@/src/lib/utils';
import { toast } from 'sonner';

export function SiteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    sites,
    projects,
    employees,
    attendance,
    purchases,
    inventory,
    financialRecords,
    documents,
    updateSiteAttendanceConfig,
  } = useErpStore();

  const site = sites.find((s) => s.id === id) || sites[0];
  const [radiusInput, setRadiusInput] = useState(site?.geofenceRadiusMeters ?? 250);

  if (!site) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-sm">Site not found.</p>
        <Button className="mt-3" onClick={() => navigate('/sites')}>
          Back to Sites
        </Button>
      </div>
    );
  }

  const parentProject = projects.find((p) => p.id === site.projectId);
  const siteEmployees = employees.filter((e) => e.siteId === site.id);
  const siteAttendance = attendance.filter((a) => a.siteId === site.id);
  const sitePurchases = purchases.filter((pr) => pr.siteId === site.id);
  const siteInventory = inventory.filter((i) => i.siteId === site.id);
  const siteExpenses = financialRecords.filter((f) =>
    f.siteName.toLowerCase().includes(site.name.split(' ')[0].toLowerCase())
  );
  const siteDocs = documents.filter((d) =>
    d.projectOrBranch.toLowerCase().includes(site.name.split(' ')[0].toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/sites')}>
          <ArrowLeft className="h-4 w-4" /> All Sites
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            downloadCsv(
              `${site.code}-daily-site-report.csv`,
              ['Site Code', 'Site Name', 'Status', 'Workforce', 'Present Today', 'Active GPS Sessions', 'Offline Queue'],
              [[site.code, site.name, site.status, site.workforceCount, site.presentToday, site.activeTrackingSessions, site.offlineQueuedUpdates]]
            );
            toast.success('Site daily report exported');
          }}
        >
          Export Site Report
        </Button>
      </div>

      {/* Site Summary Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-[#64748B]">
              {site.code} · {parentProject?.name}
            </div>
            <h1 className="mt-0.5 text-xl sm:text-2xl font-semibold text-[#172B4D]">{site.name}</h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              {site.address} · Shift: {site.shiftConfig}
            </p>
          </div>
          <StatusText status={site.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[#64748B] block">Site Manager</span>
            <span className="font-semibold text-[#172B4D]">{site.siteManagerName}</span>
          </div>
          <div>
            <span className="text-[#64748B] block">Site Engineer</span>
            <span className="font-semibold text-[#172B4D]">{site.siteEngineerName}</span>
          </div>
          <div>
            <span className="text-[#64748B] block">Present / Crew</span>
            <span className="font-semibold text-[#172B4D] tabular-nums">
              {site.presentToday} / {site.workforceCount}
            </span>
          </div>
          <div>
            <span className="text-[#64748B] block">Active 5m Trackers</span>
            <span className="font-semibold text-[#2563EB] tabular-nums">{site.activeTrackingSessions}</span>
          </div>
          <div>
            <span className="text-[#64748B] block">Offline Queue / Stale</span>
            <span className="font-semibold text-[#D97706] tabular-nums">
              {site.offlineQueuedUpdates} queued · {site.staleTrackers} stale
            </span>
          </div>
        </div>
      </div>

      {/* 12 Required Site Operational Tabs */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">1. Overview</TabsTrigger>
            <TabsTrigger value="workforce">2. Workforce</TabsTrigger>
            <TabsTrigger value="attendance">3. Attendance</TabsTrigger>
            <TabsTrigger value="location">4. Live Location</TabsTrigger>
            <TabsTrigger value="assignments">5. Work Assignments</TabsTrigger>
            <TabsTrigger value="receipts">6. Material Receipts</TabsTrigger>
            <TabsTrigger value="inventory">7. Inventory</TabsTrigger>
            <TabsTrigger value="purchases">8. Purchases</TabsTrigger>
            <TabsTrigger value="expenses">9. Expenses</TabsTrigger>
            <TabsTrigger value="safety">10. Safety</TabsTrigger>
            <TabsTrigger value="documents">11. Documents</TabsTrigger>
            <TabsTrigger value="reports">12. Site Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 border border-slate-200 rounded-md space-y-2">
                <div className="font-semibold text-[#172B4D]">Schedule & Geofence</div>
                <div className="text-[#64748B]">
                  Start: {formatDateIN(site.startDate)} · Expected End: {formatDateIN(site.expectedCompletion)}
                </div>
                <div className="text-[#64748B]">
                  Simulated Coordinates: {site.mockGps.lat}°N, {site.mockGps.lng}°E · Geofence Radius: {site.geofenceRadiusMeters}m
                </div>
              </div>
              <div className="p-4 border border-slate-200 rounded-md space-y-2">
                <div className="font-semibold text-[#172B4D]">Active Site Alerts</div>
                {site.alerts.length === 0 ? (
                  <div className="text-[#16A34A]">No active operational alerts on this site.</div>
                ) : (
                  <ul className="space-y-1 text-[#DC2626] list-disc pl-4">
                    {site.alerts.map((al, i) => (
                      <li key={i}>{al}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Attendance Policy Configuration */}
            <div className="p-4 border border-slate-200 rounded-md space-y-3">
              <div className="text-sm font-semibold text-[#172B4D]">Site Attendance & Tracking Rules</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <label className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span>Live Selfie Check-in</span>
                  <Switch
                    checked={site.selfieCheckInRequired}
                    onCheckedChange={(val) =>
                      updateSiteAttendanceConfig(site.id, {
                        selfieCheckInRequired: val,
                        selfieCheckOutRequired: site.selfieCheckOutRequired,
                        geofenceStrictMode: site.geofenceStrictMode,
                        geofenceRadiusMeters: site.geofenceRadiusMeters,
                      })
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span>Live Selfie Check-out</span>
                  <Switch
                    checked={site.selfieCheckOutRequired}
                    onCheckedChange={(val) =>
                      updateSiteAttendanceConfig(site.id, {
                        selfieCheckInRequired: site.selfieCheckInRequired,
                        selfieCheckOutRequired: val,
                        geofenceStrictMode: site.geofenceStrictMode,
                        geofenceRadiusMeters: site.geofenceRadiusMeters,
                      })
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span>Strict Geofence Block</span>
                  <Switch
                    checked={site.geofenceStrictMode}
                    onCheckedChange={(val) =>
                      updateSiteAttendanceConfig(site.id, {
                        selfieCheckInRequired: site.selfieCheckInRequired,
                        selfieCheckOutRequired: site.selfieCheckOutRequired,
                        geofenceStrictMode: val,
                        geofenceRadiusMeters: site.geofenceRadiusMeters,
                      })
                    }
                  />
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={radiusInput}
                    onChange={(e) => setRadiusInput(Number(e.target.value))}
                    className="h-9"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      updateSiteAttendanceConfig(site.id, {
                        selfieCheckInRequired: site.selfieCheckInRequired,
                        selfieCheckOutRequired: site.selfieCheckOutRequired,
                        geofenceStrictMode: site.geofenceStrictMode,
                        geofenceRadiusMeters: radiusInput,
                      });
                      toast.success('Geofence radius updated');
                    }}
                  >
                    Save m
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workforce">
            <div className="divide-y divide-slate-100">
              {siteEmployees.map((emp) => (
                <div key={emp.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#172B4D]">{emp.fullName}</div>
                    <div className="text-[#64748B]">
                      {emp.empCode} · {emp.category} · {emp.designation}
                    </div>
                  </div>
                  <StatusText status={emp.status} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <div className="divide-y divide-slate-100">
              {siteAttendance.map((a) => (
                <div key={a.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-semibold text-[#172B4D]">{a.employeeName}</div>
                    <div className="text-[#64748B]">
                      Check-in: {a.checkInTime || '—'} · Selfie: {a.selfieVerified ? 'Verified' : 'Unverified'} · Accuracy: {a.gpsAccuracyMeters}m
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusText status={a.trackingStatus} />
                    <StatusText status={a.state} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md flex items-start gap-2.5 text-xs">
              <Info className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div className="space-y-1 text-[#64748B]">
                <div className="font-semibold text-[#172B4D]">
                  Tracking Architecture (Capacitor Android & iOS Constraints)
                </div>
                <p>
                  Location tracking starts strictly after verified check-in, targets a 5-minute sync interval, queues pings locally in SQLite during basement/dead-zone offline periods, and stops automatically upon checkout. Stale pings (&gt;15m) are highlighted clearly. Map coordinates shown below are simulated mock coordinates.
                </p>
              </div>
            </div>
            <SiteGeofenceMap sites={[site]} attendance={siteAttendance} selectedSiteId={site.id} />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-2.5">
            {site.assignments.length === 0 ? (
              <p className="text-xs text-[#64748B]">No active work packages logged for this site.</p>
            ) : (
              site.assignments.map((wa) => (
                <div key={wa.id} className="p-3.5 border border-slate-200 rounded-md flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-[#172B4D]">{wa.title}</div>
                    <div className="text-[#64748B]">
                      {wa.zone} · Supervisor: {wa.supervisorName} · Crew: {wa.crewSize}
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusText status={wa.status} />
                    <div className="font-mono font-semibold mt-0.5 tabular-nums">{wa.progressPct}%</div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="receipts">
            <div className="divide-y divide-slate-100">
              {sitePurchases.map((pr) => (
                <div key={pr.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#172B4D]">
                      {pr.id} · {pr.materialName} ({pr.quantity} {pr.unit})
                    </div>
                    <div className="text-[#64748B]">
                      Eng Verified: {pr.receiptVerifiedByEngineer ? 'Yes' : 'No'} · SM Approved: {pr.receiptApprovedBySiteManager ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <StatusText status={pr.stage} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="divide-y divide-slate-100">
              {siteInventory.map((inv) => (
                <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#172B4D]">{inv.materialName}</div>
                    <div className="text-[#64748B]">SKU: {inv.sku} · Reorder: {inv.reorderLevel} {inv.unit}</div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="font-semibold">{inv.currentStock} {inv.unit}</div>
                    <div className="text-[#64748B]">{formatINRCompact(inv.totalValue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="purchases">
            <div className="divide-y divide-slate-100">
              {sitePurchases.map((pr) => (
                <div key={pr.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#172B4D]">{pr.materialName}</div>
                    <div className="text-[#64748B]">{pr.supplierName} · Invoice: {pr.invoiceNumber || 'Pending'}</div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="font-semibold">{formatINR(pr.totalWithTax)}</div>
                    <StatusText status={pr.stage} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <div className="divide-y divide-slate-100">
              {siteExpenses.length === 0 ? (
                <p className="text-xs text-[#64748B]">No direct site expenses recorded this period.</p>
              ) : (
                siteExpenses.map((ex) => (
                  <div key={ex.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-[#172B4D]">{ex.party}</div>
                      <div className="text-[#64748B]">{ex.type} · {ex.reference}</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-semibold">{formatINR(ex.amount)}</div>
                      <StatusText status={ex.paymentStatus} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="safety" className="space-y-2.5">
            {site.safetyLogs.length === 0 ? (
              <p className="text-xs text-[#64748B]">No safety incidents logged.</p>
            ) : (
              site.safetyLogs.map((log) => (
                <div key={log.id} className="p-3 border border-slate-200 rounded-md flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-[#172B4D]">{log.type} · {formatDateIN(log.date)}</div>
                      <div className="text-[#64748B] mt-0.5">{log.summary}</div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">Reported by {log.reportedBy}</div>
                    </div>
                  </div>
                  <StatusText status={log.status === 'Open' ? 'Safety Hold' : 'Completed'} />
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="documents">
            <div className="divide-y divide-slate-100">
              {siteDocs.length === 0 ? (
                <p className="text-xs text-[#64748B]">No site-specific documents uploaded yet.</p>
              ) : (
                siteDocs.map((doc) => (
                  <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-[#172B4D]">{doc.title}</div>
                      <div className="text-[#64748B]">{doc.category} · {doc.version}</div>
                    </div>
                    <StatusText status={doc.verificationStatus} />
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="p-4 border border-slate-200 rounded-md flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-[#172B4D]">Daily Site Progress & Muster Report</div>
                <div className="text-[#64748B]">Includes attendance, safety logs, and stock consumption for {site.code}</div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  downloadCsv(
                    `${site.code}-report.csv`,
                    ['Site', 'Present', 'Workforce', 'Active Trackers', 'Offline Queue'],
                    [[site.name, site.presentToday, site.workforceCount, site.activeTrackingSessions, site.offlineQueuedUpdates]]
                  );
                  toast.success('Site report CSV downloaded');
                }}
              >
                Download CSV
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
