import { useState } from "react";
import { motion } from "motion/react";
import {
  Building2,
  Home,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  UserPlus,
  Activity,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import DashboardLayout, { type NavItem } from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import RoleBadge from "../components/dashboard/RoleBadge";

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, id: "dashboard" },
  { label: "Admins", icon: <Shield size={18} />, id: "admins" },
  { label: "All Houses", icon: <Building2 size={18} />, id: "houses" },
  { label: "All Users", icon: <Users size={18} />, id: "users" },
  { label: "Activity Log", icon: <Activity size={18} />, id: "activity" },
  { label: "Settings", icon: <Settings size={18} />, id: "settings" },
];

// Mock data
const mockAdmins = [
  { id: "adm-001", name: "House Manager", email: "admin", house: "The Green House", status: "active" },
  { id: "adm-002", name: "Maria Santos", email: "maria@example.com", house: "Sunrise Dorm", status: "active" },
];

const mockHouses = [
  { id: "bh-001", name: "The Green House", rooms: 20, occupied: 18, admin: "House Manager", rate: 92 },
  { id: "bh-002", name: "Sunrise Dorm", rooms: 30, occupied: 27, admin: "Maria Santos", rate: 88 },
  { id: "bh-003", name: "Lakeside Living", rooms: 15, occupied: 12, admin: "—", rate: 95 },
];

const mockActivity = [
  { time: "2 min ago", text: "New user Sora registered", type: "user" },
  { time: "15 min ago", text: "Rent collection completed at The Green House", type: "payment" },
  { time: "1 hr ago", text: "Admin Maria Santos updated Sunrise Dorm settings", type: "admin" },
  { time: "3 hr ago", text: "Maintenance request #142 resolved", type: "task" },
  { time: "5 hr ago", text: "New boarding house 'Lakeside Living' created", type: "house" },
];

export default function AdministratorDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <DashboardLayout
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      pageTitle={navItems.find((n) => n.id === activeNav)?.label ?? "Dashboard"}
    >
      {activeNav === "dashboard" && <OverviewSection />}
      {activeNav === "admins" && <AdminsSection />}
      {activeNav === "houses" && <HousesSection />}
      {activeNav === "users" && <UsersPlaceholder />}
      {activeNav === "activity" && <ActivitySection />}
      {activeNav === "settings" && <SettingsPlaceholder />}
    </DashboardLayout>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Houses" value={3} icon={<Building2 size={19} />} trend="up" trendText="+1 this month" index={0} />
        <StatCard title="Total Admins" value={2} icon={<Shield size={19} />} colorClass="bg-[#f2e3c1] text-[#8c6b37]" index={1} />
        <StatCard title="Total Users" value={57} subtitle="residents" icon={<Users size={19} />} trend="up" trendText="+8" colorClass="bg-[#dbeafe] text-[#2563eb]" index={2} />
        <StatCard title="Monthly Revenue" value="₱285K" icon={<Home size={19} />} trend="up" trendText="+12%" colorClass="bg-[#e6efe8] text-primary" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Houses overview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Boarding Houses</h3>
            <span className="font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">{mockHouses.length} properties</span>
          </div>
          <div className="divide-y divide-border">
            {mockHouses.map((house) => (
              <div key={house.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{house.name}</p>
                    <p className="text-xs text-muted-foreground">{house.admin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold">{house.occupied}<span className="text-muted-foreground font-normal">/{house.rooms}</span></p>
                    <p className="text-[10px] text-muted-foreground font-['DM_Mono'] uppercase">{house.rate}% collected</p>
                  </div>
                  <ChevronRight size={15} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Recent Activity</h3>
            <Activity size={15} className="text-muted-foreground" />
          </div>
          <div className="divide-y divide-border">
            {mockActivity.map((item, i) => (
              <div key={i} className="px-5 py-3">
                <p className="text-sm">{item.text}</p>
                <p className="mt-1 font-['DM_Mono'] text-[10px] text-muted-foreground">{item.time}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AdminsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage admin accounts and their assigned boarding houses.</p>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition">
          <UserPlus size={15} /> Add Admin
        </button>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Name</th>
              <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Email</th>
              <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">House</th>
              <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Status</th>
              <th className="px-5 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-muted/20 transition">
                <td className="px-5 py-3.5 font-medium">{admin.name}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{admin.email}</td>
                <td className="px-5 py-3.5">{admin.house}</td>
                <td className="px-5 py-3.5">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 capitalize">{admin.status}</span>
                </td>
                <td className="px-5 py-3.5">
                  <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HousesSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">All registered boarding houses across the platform.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockHouses.map((house, i) => (
          <motion.div
            key={house.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="grid size-10 place-items-center rounded-xl bg-primary text-[#e6b65c]">
                <Building2 size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">{house.name}</p>
                <p className="text-xs text-muted-foreground">{house.admin}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-lg font-bold">{house.rooms}</p>
                <p className="text-[9px] font-['DM_Mono'] uppercase text-muted-foreground">Rooms</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-lg font-bold">{house.occupied}</p>
                <p className="text-[9px] font-['DM_Mono'] uppercase text-muted-foreground">Occupied</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-lg font-bold">{house.rate}%</p>
                <p className="text-[9px] font-['DM_Mono'] uppercase text-muted-foreground">Collected</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ActivitySection() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Platform-wide activity log.</p>
      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {mockActivity.map((item, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="grid size-8 place-items-center rounded-full bg-muted shrink-0">
              <Activity size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm">{item.text}</p>
              <p className="mt-0.5 font-['DM_Mono'] text-[10px] text-muted-foreground">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-muted mb-4"><Users size={24} className="text-muted-foreground" /></div>
      <h3 className="text-lg font-bold">All Users</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">User management will be available once Supabase is integrated. All registered users will appear here.</p>
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-muted mb-4"><Settings size={24} className="text-muted-foreground" /></div>
      <h3 className="text-lg font-bold">Platform Settings</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">Global platform settings will be configurable once the backend is connected.</p>
    </div>
  );
}
