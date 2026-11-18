import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Shield,
  X,
} from 'lucide-react';
import { ALL_NAV_ITEMS, NAV_GROUPS } from './navConfig';
import { useErpStore } from '@/src/store/erpStore';
import { ADMIN_PROFILE } from '@/src/data/mockErpData';
import { cn } from '@/src/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Sheet, SheetContent } from '@/src/components/ui/sheet';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { ResilientImage } from '@/src/components/shared/ResilientImage';

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    branches,
    selectedBranchId,
    setSelectedBranchId,
    projects,
    sites,
    employees,
    purchases,
    assets,
    approvals,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    settings,
  } = useErpStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => {
      initial[g.id] = Boolean(g.defaultOpen);
    });
    return initial;
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'Pending').length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Automatically expand group containing active route
  useEffect(() => {
    const activeGroup = NAV_GROUPS.find((g) =>
      g.items.some((item) =>
        item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
      )
    );
    if (activeGroup) {
      setOpenGroups((prev) => ({ ...prev, [activeGroup.id]: true }));
    }
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const currentNavItem = useMemo(() => {
    if (location.pathname.startsWith('/projects/')) {
      return { label: 'Project Details', path: '/projects' };
    }
    if (location.pathname.startsWith('/sites/')) {
      return { label: 'Site Operations', path: '/sites' };
    }
    return (
      ALL_NAV_ITEMS.find((item) =>
        item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
      ) || ALL_NAV_ITEMS[0]
    );
  }, [location.pathname]);

  const currentGroup = useMemo(
    () =>
      NAV_GROUPS.find((g) =>
        g.items.some((item) =>
          item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
        )
      ),
    [location.pathname]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { type: string; title: string; subtitle: string; path: string }[] = [];

    projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((p) => results.push({ type: 'Project', title: p.name, subtitle: `${p.code} · ${p.city}`, path: `/projects/${p.id}` }));

    sites
      .filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((s) => results.push({ type: 'Site', title: s.name, subtitle: `${s.code} · ${s.siteManagerName}`, path: `/sites/${s.id}` }));

    employees
      .filter((e) => e.fullName.toLowerCase().includes(q) || e.empCode.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((e) => results.push({ type: 'Employee', title: e.fullName, subtitle: `${e.empCode} · ${e.designation}`, path: '/workforce' }));

    purchases
      .filter((pr) => pr.id.toLowerCase().includes(q) || pr.materialName.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((pr) => results.push({ type: 'Procurement', title: `${pr.id} · ${pr.materialName}`, subtitle: pr.siteName, path: '/procurement' }));

    assets
      .filter((a) => a.name.toLowerCase().includes(q) || a.assetCode.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((a) => results.push({ type: 'Equipment', title: a.name, subtitle: `${a.assetCode} · ${a.assignedSiteName}`, path: '/equipment' }));

    return results;
  }, [searchQuery, projects, sites, employees, purchases, assets]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSidebarNav = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full bg-[#101F35] text-slate-200 select-none">
      {/* Brand Header */}
      <div className={cn('flex items-center justify-between h-14 px-4 border-b border-white/10 shrink-0')}>
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-md bg-[#F59E0B] text-[#101F35] flex items-center justify-center font-bold text-sm shrink-0">
            BF
          </div>
          {(!sidebarCollapsed || isMobileDrawer) && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white tracking-tight truncate">BuildFlow</div>
              <div className="text-[11px] text-slate-400 truncate">
                {settings.companyName.split(' ')[0]} {settings.companyName.split(' ')[1] || ''}
              </div>
            </div>
          )}
        </Link>
        {!isMobileDrawer && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:inline-flex p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Scrollable Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3" aria-label="Primary Navigation">
        {NAV_GROUPS.map((group) => {
          const isOpen = openGroups[group.id] || sidebarCollapsed;
          return (
            <div key={group.id}>
              {(!sidebarCollapsed || isMobileDrawer) && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 transition-transform', isOpen ? 'rotate-0' : '-rotate-90')}
                  />
                </button>
              )}

              {isOpen && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        title={sidebarCollapsed && !isMobileDrawer ? item.label : undefined}
                        className={cn(
                          'flex items-center justify-between gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
                          active
                            ? 'bg-[#2563EB] text-white'
                            : 'text-slate-300 hover:bg-white/8 hover:text-white'
                        )}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon className="h-4 w-4 shrink-0" />
                          {(!sidebarCollapsed || isMobileDrawer) && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </span>
                        {(!sidebarCollapsed || isMobileDrawer) &&
                          item.id === 'approvals' &&
                          pendingApprovalsCount > 0 && (
                            <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-[#F59E0B] text-[#101F35] font-semibold">
                              {pendingApprovalsCount}
                            </span>
                          )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Admin Profile */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-2.5 rounded-md p-1.5 hover:bg-white/8 text-left transition-colors cursor-pointer"
        >
          <ResilientImage
            src={ADMIN_PROFILE.avatar}
            alt={ADMIN_PROFILE.name}
            className="h-8 w-8 rounded-full object-cover shrink-0 border border-white/20"
          />
          {(!sidebarCollapsed || isMobileDrawer) && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{ADMIN_PROFILE.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{ADMIN_PROFILE.role}</div>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F5F7FA] text-[#172B4D]">
      {/* Desktop Fixed Sidebar */}
      <aside
        className={cn(
          'hidden lg:block fixed inset-y-0 left-0 z-30 transition-[width] duration-150',
          sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {renderSidebarNav(false)}
      </aside>

      {/* Tablet / Mobile Navigation Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px] max-w-[85vw] bg-[#101F35] border-r-0">
          {renderSidebarNav(true)}
        </SheetContent>
      </Sheet>

      {/* Main Column */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin] duration-150',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        )}
      >
        {/* Top Bar (Compact on mobile, rich breadcrumbs + branch + actions on desktop) */}
        <header className="sticky top-0 z-20 h-14 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-[#172B4D] hover:bg-slate-100 cursor-pointer shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#64748B]">
                <span>{currentGroup?.label || 'Workspace'}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#172B4D] font-medium truncate">{currentNavItem.label}</span>
              </div>
              <div className="sm:hidden text-sm font-semibold text-[#172B4D] truncate">
                {currentNavItem.label}
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Branch Selector */}
            <div className="hidden md:flex items-center gap-1.5 border border-slate-200 rounded-md px-2.5 h-8 bg-slate-50/70">
              <Building2 className="h-3.5 w-3.5 text-[#64748B]" />
              <select
                aria-label="Filter by Branch"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#172B4D] focus:outline-none cursor-pointer max-w-[175px]"
              >
                <option value="all">All Branches ({branches.length})</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Global Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 h-8 px-2.5 sm:px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs text-[#64748B] cursor-pointer"
              aria-label="Global search"
            >
              <Search className="h-3.5 w-3.5 text-[#64748B]" />
              <span className="hidden sm:inline">Search projects, sites, staff...</span>
              <kbd className="hidden xl:inline-block font-mono text-[10px] px-1 py-0.5 bg-slate-100 rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              aria-label="Notifications"
              className="relative inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[#172B4D] cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-mono flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Help */}
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label="Help and architecture guide"
              className="hidden sm:inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[#172B4D] cursor-pointer"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 h-8 pl-1 pr-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
              >
                <ResilientImage
                  src={ADMIN_PROFILE.avatar}
                  alt={ADMIN_PROFILE.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="hidden xl:inline text-xs font-medium text-[#172B4D] max-w-[120px] truncate">
                  {ADMIN_PROFILE.name.split(' ')[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-40 py-1.5">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="text-xs font-semibold text-[#172B4D]">{ADMIN_PROFILE.name}</div>
                      <div className="text-[11px] text-[#64748B] truncate">{ADMIN_PROFILE.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/roles');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-[#172B4D] hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="h-3.5 w-3.5 text-[#64748B]" /> Roles & Permissions
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/subscription');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-[#172B4D] hover:bg-slate-50 cursor-pointer"
                    >
                      Subscription & Usage
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-[#172B4D] hover:bg-slate-50 cursor-pointer"
                    >
                      Company Settings
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Branch Strip */}
        <div className="md:hidden px-3 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-[#64748B]">Branch Scope</span>
          <select
            aria-label="Mobile Branch Filter"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="text-xs font-medium text-[#172B4D] bg-slate-50 border border-slate-200 rounded px-2 py-1 max-w-[200px]"
          >
            <option value="all">All Branches ({branches.length})</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Main Scrollable Viewport */}
        <main className="flex-1 p-3.5 sm:p-6 pb-20 lg:pb-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Primary Bottom Navigation (< 1024px) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-white border-t border-slate-200 grid grid-cols-5"
      >
        {[
          { label: 'Overview', path: '/', icon: LayoutDashboard },
          { label: 'Projects', path: '/projects', icon: FolderKanban },
          { label: 'Sites', path: '/sites', icon: MapPin },
          { label: 'Approvals', path: '/approvals', icon: CheckSquare, badge: pendingApprovalsCount },
        ].map((item) => {
          const Icon = item.icon;
          const active =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium',
                active ? 'text-[#2563EB]' : 'text-[#64748B]'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="absolute top-1.5 right-3 h-4 min-w-[16px] px-1 rounded-full bg-[#F59E0B] text-[#101F35] text-[9px] font-mono font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-[#64748B] cursor-pointer"
        >
          <Menu className="h-4 w-4" />
          <span>Modules</span>
        </button>
      </nav>

      {/* Global Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden">
          <div className="flex items-center border-b border-slate-200 px-4 py-3 gap-2.5">
            <Search className="h-4 w-4 text-[#64748B]" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, site codes, employees, purchase requests, equipment..."
              className="border-0 focus-visible:ring-0 px-0 h-7 text-sm"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {searchQuery.trim() === '' ? (
              <div className="p-4 text-xs text-[#64748B]">
                Quick links: Try searching <span className="font-mono text-[#172B4D]">Metro</span>,{' '}
                <span className="font-mono text-[#172B4D]">Andheri</span>,{' '}
                <span className="font-mono text-[#172B4D]">Rebar</span>, or{' '}
                <span className="font-mono text-[#172B4D]">Crane</span>.
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B]">
                No records found matching "{searchQuery}".
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                      navigate(res.path);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-md hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#172B4D] truncate">{res.title}</div>
                      <div className="text-[11px] text-[#64748B] truncate">{res.subtitle}</div>
                    </div>
                    <span className="text-[11px] font-medium text-[#2563EB] shrink-0">{res.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Drawer */}
      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent>
          <div className="flex items-center justify-between pr-8 mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#172B4D]">Operational Alerts & Notices</h2>
              <p className="text-xs text-[#64748B]">{unreadCount} unread across active sites</p>
            </div>
            <Button variant="secondary" size="sm" onClick={markAllNotificationsRead}>
              Mark all read
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  markNotificationRead(n.id);
                  setNotificationsOpen(false);
                  navigate(n.targetRoute);
                }}
                className={cn(
                  'w-full text-left py-3 px-2 rounded-md transition-colors cursor-pointer',
                  n.read ? 'opacity-70 hover:bg-slate-50' : 'bg-[#2563EB]/[0.04] hover:bg-[#2563EB]/[0.08]'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      n.severity === 'critical'
                        ? 'text-[#DC2626]'
                        : n.severity === 'warning'
                        ? 'text-[#D97706]'
                        : 'text-[#2563EB]'
                    )}
                  >
                    {n.title}
                  </span>
                  <span className="text-[11px] text-[#64748B]">{n.timestamp}</span>
                </div>
                <p className="mt-1 text-xs text-[#172B4D] leading-relaxed">{n.message}</p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Architecture & Simulation Help Modal */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>BuildFlow Company Admin Architecture</DialogTitle>
            <DialogDescription>
              Simulated prototype behavior vs. production backend & native mobile integrations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs text-[#172B4D] leading-relaxed">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="font-semibold">Simulated Local State (Active Now)</div>
              <p className="mt-1 text-[#64748B]">
                All projects, sites, attendance GPS coordinates, geofences, procurement approvals, and INR financial ledgers run on structured in-memory state via <code className="font-mono">erpService</code> & Zustand so you can test complete workflows immediately.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="font-semibold">Target Production Integrations</div>
              <ul className="mt-1 space-y-1 text-[#64748B] list-disc pl-4">
                <li><strong>Supabase PostgreSQL + RLS</strong>: Enforces branch, project, site, and financial PII access policies server-side.</li>
                <li><strong>Cloudflare R2 + CDN</strong>: Stores live check-in selfies, supplier tax invoices, and CAD drawings.</li>
                <li><strong>Capacitor Android & iOS</strong>: Handles 5-minute foreground/background GPS tracking and offline SQLite sync queues.</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
