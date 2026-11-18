import React, { useState } from 'react';
import { Cloud, Database, FileSpreadsheet, Smartphone } from 'lucide-react';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { Switch } from '@/src/components/ui/switch-checkbox';
import { Button } from '@/src/components/ui/button';
import { toast } from 'sonner';

interface IntegrationCardState {
  id: string;
  name: string;
  category: string;
  description: string;
  mode: 'Simulated Adapter Ready' | 'Native Bridge Spec';
  enabled: boolean;
  icon: typeof Database;
}

export function IntegrationsPage() {
  const [items, setItems] = useState<IntegrationCardState[]>([
    {
      id: 'supabase',
      name: 'Supabase PostgreSQL, Auth & RLS',
      category: 'Core Backend & Security',
      description: 'Modular erpService repository boundary prepared for Supabase Postgres tables, JWT claims, Row Level Security, and Realtime subscriptions.',
      mode: 'Simulated Adapter Ready',
      enabled: true,
      icon: Database,
    },
    {
      id: 'r2',
      name: 'Cloudflare R2 + CDN Storage',
      category: 'Media & Document Vault',
      description: 'Signed URL upload pipeline for live check-in selfies, material delivery photos, tax invoices, and CAD drawings.',
      mode: 'Simulated Adapter Ready',
      enabled: true,
      icon: Cloud,
    },
    {
      id: 'capacitor',
      name: 'Capacitor Android & iOS Field App Bridge',
      category: 'Mobile GPS & Offline Queue',
      description: 'Foreground/background 5-minute location tracking respecting iOS/Android OS battery limits, with local SQLite offline queue sync.',
      mode: 'Native Bridge Spec',
      enabled: true,
      icon: Smartphone,
    },
    {
      id: 'tally',
      name: 'TallyPrime / Zoho Books Accounting Sync',
      category: 'Financial Export & GST',
      description: 'Exports Finance-Authorized supplier invoices, contractor RA bills, and approved payroll journals.',
      mode: 'Simulated Adapter Ready',
      enabled: false,
      icon: FileSpreadsheet,
    },
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Platform Integrations & Architecture"
        description="Configure backend service adapters, cloud object storage, mobile device telemetry bridges, and accounting exports."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md bg-slate-100 flex items-center justify-center text-[#2563EB] shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-[#64748B]">{item.category} · {item.mode}</div>
                    <h3 className="text-sm font-semibold text-[#172B4D]">{item.name}</h3>
                  </div>
                </div>
                <Switch
                  checked={item.enabled}
                  onCheckedChange={(val) => {
                    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, enabled: val } : x)));
                    toast.success(`${item.name} ${val ? 'enabled' : 'disabled'} in adapter config`);
                  }}
                />
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">{item.description}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#64748B]">
                  {item.enabled ? 'Adapter Active (Simulated)' : 'Adapter Standby'}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toast.info(`Verified ${item.name} adapter contract`)}
                >
                  Test Connection
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
