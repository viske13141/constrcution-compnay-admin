import React, { useMemo, useState } from 'react';
import { FileCheck2, FileUp, Search } from 'lucide-react';
import { useErpStore } from '@/src/store/erpStore';
import { formatDateIN } from '@/src/lib/format';
import { PageHeader } from '@/src/components/shared/PageHeader';
import { StatusText } from '@/src/components/shared/StatusText';
import { ColumnDef, DataTable } from '@/src/components/shared/DataTable';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { DocumentRecord } from '@/src/types/erp';
import { toast } from 'sonner';

const DOC_CATEGORIES: DocumentRecord['category'][] = [
  'Company Registration',
  'Project Contract',
  'Site Approval',
  'Employee Document',
  'Contractor Document',
  'Supplier Invoice',
  'Safety Certificate',
  'Statutory Record',
  'Payroll Record',
];

export function DocumentsCompliancePage({ defaultTab = 'documents' }: { defaultTab?: 'documents' | 'compliance' }) {
  const { documents, complianceRules, addDocument } = useErpStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentRecord['category']>('Safety Certificate');
  const [ownerName, setOwnerName] = useState('Vikramaditya Deshmukh');
  const [projectOrBranch, setProjectOrBranch] = useState('Mumbai HQ');
  const [expiryDate, setExpiryDate] = useState('2027-11-30');
  const [accessLevel, setAccessLevel] = useState('Admin, Project Manager');
  const [pickedFileName, setPickedFileName] = useState('');

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((d) => {
      const mCat = catFilter === 'all' || d.category === catFilter;
      const mQ =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.ownerName.toLowerCase().includes(q) ||
        d.projectOrBranch.toLowerCase().includes(q);
      return mCat && mQ;
    });
  }, [documents, catFilter, search]);

  const columns: ColumnDef<DocumentRecord>[] = [
    {
      key: 'title',
      header: 'Document Title & Version',
      sortValue: (d) => d.title,
      render: (d) => (
        <div>
          <div className="font-semibold text-[#172B4D]">{d.title}</div>
          <div className="text-[11px] text-[#64748B]">
            {d.category} · {d.version} · Uploaded {formatDateIN(d.uploadedAt)}
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner & Scope',
      render: (d) => (
        <div className="text-xs">
          <div className="font-medium text-[#172B4D]">{d.ownerName}</div>
          <div className="text-[11px] text-[#64748B]">{d.projectOrBranch}</div>
        </div>
      ),
    },
    {
      key: 'access',
      header: 'Access Permissions',
      render: (d) => <span className="text-xs text-[#64748B]">{d.accessLevel}</span>,
    },
    {
      key: 'expiry',
      header: 'Expiry',
      render: (d) => <span className="text-xs tabular-nums">{d.expiryDate ? formatDateIN(d.expiryDate) : 'Perpetual'}</span>,
    },
    {
      key: 'status',
      header: 'Verification',
      render: (d) => <StatusText status={d.verificationStatus} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Documents & Statutory Compliance"
        description="Centralized R2-ready document vault with version tracking, expiry monitoring, and jurisdiction-configurable compliance rules."
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <FileUp className="h-4 w-4" /> Upload Document
          </Button>
        }
      />

      <Tabs defaultValue={defaultTab} key={defaultTab}>
        <TabsList>
          <TabsTrigger value="documents">Document Vault ({documents.length})</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Configuration ({complianceRules.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search document title, owner, project..."
                className="pl-9"
              />
            </div>
            <NativeSelect value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="sm:w-56">
              <option value="all">All 9 Document Categories</option>
              {DOC_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </NativeSelect>
          </div>

          <DataTable
            data={filteredDocs}
            columns={columns}
            keyExtractor={(d) => d.id}
            onRowClick={(d) => setPreviewDoc(d)}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-3">
          <div className="p-3.5 bg-white border border-slate-200 rounded-lg text-xs text-[#64748B]">
            <strong className="text-[#172B4D]">Jurisdiction Policy Note:</strong> Statutory rates, cess percentages, and filing due dates are configured per establishment & state jurisdiction by Company Legal/HR Administrators rather than hardcoded in software.
          </div>

          {complianceRules.map((rule) => (
            <div key={rule.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-medium text-[#2563EB]">{rule.jurisdiction} · {rule.establishmentType}</div>
                  <h3 className="text-sm font-semibold text-[#172B4D] mt-0.5">{rule.title}</h3>
                </div>
                <StatusText status={rule.status} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-[#64748B]">
                <div><span className="block text-[11px]">Cadence</span><span className="text-[#172B4D] font-medium">{rule.filingCadence}</span></div>
                <div><span className="block text-[11px]">Configured Rule</span><span className="text-[#172B4D] font-medium">{rule.configuredDueRule}</span></div>
                <div><span className="block text-[11px]">Owner Role</span><span className="text-[#172B4D] font-medium">{rule.ownerRole}</span></div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Upload Document Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Company / Site Document</DialogTitle>
            <DialogDescription>Files are indexed with version control and role-based access rules (Cloudflare R2 target).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-medium block mb-1">Document Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Form 11 Crane Load Certificate" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium block mb-1">Category</label>
                <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as DocumentRecord['category'])}>
                  {DOC_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <label className="font-medium block mb-1">Project / Branch</label>
                <Input value={projectOrBranch} onChange={(e) => setProjectOrBranch(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium block mb-1">Document Owner</label>
                <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </div>
              <div>
                <label className="font-medium block mb-1">Expiry Date</label>
                <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="font-medium block mb-1">Access Permissions</label>
              <Input value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} />
            </div>
            <label className="flex items-center justify-center border border-dashed border-slate-300 rounded-md p-4 bg-slate-50 cursor-pointer">
              <span className="font-medium text-[#2563EB]">
                {pickedFileName || 'Select PDF / Image / CAD File'}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setPickedFileName(e.target.files?.[0]?.name || '')}
              />
            </label>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!title.trim()) {
                    toast.error('Enter a document title');
                    return;
                  }
                  addDocument({
                    title,
                    category,
                    ownerName,
                    projectOrBranch,
                    expiryDate,
                    verificationStatus: 'Pending Review',
                    accessLevel,
                  });
                  toast.success(`Uploaded "${title}"`);
                  setUploadOpen(false);
                  setTitle('');
                  setPickedFileName('');
                }}
              >
                Save Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <Dialog open={Boolean(previewDoc)} onOpenChange={(o) => !o && setPreviewDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewDoc?.title}</DialogTitle>
            <DialogDescription>
              {previewDoc?.category} · {previewDoc?.version} · {previewDoc?.projectOrBranch}
            </DialogDescription>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-3 text-xs">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-md text-center space-y-2">
                <FileCheck2 className="h-8 w-8 text-[#2563EB] mx-auto" />
                <div className="font-medium text-[#172B4D]">Simulated Signed Document Preview (Cloudflare R2)</div>
                <div className="text-[#64748B]">
                  Owner: {previewDoc.ownerName} · Access: {previewDoc.accessLevel} · Status: {previewDoc.verificationStatus}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
