import React, { useState } from 'react';
import {
  Users,
  Utensils,
  Store,
  HeartHandshake,
  Bell,
  LogOut,
  RotateCcw,
  Menu,
  X,
  Home,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useReBite } from '../../context/ReBiteContext';
import { UserRole } from '../../types/rebite';
import { StudentDashboard } from '../dashboards/StudentDashboard';
import { MessManagerDashboard } from '../dashboards/MessManagerDashboard';
import { CanteenManagerDashboard } from '../dashboards/CanteenManagerDashboard';
import { NgoInspectorDashboard } from '../dashboards/NgoInspectorDashboard';

export const DashboardShell: React.FC = () => {
  const {
    currentUser,
    loginAsRole,
    logout,
    goBack,
    resetDemoDatabase,
    db,
    markAllNotificationsRead,
    campusMetrics,
  } = useReBite();

  const activeRole = currentUser?.role || UserRole.STUDENT;
  const [activeTab, setActiveTabState] = useState<string>('overview');
  const [navHistory, setNavHistory] = useState<{ role: UserRole; tab: string }[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const setActiveTab = (nextTab: string) => {
    if (nextTab !== activeTab) {
      setNavHistory((prev) => [...prev, { role: activeRole, tab: activeTab }]);
      setActiveTabState(nextTab);
    }
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    if (newRole !== activeRole || activeTab !== 'overview') {
      setNavHistory((prev) => [...prev, { role: activeRole, tab: activeTab }]);
    }
    loginAsRole(newRole);
    setActiveTabState('overview');
    setMobileMenuOpen(false);
  };

  const handlePreviousPage = () => {
    if (navHistory.length > 0) {
      const prevEntry = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, -1));
      if (prevEntry.role !== activeRole) {
        loginAsRole(prevEntry.role);
      }
      setActiveTabState(prevEntry.tab);
    } else {
      goBack();
    }
  };

  const roleNotifications = db.notifications.filter((n) =>
    n.targetRoles.includes(activeRole)
  );
  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  const roleMeta: Record<
    UserRole,
    {
      label: string;
      badge: string;
      icon: React.ReactNode;
      tabs: { id: string; label: string }[];
    }
  > = {
    [UserRole.STUDENT]: {
      label: 'Student Portal',
      badge: 'Hostel Resident',
      icon: <Users className="w-4 h-4" />,
      tabs: [
        { id: 'overview', label: 'Smart Meal Confirmation' },
        { id: 'surplus', label: 'Surplus Food Discovery' },
        { id: 'insights', label: 'Meal Insights & Eco-Impact' },
        { id: 'rewards', label: 'Leaderboard & Challenges' },
        { id: 'feedback', label: 'Meal Quality Feedback' },
      ],
    },
    [UserRole.MESS_MANAGER]: {
      label: 'Mess Manager Console',
      badge: 'Dining Hall Ops',
      icon: <Utensils className="w-4 h-4" />,
      tabs: [
        { id: 'overview', label: 'AI Demand Prediction' },
        { id: 'prep', label: 'Food Prep & Menu Ledger' },
        { id: 'surplus', label: 'Surplus Food Management' },
        { id: 'analytics', label: 'Wastage Analytics & AI' },
      ],
    },
    [UserRole.CANTEEN_MANAGER]: {
      label: 'Canteen Manager Hub',
      badge: 'Retail & Bakery',
      icon: <Store className="w-4 h-4" />,
      tabs: [
        { id: 'overview', label: 'Inventory & Expiry Monitor' },
        { id: 'surplus', label: 'Surplus & Reservations' },
        { id: 'analytics', label: 'Waste Analytics & AI' },
      ],
    },
    [UserRole.NGO_INSPECTOR]: {
      label: 'NGO & Quality Inspector',
      badge: 'FSSAI Partner',
      icon: <HeartHandshake className="w-4 h-4" />,
      tabs: [
        { id: 'overview', label: 'Available Food Discovery' },
        { id: 'inspect', label: 'AI Quality & Human Sign-Off' },
        { id: 'redistribution', label: 'Food Redistribution Log' },
        { id: 'reports', label: 'Impact & Audit Reports' },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#17231B] flex">
      {/* Desktop Sidebar Navigation (260px) */}
      <aside className="hidden lg:flex w-[264px] shrink-0 bg-white border-r border-[#17231B]/10 flex-col justify-between sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center justify-between pb-5 border-b border-[#17231B]/10 mb-5">
            <button
              onClick={logout}
              className="text-xl font-display font-bold text-[#14532D] tracking-tight cursor-pointer"
            >
              ReBite
            </button>
            <span className="text-[11px] font-mono text-[#17231B]/60">
              {roleMeta[activeRole].badge}
            </span>
          </div>

          {/* Current Stakeholder Section Navigation */}
          <div className="mb-6">
            <div className="text-[11px] font-semibold text-[#17231B]/50 mb-2">
              {roleMeta[activeRole].label} Sections
            </div>
            <nav className="space-y-1">
              {roleMeta[activeRole].tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#16A34A] text-white'
                      : 'text-[#17231B]/75 hover:bg-[#F8FAF7] hover:text-[#17231B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Cross-Section Role Switcher for Testing Shared Database */}
          <div className="pt-5 border-t border-[#17231B]/10">
            <div className="text-[11px] font-semibold text-[#17231B]/50 mb-2">
              Switch Stakeholder Role (Live Sync)
            </div>
            <div className="space-y-1.5">
              {(Object.keys(roleMeta) as UserRole[]).map((role) => {
                const isCurrent = activeRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#14532D]/10 text-[#14532D] font-semibold border border-[#14532D]/20'
                        : 'text-[#17231B]/70 hover:bg-[#F8FAF7]'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {roleMeta[role].icon}
                      <span className="truncate">{roleMeta[role].label}</span>
                    </span>
                    {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-5 border-t border-[#17231B]/10 bg-[#F8FAF7]/60 space-y-3">
          <div className="text-xs">
            <div className="font-semibold text-[#17231B] truncate">{currentUser?.name}</div>
            <div className="text-[11px] text-[#17231B]/60 truncate">{currentUser?.campusUnit}</div>
            <div className="text-[11px] font-mono text-[#16A34A] mt-0.5">
              ID: {currentUser?.verifiedId}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#17231B]/10">
            <button
              onClick={logout}
              className="flex-1 py-2 px-2.5 bg-white hover:bg-[#17231B]/5 border border-[#17231B]/15 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Landing</span>
            </button>
            <button
              onClick={resetDemoDatabase}
              title="Reset seeded campus data"
              className="py-2 px-2.5 bg-white hover:bg-red-50 border border-[#17231B]/15 rounded-lg text-xs text-[#17231B]/70 hover:text-red-700 flex items-center justify-center cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#17231B]/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-[#17231B]/15 text-[#17231B] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Previous Page & Home Icon Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handlePreviousPage}
                title="Go to previous page"
                aria-label="Go to previous page"
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#F8FAF7] hover:bg-[#16A34A]/10 border border-[#17231B]/15 hover:border-[#16A34A] text-[#17231B] hover:text-[#14532D] text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>

              <button
                type="button"
                onClick={logout}
                title="Go to Home page"
                aria-label="Go to Home page"
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#F8FAF7] hover:bg-[#16A34A]/10 border border-[#17231B]/15 hover:border-[#16A34A] text-[#17231B] hover:text-[#14532D] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
            </div>

            <div className="min-w-0 pl-1">
              <div className="flex items-center gap-2 text-xs text-[#17231B]/60">
                <span>ReBite Campus Workspace</span>
                <span aria-hidden="true">/</span>
                <span className="font-semibold text-[#14532D] truncate">
                  {roleMeta[activeRole].label}
                </span>
              </div>
              <div className="text-sm sm:text-base font-display font-bold text-[#17231B] truncate">
                {currentUser?.name} · {currentUser?.campusUnit}
              </div>
            </div>
          </div>

          {/* Right Header Controls: Live Campus Saved Metric + Notifications */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8FAF7] border border-[#17231B]/10 text-xs">
              <span className="text-[#17231B]/60">Campus Rescued:</span>
              <span className="font-mono font-bold text-[#16A34A] tabular-nums">
                {campusMetrics.totalFoodSavedKg} kg ({campusMetrics.totalMealsRedistributed} meals)
              </span>
            </div>

            {/* Notifications Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen) markAllNotificationsRead();
                }}
                className="p-2 rounded-xl bg-[#F8FAF7] hover:bg-[#16A34A]/10 border border-[#17231B]/15 text-[#17231B] relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#F59E0B] text-[#17231B] text-[10px] font-mono font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#17231B]/15 rounded-2xl shadow-xl p-4 z-40">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#17231B]/10 mb-3">
                    <span className="text-xs font-display font-bold text-[#17231B]">
                      Real-Time Campus Alerts ({roleNotifications.length})
                    </span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-[#17231B]/60 hover:text-[#17231B] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {roleNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl bg-[#F8FAF7] border border-[#17231B]/10 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#16A34A] font-semibold mb-0.5">
                          <span>{n.category}</span>
                          <span className="text-[#17231B]/50 font-normal">{n.createdAt}</span>
                        </div>
                        <div className="font-bold text-[#17231B]">{n.title}</div>
                        <p className="text-[#17231B]/75 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Collapsible Role & Section Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#17231B]/15 p-4 space-y-4">
            <div>
              <div className="text-xs font-semibold text-[#17231B]/60 mb-2">
                Switch Stakeholder Role
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(roleMeta) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-left flex items-center gap-2 cursor-pointer ${
                      activeRole === role
                        ? 'bg-[#16A34A] text-white border-[#16A34A]'
                        : 'bg-[#F8FAF7] text-[#17231B] border-[#17231B]/10'
                    }`}
                  >
                    {roleMeta[role].icon}
                    <span className="truncate">{roleMeta[role].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#17231B]/10">
              <button
                onClick={logout}
                className="text-xs font-semibold text-[#14532D] flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Landing Page</span>
              </button>
              <button
                onClick={resetDemoDatabase}
                className="text-xs text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Role Dashboard Viewport */}
        <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-8 py-6 pb-20">
          {activeRole === UserRole.STUDENT && (
            <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
          {activeRole === UserRole.MESS_MANAGER && (
            <MessManagerDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
          {activeRole === UserRole.CANTEEN_MANAGER && (
            <CanteenManagerDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
          {activeRole === UserRole.NGO_INSPECTOR && (
            <NgoInspectorDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </main>
      </div>
    </div>
  );
};
