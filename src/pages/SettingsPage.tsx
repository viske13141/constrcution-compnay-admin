import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Switch } from '@/src/components/ui/switch-checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { toast } from 'sonner';

export function SettingsPage() {
  const { settings, updateSettings } = useErpStore();
  const [formState, setFormState] = useState(settings);

  const handleSave = () => {
    updateSettings(formState);
    toast.success('Company settings saved and logged to Audit Trail');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Company Settings"
        description="Configure company legal profile, currency, financial year, working calendar, notifications, security policies, and document retention."
        actions={
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Company Profile</TabsTrigger>
            <TabsTrigger value="locale">Locale, FY & Calendar</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security & Retention</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-medium block mb-1">Company Display Name</label>
                <Input
                  value={formState.companyName}
                  onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
                />
              </div>
              <div>
                <label className="font-medium block mb-1">Legal Entity Name</label>
                <Input
                  value={formState.legalEntityName}
                  onChange={(e) => setFormState({ ...formState, legalEntityName: e.target.value })}
                />
              </div>
              <div>
                <label className="font-medium block mb-1">GSTIN</label>
                <Input
                  value={formState.gstin}
                  onChange={(e) => setFormState({ ...formState, gstin: e.target.value })}
                />
              </div>
              <div>
                <label className="font-medium block mb-1">CIN</label>
                <Input
                  value={formState.cin}
                  onChange={(e) => setFormState({ ...formState, cin: e.target.value })}
                />
              </div>
              <div>
                <label className="font-medium block mb-1">Primary Contact Email</label>
                <Input
                  value={formState.primaryEmail}
                  onChange={(e) => setFormState({ ...formState, primaryEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="font-medium block mb-1">Primary Phone</label>
                <Input
                  value={formState.primaryPhone}
                  onChange={(e) => setFormState({ ...formState, primaryPhone: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-medium block mb-1">Headquarters Address</label>
                <Input
                  value={formState.hqAddress}
                  onChange={(e) => setFormState({ ...formState, hqAddress: e.target.value })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="locale" className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="font-medium block mb-1">Currency</label>
                <NativeSelect
                  value={formState.currency}
                  onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                >
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="USD ($)">USD ($)</option>
                </NativeSelect>
              </div>
              <div>
                <label className="font-medium block mb-1">Timezone</label>
                <NativeSelect
                  value={formState.timezone}
                  onChange={(e) => setFormState({ ...formState, timezone: e.target.value })}
                >
                  <option value="Asia/Kolkata (IST UTC+05:30)">Asia/Kolkata (IST UTC+05:30)</option>
                </NativeSelect>
              </div>
              <div>
                <label className="font-medium block mb-1">Financial Year</label>
                <NativeSelect
                  value={formState.financialYear}
                  onChange={(e) => setFormState({ ...formState, financialYear: e.target.value })}
                >
                  <option value="April – March (FY 2026–27)">April – March (FY 2026–27)</option>
                  <option value="January – December">January – December</option>
                </NativeSelect>
              </div>
              <div>
                <label className="font-medium block mb-1">Date Format</label>
                <NativeSelect
                  value={formState.dateFormat}
                  onChange={(e) => setFormState({ ...formState, dateFormat: e.target.value })}
                >
                  <option value="DD MMM YYYY">DD MMM YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </NativeSelect>
              </div>
            </div>

            <div className="pt-2">
              <div className="font-semibold text-[#172B4D] mb-2">Configured Holiday Calendar (2026)</div>
              <div className="border border-slate-200 rounded-md divide-y divide-slate-100">
                {formState.holidays.map((h) => (
                  <div key={h.date} className="px-3 py-2 flex items-center justify-between">
                    <span className="font-medium text-[#172B4D]">{h.name}</span>
                    <span className="font-mono text-[#64748B]">{h.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-3 text-xs">
            {[
              { key: 'notifyApprovalAlerts', label: 'Approval Escalation & Urgent Sign-off Alerts' },
              { key: 'notifyLowStock', label: 'Low-Stock & Reorder Threshold Alerts' },
              { key: 'notifyStaleGps', label: 'Stale GPS Tracker (>15m) & Offline Queue Alerts' },
              { key: 'notifyComplianceExpiry', label: 'Contractor License & Crane Certificate Expiry Alerts' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-md"
              >
                <span className="font-medium text-[#172B4D]">{item.label}</span>
                <Switch
                  checked={Boolean(formState[item.key as keyof typeof formState])}
                  onCheckedChange={(val) => setFormState({ ...formState, [item.key]: val })}
                />
              </label>
            ))}
          </TabsContent>

          <TabsContent value="security" className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 border border-slate-200 rounded-md">
              <div>
                <div className="font-medium text-[#172B4D]">Enforce 2FA for Admin, Finance & HR Roles</div>
                <div className="text-[#64748B]">Required for payroll authorization and statutory PII reveal</div>
              </div>
              <Switch
                checked={formState.enforce2FA}
                onCheckedChange={(val) => setFormState({ ...formState, enforce2FA: val })}
              />
            </label>
            <label className="flex items-center justify-between p-3 border border-slate-200 rounded-md">
              <div>
                <div className="font-medium text-[#172B4D]">Mask Sensitive Aadhaar, PAN & Bank Account Fields</div>
                <div className="text-[#64748B]">Masks PII by default across directories and exports</div>
              </div>
              <Switch
                checked={formState.maskSensitivePII}
                onCheckedChange={(val) => setFormState({ ...formState, maskSensitivePII: val })}
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="font-medium block mb-1">Idle Session Timeout (Minutes)</label>
                <Input
                  type="number"
                  value={formState.sessionTimeoutMins}
                  onChange={(e) => setFormState({ ...formState, sessionTimeoutMins: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="font-medium block mb-1">Document & Audit Log Retention (Years)</label>
                <Input
                  type="number"
                  value={formState.documentRetentionYears}
                  onChange={(e) => setFormState({ ...formState, documentRetentionYears: Number(e.target.value) })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
