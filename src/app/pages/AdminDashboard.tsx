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

import { useRealtimeData } from "../hooks/useRealtimeData";
import { supabase } from "../../lib/supabase";

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
  const { data: rooms, loading: loadingRooms } = useRealtimeData("rooms", "number", true);
  const { data: maintenance } = useRealtimeData("maintenance_requests");

  const occupied = rooms.filter((r) => r.status === "occupied").length;
  const total = rooms.length;
  const openTasks = maintenance.filter((m) => m.status !== "done").length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Occupied" value={occupied} subtitle={`/${total}`} icon={<Home size={19} />} index={0} />
        <StatCard title="Due Today" value={0} icon={<ClipboardList size={19} />} colorClass="bg-[#f2e3c1] text-[#876127]" index={1} />
        <StatCard title="Open Tasks" value={openTasks} icon={<Wrench size={19} />} colorClass="bg-[#eee4d6] text-muted-foreground" index={2} />
        <StatCard title="Collection Rate" value="100%" icon={<Building2 size={19} />} trend="up" trendText="+0%" index={3} />
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
          
          {loadingRooms ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">No rooms yet.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Go to the Rooms tab to add one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`grid place-items-center rounded-xl aspect-square text-xs font-bold cursor-pointer transition-all hover:scale-105 ${
                    room.status === "occupied"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : room.status === "vacant"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-red-50 text-red-500 border border-red-200"
                  }`}
                  title={`Room ${room.number} (${room.status})`}
                >
                  {room.number}
                </div>
              ))}
            </div>
          )}
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
          <div className="flex h-[200px] flex-col items-center justify-center text-center px-4">
            <p className="text-sm text-muted-foreground">Activity logs will appear here</p>
            <p className="text-xs text-muted-foreground/70 mt-1">As your house runs, real-time events will stream in.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function RoomsSection() {
  const { data: rooms, loading } = useRealtimeData("rooms", "number", true);
  const [adding, setAdding] = useState(false);

  const handleAddRoom = async () => {
    setAdding(true);
    const roomNumber = prompt("Enter new room number:");
    if (roomNumber) {
      await supabase.from("rooms").insert({ number: roomNumber, status: "vacant" });
    }
    setAdding(false);
  };

  const handleDeleteRoom = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this room? All associated tenants will be unassigned.")) {
      await supabase.from("rooms").delete().eq("id", id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading rooms..." : `Manage all ${rooms.length} rooms in The Green House.`}
        </p>
        <button 
          onClick={handleAddRoom}
          disabled={adding}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition disabled:opacity-50"
        >
          <DoorOpen size={15} /> Add Room
        </button>
      </div>
      
      {rooms.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium text-foreground">No rooms exist yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Click Add Room to create your first one.</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold">Room {room.number}</span>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  room.status === "occupied"
                    ? "bg-emerald-100 text-emerald-700"
                    : room.status === "vacant"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-red-50 text-red-500"
                }`}>
                  {room.status}
                </span>
                <button 
                  onClick={(e) => handleDeleteRoom(room.id, e)}
                  className="text-muted-foreground hover:text-red-500 transition"
                  title="Delete Room"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {/* For now, tenants are tracked separately */}
              No tenant assigned
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TenantsSection() {
  const { data: tenants, loading } = useRealtimeData("tenants", "name", true);
  const [adding, setAdding] = useState(false);

  const handleAddTenant = async () => {
    setAdding(true);
    const tenantName = prompt("Enter new tenant name:");
    if (tenantName) {
      await supabase.from("tenants").insert({ name: tenantName, rent_status: "Due" });
    }
    setAdding(false);
  };

  const handleUpdateRent = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Paid" ? "Due" : currentStatus === "Due" ? "Overdue" : "Paid";
    await supabase.from("tenants").update({ rent_status: nextStatus }).eq("id", id);
  };

  const handleDeleteTenant = async (id: string) => {
    if (confirm("Are you sure you want to remove this tenant?")) {
      await supabase.from("tenants").delete().eq("id", id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">All tenants and their rent status.</p>
        <button 
          onClick={handleAddTenant}
          disabled={adding}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold transition hover:bg-muted"
        >
          <UserPlus size={15} /> Add Tenant
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading tenants...</p>
      ) : tenants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium text-foreground">No tenants exist yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Tenant</th>
                <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Room ID</th>
                <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Rent Status</th>
                <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Due Date</th>
                <th className="px-5 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition">
                  <td className="px-5 py-3.5 font-medium">{t.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{t.room_id || "Unassigned"}</td>
                  <td className="px-5 py-3.5">
                    <button 
                      onClick={() => handleUpdateRent(t.id, t.rent_status)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition hover:opacity-80 ${
                        t.rent_status === "Paid" ? "bg-emerald-100 text-emerald-700"
                          : t.rent_status === "Due" ? "bg-amber-50 text-amber-600"
                            : "bg-red-100 text-red-600"
                      }`}
                      title="Click to cycle status"
                    >
                      {t.rent_status}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{t.due_date || "Not set"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button 
                      onClick={() => handleDeleteTenant(t.id)}
                      className="text-muted-foreground hover:text-red-500 transition"
                      title="Remove Tenant"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StaffSection() {
  const { data: staff, loading } = useRealtimeData("staff", "name", true);
  const [adding, setAdding] = useState(false);

  const handleAddStaff = async () => {
    setAdding(true);
    const staffName = prompt("Enter new staff member name:");
    if (staffName) {
      const role = prompt("Enter role (e.g. Maintenance, Cleaning):") || "Staff";
      await supabase.from("staff").insert({ name: staffName, role: role, status: "active", tasks: 0 });
    }
    setAdding(false);
  };

  const handleDeleteStaff = async (id: string) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      await supabase.from("staff").delete().eq("id", id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage house staff — maintenance workers and cleaning crew.</p>
        <button 
          onClick={handleAddStaff}
          disabled={adding}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition"
        >
          <UserPlus size={15} /> Add Staff
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading staff...</p>
      ) : staff.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium text-foreground">No staff members exist yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {staff.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-[#dbeafe] text-[#2563eb] text-sm font-bold uppercase">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteStaff(s.id)}
                  className="text-muted-foreground hover:text-red-500 transition"
                  title="Remove Staff"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.tasks} active tasks</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                  s.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                }`}>{s.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function MaintenanceSection() {
  const { data: maintenance, loading } = useRealtimeData("maintenance_requests", "created_at", false);
  const [adding, setAdding] = useState(false);

  const handleAddRequest = async () => {
    setAdding(true);
    const issue = prompt("Describe the maintenance issue:");
    if (issue) {
      await supabase.from("maintenance_requests").insert({ 
        issue, 
        status: "pending",
        date_reported: new Date().toLocaleDateString()
      });
    }
    setAdding(false);
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "pending" ? "in-progress" : currentStatus === "in-progress" ? "done" : "pending";
    await supabase.from("maintenance_requests").update({ status: nextStatus }).eq("id", id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Track and manage maintenance requests.</p>
        <button 
          onClick={handleAddRequest}
          disabled={adding}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition"
        >
          <Wrench size={15} /> Add Request
        </button>
      </div>
      
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading maintenance requests...</p>
      ) : maintenance.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium text-foreground">No maintenance requests.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {maintenance.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition">
              <div className="flex items-center gap-4">
                <div className={`grid size-9 place-items-center rounded-xl cursor-pointer transition hover:opacity-80 ${
                  m.status === "done" ? "bg-emerald-100 text-emerald-600"
                    : m.status === "in-progress" ? "bg-blue-100 text-blue-600"
                      : "bg-amber-50 text-amber-600"
                }`}
                onClick={() => handleUpdateStatus(m.id, m.status)}
                title="Click to cycle status"
                >
                  {m.status === "done" ? <Check size={16} /> : m.status === "in-progress" ? <Wrench size={16} /> : <AlertCircle size={16} />}
                </div>
                <div>
                  <p className="text-sm font-medium">{m.issue}</p>
                  <p className="text-xs text-muted-foreground">Room {m.room_id || "Unassigned"} · {m.date_reported}</p>
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
      )}
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
