import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import RoleBadge from "./RoleBadge";
import type { UserRole } from "../../types/auth";
import { useRealtimeData } from "../../hooks/useRealtimeData";
import HouseLoading from "../shared/HouseLoading";

export interface NavItem {
  label: string;
  icon: ReactNode;
  id: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeNav: string;
  onNavChange: (id: string) => void;
  pageTitle: string;
}

export default function DashboardLayout({
  children,
  navItems,
  activeNav,
  onNavChange,
  pageTitle,
}: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isTabSettling, setIsTabSettling] = useState(false);
  const hasMounted = useRef(false);
  const { data: profiles } = useRealtimeData("profiles");

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    setIsTabSettling(true);
    const settleTimer = window.setTimeout(() => setIsTabSettling(false), 420);
    return () => window.clearTimeout(settleTimer);
  }, [activeNav]);

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleColor = getRoleAccent(user.role);
  const activeItem = navItems.find((item) => item.id === activeNav);
  const primaryMobileItems = navItems.slice(0, Math.min(4, navItems.length));
  const mobileHasMore = navItems.length > primaryMobileItems.length;
  const activeIsPrimaryMobile = primaryMobileItems.some((item) => item.id === activeNav);

  const handleMobileNavChange = (id: string) => {
    if (id !== activeNav) {
      onNavChange(id);
    }
    setMobileOpen(false);
  };

  const currentProfile = profiles.find((p: any) => p.id === user?.id);
  
  let localAvatar = null;
  try {
    const localData = JSON.parse(localStorage.getItem(`profile_${user?.id}`) || '{}');
    localAvatar = localData.avatar_url;
  } catch (e) {}

  const finalAvatar = localAvatar || currentProfile?.avatar_url || user.avatarUrl;

  return (
    <div className="dashboard-shell flex h-[100dvh] bg-background font-['DM_Sans'] text-foreground overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col border-r border-border bg-card shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e6eedb] overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[17px] font-bold tracking-[-0.03em] whitespace-nowrap"
              >
                Boarding<span className="text-primary">How</span>
              </motion.span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted transition"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                activeNav === item.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User info + sign out */}
        <div className="border-t border-border px-3 py-4 space-y-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white overflow-hidden"
              style={{ backgroundColor: roleColor }}
            >
              {finalAvatar ? (
                <img src={finalAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user.fullName}</p>
                <RoleBadge role={user.role} size="sm" />
              </div>
            )}
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition"
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
            />
            <motion.aside
              initial={{ x: -340 }}
              animate={{ x: 0 }}
              exit={{ x: -340 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 flex h-[100dvh] w-[min(22rem,calc(100vw-1rem))] flex-col overflow-hidden border-r border-border bg-card shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#e6eedb]">
                    <img src="/logo.png" alt="BoardingHow Logo" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-bold tracking-[-0.03em]">
                      Boarding<span className="text-primary">How</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{activeItem?.label ?? pageTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
                  aria-label="Close menu"
                >
                  <X size={19} />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavChange(item.id)}
                    className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-[15px] font-semibold transition-all ${
                      activeNav === item.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="grid size-6 shrink-0 place-items-center [&_svg]:size-5">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="border-t border-border px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
                <div className="mb-3 flex items-center gap-3 rounded-2xl bg-background/70 p-3">
                  <div
                    className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: roleColor }}
                  >
                    {finalAvatar ? (
                      <img src={finalAvatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.fullName}</p>
                    <RoleBadge role={user.role} size="sm" />
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                >
                  <LogOut size={17} />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-3 py-3 backdrop-blur sm:px-4 lg:px-8 lg:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid size-10 place-items-center rounded-xl border border-border bg-background text-muted-foreground lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight lg:text-xl">{pageTitle}</h1>
              <p className="hidden text-xs text-muted-foreground sm:block lg:hidden">Use the bottom tabs or menu to switch sections.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutDashboard size={15} />
              <span>{user.fullName}</span>
            </div>
            <div
              className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white overflow-hidden lg:hidden"
              style={{ backgroundColor: roleColor }}
            >
              {finalAvatar ? (
                <img src={finalAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="dashboard-main relative flex-1 overflow-y-auto overflow-x-hidden p-3 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-[calc(5.75rem+env(safe-area-inset-bottom))] lg:p-8 lg:pb-8">
          <AnimatePresence>
            {isTabSettling && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="pointer-events-none fixed inset-x-3 top-20 z-20 flex justify-center sm:absolute sm:inset-x-auto sm:right-4 sm:top-4"
              >
                <HouseLoading
                  variant="overlay"
                  size="sm"
                  label={`Moving to ${pageTitle}...`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Mobile bottom tabs ── */}
        <nav className="dashboard-mobile-nav fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 shadow-[0_-10px_30px_rgba(31,46,43,0.08)] backdrop-blur-xl lg:hidden">
          <div
            className="mx-auto grid max-w-md gap-1 px-2 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2"
            style={{ gridTemplateColumns: `repeat(${primaryMobileItems.length + (mobileHasMore ? 1 : 0)}, minmax(0, 1fr))` }}
          >
            {primaryMobileItems.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNavChange(item.id)}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-bold transition ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="grid size-5 place-items-center [&_svg]:size-[18px]">{item.icon}</span>
                  <span className="w-full truncate leading-tight">{item.label}</span>
                </button>
              );
            })}
            {mobileHasMore && (
              <button
                onClick={() => setMobileOpen(true)}
                className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-bold transition ${
                  mobileOpen || !activeIsPrimaryMobile ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                aria-label="Open all dashboard sections"
              >
                <MoreHorizontal size={18} />
                <span className="w-full truncate leading-tight">More</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}

function getRoleAccent(role: UserRole): string {
  switch (role) {
    case "administrator": return "#8c6b37";
    case "admin":         return "#1f5149";
    case "staff":         return "#2563eb";
    case "user":          return "#64706a";
  }
}
