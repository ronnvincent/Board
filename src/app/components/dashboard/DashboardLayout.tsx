import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import RoleBadge from "./RoleBadge";
import type { UserRole } from "../../types/auth";

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

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleColor = getRoleAccent(user.role);

  return (
    <div className="flex h-screen bg-background font-['DM_Sans'] text-foreground overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col border-r border-border bg-card shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="grid size-9 shrink-0 place-items-center rounded-[13px] bg-primary text-primary-foreground">
              <Building2 size={19} strokeWidth={2.3} />
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
              className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: roleColor }}
            >
              {initials}
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
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 flex h-[100dvh] w-[260px] flex-col border-r border-border bg-card lg:hidden"
            >
              <div className="flex items-center justify-between px-4 py-5 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 place-items-center rounded-[13px] bg-primary text-primary-foreground">
                    <Building2 size={19} strokeWidth={2.3} />
                  </div>
                  <span className="text-[17px] font-bold tracking-[-0.03em]">
                    Boarding<span className="text-primary">How</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavChange(item.id);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      activeNav === item.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
                <div className="pt-2 mt-2">
                  <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={17} />
                    <span>Sign out</span>
                  </button>
                </div>
              </nav>
              <div className="border-t border-border px-3 pb-8 pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="grid size-9 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: roleColor }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user.fullName}</p>
                    <RoleBadge role={user.role} size="sm" />
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-8 lg:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight lg:text-xl">{pageTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutDashboard size={15} />
              <span>{user.fullName}</span>
            </div>
            <div
              className="grid size-9 place-items-center rounded-full text-xs font-bold text-white lg:hidden"
              style={{ backgroundColor: roleColor }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
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
