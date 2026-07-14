import { useState } from "react";
import { motion } from "motion/react";
import {
  Building2,
  Check,
  ChevronRight,
  ClipboardList,
  Home,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
  UserPlus,
  Wrench,
  DoorOpen,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
import DashboardLayout, { type NavItem } from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, id: "dashboard" },
  { label: "Rooms", icon: <DoorOpen size={18} />, id: "rooms" },
  { label: "Tenants", icon: <Users size={18} />, id: "tenants" },
  { label: "Staff", icon: <UserPlus size={18} />, id: "staff" },
  { label: "Maintenance", icon: <Wrench size={18} />, id: "maintenance" },
  { label: "Settings", icon: <Settings size={18} />, id: "settings" },
];

// Mock data
const mockRooms = [
  { id: "r01", number: "01", status: "occupied", tenant: "Liam M." },
  { id: "r02", number: "02", status: "occupied", tenant: "Jane C." },
  { id: "r03", number: "03", status: "occupied", tenant: "Rosa A." },
  { id: "r04", number: "04", status: "occupied", tenant: "Sora K." },
  { id: "r05", number: "05", status: "vacant", tenant: null },
  { id: "r06", number: "06", status: "occupied", tenant: "Mike D." },
  { id: "r07", number: "07", status: "occupied", tenant: "Ella R." },
  { id: "r08", number: "08", status: "maintenance", tenant: null },
  { id: "r09", number: "09", status: "occupied", tenant: "Ben S." },
  { id: "r10", number: "10", status: "occupied", tenant: "Ana P." },
  { id: "r11", number: "11", status: "occupied", tenant: "Tom L." },
  { id: "r12", number: "12", status: "occupied", tenant: "Joy N." },
  { id: "r13", number: "13", status: "vacant", tenant: null },
  { id: "r14", number: "14", status: "occupied", tenant: "Dan W." },
  { id: "r15", number: "15", status: "occupied", tenant: "Kai F." },
  { id: "r16", number: "16", status: "occupied", tenant: "Mia O." },
  { id: "r17", number: "17", status: "occupied", tenant: "Rex T." },
  { id: "r18", number: "18", status: "occupied", tenant: "Ivy G." },
  { id: "r19", number: "19", status: "occupied", tenant: "Leo H." },
  { id: "r20", number: "20", status: "occupied", tenant: "Ava B." },
];

const mockTenants = [
  { id: "t1", name: "Liam M.", room: "01", rent: "Paid", dueDate: "Jul 1" },
  { id: "t2", name: "Jane C.", room: "02", rent: "Paid", dueDate: "Jul 1" },
  { id: "t3", name: "Rosa A.", room: "03", rent: "Due", dueDate: "Jul 1" },
  { id: "t4", name: "Sora K.", room: "04", rent: "Due", dueDate: "Jul 1" },
  { id: "t5", name: "Mike D.", room: "06", rent: "Paid", dueDate: "Jul 1" },
  { id: "t6", name: "Ella R.", room: "07", rent: "Overdue", dueDate: "Jun 1" },
];

const mockStaff = [
  { id: "s1", name: "Carlos R.", role: "Maintenance", tasks: 3, status: "active" },
  { id: "s2", name: "Lily T.", role: "Cleaning", tasks: 2, status: "active" },
];

const mockMaintenance = [
  { id: "m1", room: "08", issue: "Leaking faucet in bathroom", status: "in-progress", date: "Jul 12" },
  { id: "m2", room: "03", issue: "AC not cooling", status: "pending", date: "Jul 13" },
  { id: "m3", room: "15", issue: "Door lock replacement", status: "pending", date: "Jul 14" },
  { id: "m4", room: "01", issue: "Light fixture buzzing", status: "done", date: "Jul 10" },
];

const mockActivity = [
  { icon: <Check size={13} strokeWidth={3} />, text: "Rent reminders sent", time: "09:00", color: "bg-[#d6e4d7] text-primary" },
  { icon: <Sparkles size={13} />, text: "Welcome Sora to Room 04", time: "08:30", color: "bg-[#f1deb3] text-[#8a6729]" },
  { icon: <Wrench size={13} />, text: "Maintenance #141 completed", time: "Yesterday", color: "bg-[#dbeafe] text-[#2563eb]" },
];

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <DashboardLayout
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      pageTitle={activeNav === "dashboard" ? "The Green House" : navItems.find((n) => n.id === activeNav)?.label ?? "Dashboard"}
    >
      {activeNav === "dashboard" && <OverviewSection />}
      {activeNav === "rooms" && <RoomsSection />}
      {activeNav === "tenants" && <TenantsSection />}
      {activeNav === "staff" && <StaffSection />}
      {activeNav === "maintenance" && <MaintenanceSection />}
      {activeNav === "settings" && <SettingsPlaceholder />}
    </DashboardLayout>
  );
}

function OverviewSection() {
  const occupied = mockRooms.filter((r) => r.status === "occupied").length;
  const total = mockRooms.length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Occupied" value={occupied} subtitle={`/${total}`} icon={<Home size={19} />} index={0} />
        <StatCard title="Due Today" value={3} icon={<ClipboardList size={19} />} colorClass="bg-[#f2e3c1] text-[#876127]" index={1} />
        <StatCard title="Open Tasks" value={5} icon={<Wrench size={19} />} colorClass="bg-[#eee4d6] text-muted-foreground" index={2} />
        <StatCard title="Collection Rate" value="92%" icon={<Building2 size={19} />} trend="up" trendText="+4%" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Room grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Room Status</h3>
            <div className="flex items-center gap-4 text-[10px] font-['DM_Mono'] uppercase tracking-[.08em] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-500" /> Occupied</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-amber-400" /> Vacant</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-red-400" /> Maintenance</span>
            </div>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {mockRooms.map((room) => (
              <div
                key={room.id}
                className={`grid place-items-center rounded-xl aspect-square text-xs font-bold cursor-pointer transition-all hover:scale-105 ${
                  room.status === "occupied"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : room.status === "vacant"
                      ? "bg-amber-50 text-amber-600 border border-amber-200"
                      : "bg-red-50 text-red-500 border border-red-200"
                }`}
                title={room.tenant ? `${room.tenant} — Room ${room.number}` : `Room ${room.number} (${room.status})`}
              >
                {room.number}
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
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Activity</h3>
          </div>
          <div className="divide-y divide-border">
            {mockActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className={`grid size-7 place-items-center rounded-full ${item.color}`}>{item.icon}</span>
                  <span className="text-[13px] font-medium">{item.text}</span>
                </div>
                <span className="font-['DM_Mono'] text-[10px] text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function RoomsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage all {mockRooms.length} rooms in The Green House.</p>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition">
          <DoorOpen size={15} /> Add Room
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockRooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold">Room {room.number}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                room.status === "occupied"
                  ? "bg-emerald-100 text-emerald-700"
                  : room.status === "vacant"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-red-50 text-red-500"
              }`}>
                {room.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {room.tenant ?? "No tenant assigned"}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TenantsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">All tenants and their rent status.</p>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Tenant</th>
              <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Room</th>
              <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Rent Status</th>
              <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Due Date</th>
              <th className="px-5 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockTenants.map((t) => (
              <tr key={t.id} className="hover:bg-muted/20 transition">
                <td className="px-5 py-3.5 font-medium">{t.name}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{t.room}</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    t.rent === "Paid" ? "bg-emerald-100 text-emerald-700"
                      : t.rent === "Due" ? "bg-amber-50 text-amber-600"
                        : "bg-red-100 text-red-600"
                  }`}>{t.rent}</span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{t.dueDate}</td>
                <td className="px-5 py-3.5"><button className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StaffSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage house staff — maintenance workers and cleaning crew.</p>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition">
          <UserPlus size={15} /> Add Staff
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {mockStaff.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="grid size-10 place-items-center rounded-full bg-[#dbeafe] text-[#2563eb] text-sm font-bold">
                {s.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-bold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.role}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.tasks} active tasks</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 capitalize">{s.status}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MaintenanceSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Track and manage maintenance requests.</p>
      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {mockMaintenance.map((m, i) => (
          <div key={m.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition">
            <div className="flex items-center gap-4">
              <div className={`grid size-9 place-items-center rounded-xl ${
                m.status === "done" ? "bg-emerald-100 text-emerald-600"
                  : m.status === "in-progress" ? "bg-blue-100 text-blue-600"
                    : "bg-amber-50 text-amber-600"
              }`}>
                {m.status === "done" ? <Check size={16} /> : m.status === "in-progress" ? <Wrench size={16} /> : <AlertCircle size={16} />}
              </div>
              <div>
                <p className="text-sm font-medium">{m.issue}</p>
                <p className="text-xs text-muted-foreground">Room {m.room} · {m.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                m.status === "done" ? "bg-emerald-100 text-emerald-700"
                  : m.status === "in-progress" ? "bg-blue-100 text-blue-700"
                    : "bg-amber-50 text-amber-600"
              }`}>{m.status}</span>
              <ChevronRight size={15} className="text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-muted mb-4"><Settings size={24} className="text-muted-foreground" /></div>
      <h3 className="text-lg font-bold">House Settings</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">House settings will be configurable once Supabase is integrated.</p>
    </div>
  );
}
