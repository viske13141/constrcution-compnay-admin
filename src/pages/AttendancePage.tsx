import React, { useMemo, useState } from 'react';
import { Camera, Check, MapPin, Shield, X } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatTile } from '@/src/components/shared/StatTile';
import { StatusText } from '@/src/components/shared/StatusText';
import { ColumnDef, DataTable } from '@/src/components/shared/DataTable';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Sheet, SheetContent } from '@/src/components/ui/sheet';
import { AttendanceRecord } from '@/src/types/erp';
import { toast } from 'sonner';

export function AttendancePage() {
  const {
    attendance,
    branches,
    projects,
    sites,
    selectedBranchId,
    resolveAttendanceException,
  } = useErpStore();

  const [projectFilter, setProjectFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('2026-11-18');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [exceptionNote, setExceptionNote] = useState('');

  const filtered = useMemo(() => {
    return attendance.filter((a) => {
      const mBranch = selectedBranchId === 'all' || a.branchId === selectedBranchId;
      const mPrj = projectFilter === 'all' || a.projectId === projectFilter;
      const mSite = siteFilter === 'all' || a.siteId === siteFilter;
      const mCat = categoryFilter === 'all' || a.category === categoryFilter;
      const mState = stateFilter === 'all' || a.state === stateFilter;
      return mBranch && mPrj && mSite && mCat && mState;
    });
  }, [attendance, selectedBranchId, projectFilter, siteFilter, categoryFilter, stateFilter]);

  const presentTotal = sites
    .filter((s) => selectedBranchId === 'all' || s.branchId === selectedBranchId)
    .reduce((acc, s) => acc + s.presentToday, 0);
  const activeSessions = sites
    .filter((s) => selectedBranchId === 'all' || s.branchId === selectedBranchId)
    .reduce((acc, s) => acc + s.activeTrackingSessions, 0);
  const pendingExceptions = attendance.filter(
    (a) => a.state === 'Pending Verification' || a.state === 'Missing Checkout'
  ).length;

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      key: 'emp',
      header: 'Worker',
      sortValue: (a) => a.employeeName,
      render: (a) => (
        <div>
          <div className="font-semibold text-[#172B4D]">{a.employeeName}</div>
          <div className="text-[11px] font-mono text-[#64748B]">
            {a.empCode} · {a.category}
          </div>
        </div>
      ),
    },
    {
      key: 'site',
      header: 'Site & Supervisor',
      render: (a) => (
        <div className="text-xs">
          <div className="font-medium text-[#172B4D]">{a.siteName}</div>
          <div className="text-[11px] text-[#64748B]">Sup: {a.supervisorName}</div>
        </div>
      ),
    },
    {
      key: 'timing',
      header: 'Check-In / Out',
      render: (a) => (
        <div className="text-xs font-mono tabular-nums">
          <div>In: {a.checkInTime || '—'}</div>
          <div className="text-[11px] text-[#64748B]">Out: {a.checkOutTime || 'Active'}</div>
        </div>
      ),
    },
    {
      key: 'verification',
      header: 'Selfie & Geofence',
      render: (a) => (
        <div className="text-xs">
          <span className={a.selfieVerified ? 'text-[#16A34A]' : 'text-[#DC2626]'}>
            {a.selfieVerified ? 'Selfie OK' : 'Pending Selfie'}
          </span>
          <div className="text-[11px] text-[#64748B] tabular-nums">
            {a.geofenceMatch ? 'Inside Geofence' : 'Outside Fence'} · ±{a.gpsAccuracyMeters}m
          </div>
        </div>
      ),
    },
    {
      key: 'tracking',
      header: 'Tracking Freshness',
      render: (a) => (
        <div>
          <StatusText status={a.trackingStatus} />
          <div className="text-[11px] text-[#64748B] mt-0.5">{a.lastLocationUpdate}</div>
        </div>
      ),
    },
    {
      key: 'state',
      header: 'Attendance Status',
      render: (a) => <StatusText status={a.state} />,
    },
  ];

  const activeRec = selectedRecord
    ? attendance.find((a) => a.id === selectedRecord.id) || selectedRecord
    : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance & Field Tracking"
        description="Company-wide muster roll, live selfie verification, geofence exceptions, and 5-minute active session telemetry."
      />

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatTile label="Present Today" value={presentTotal} comparison="Across active sites" trend="up" trendTone="positive" />
        <StatTile label="Absent / Leave" value={64} comparison="Approved + unscheduled" />
        <StatTile label="Late Arrivals" value={19} comparison=">15m past shift start" trendTone="warning" />
        <StatTile label="Missing Checkouts" value={7} comparison="Requires supervisor override" trendTone="negative" />
        <StatTile label="Pending Exceptions" value={pendingExceptions} comparison="Awaiting approval" trendTone="warning" />
        <StatTile label="Active GPS Sessions" value={activeSessions} comparison="5m ping target" trend="up" trendTone="positive" />
      </div>

      {/* Privacy & Access Control Notice */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-start gap-2.5 text-xs">
        <Shield className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-[#64748B]">
          <span className="font-semibold text-[#172B4D]">Location Privacy & RLS Enforcement: </span>
          Historical movement trails are restricted by branch/site scope and active shift window. Tracking starts strictly on check-in and stops on checkout; unauthorized admins cannot query unrestricted personal location histories.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        <NativeSelect value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
          <option value="all">All Sites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Worker Categories</option>
          <option value="Engineer">Engineer</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Foreman">Foreman</option>
          <option value="Skilled Labour">Skilled Labour</option>
          <option value="Unskilled Labour">Unskilled Labour</option>
          <option value="Machine Operator">Machine Operator</option>
          <option value="Driver">Driver</option>
          <option value="Contract Labour">Contract Labour</option>
        </NativeSelect>
        <NativeSelect value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          <option value="all">All Attendance States</option>
          <option value="Present">Present</option>
          <option value="Late">Late</option>
          <option value="Pending Verification">Pending Verification</option>
          <option value="Missing Checkout">Missing Checkout</option>
          <option value="Absent">Absent</option>
        </NativeSelect>
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(a) => a.id}
        onRowClick={(a) => {
          setExceptionNote('');
          setSelectedRecord(a);
        }}
      />

      {/* Attendance Inspection & Exception Resolution Drawer */}
      <Sheet open={Boolean(activeRec)} onOpenChange={(o) => !o && setSelectedRecord(null)}>
        <SheetContent>
          {activeRec && (
            <div className="space-y-4 pr-2">
              <div className="pr-8">
                <div className="text-xs font-mono text-[#64748B]">
                  {activeRec.empCode} · {activeRec.date}
                </div>
                <h2 className="text-lg font-semibold text-[#172B4D]">{activeRec.employeeName}</h2>
                <div className="mt-1">
                  <StatusText status={activeRec.state} />
                </div>
              </div>

              <div className="p-3.5 border border-slate-200 rounded-md space-y-2 text-xs">
                <div className="font-semibold text-[#172B4D]">Verification Evidence (Simulated)</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center gap-1.5 text-[#64748B]">
                      <Camera className="h-3.5 w-3.5" /> Live Selfie Check-In
                    </div>
                    <div className="mt-1 font-semibold text-[#172B4D]">
                      {activeRec.selfieVerified ? 'Matched (Confidence 98%)' : 'Flagged / Missing'}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center gap-1.5 text-[#64748B]">
                      <MapPin className="h-3.5 w-3.5" /> GPS Accuracy
                    </div>
                    <div className="mt-1 font-semibold text-[#172B4D] tabular-nums">
                      ±{activeRec.gpsAccuracyMeters}m ({activeRec.geofenceMatch ? 'Inside' : 'Outside'} Fence)
                    </div>
                  </div>
                </div>
                <div className="text-[#64748B] pt-1">
                  Tracking Freshness: <span className="font-medium text-[#172B4D]">{activeRec.trackingStatus}</span> · Last update: {activeRec.lastLocationUpdate} · Offline Queue: {activeRec.offlineQueueCount} pings
                </div>
              </div>

              {activeRec.exceptionReason && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-[#172B4D]">
                  <span className="font-semibold block">Exception Note</span>
                  {activeRec.exceptionReason}
                </div>
              )}

              <div className="space-y-2.5 pt-2 border-t border-slate-200">
                <label className="text-xs font-medium text-[#172B4D] block">
                  Admin / Site Manager Resolution Note
                </label>
                <Input
                  value={exceptionNote}
                  onChange={(e) => setExceptionNote(e.target.value)}
                  placeholder="Enter reason for manual attendance approval or rejection..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      resolveAttendanceException(activeRec.id, 'Approve', exceptionNote || 'Verified via site supervisor');
                      toast.success(`Attendance verified for ${activeRec.employeeName}`);
                      setSelectedRecord(null);
                    }}
                  >
                    <Check className="h-3.5 w-3.5" /> Approve Attendance
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      resolveAttendanceException(activeRec.id, 'Reject', exceptionNote || 'Outside permitted zone without authorization');
                      toast.error(`Exception rejected for ${activeRec.employeeName}`);
                      setSelectedRecord(null);
                    }}
                  >
                    <X className="h-3.5 w-3.5" /> Mark Absent
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
