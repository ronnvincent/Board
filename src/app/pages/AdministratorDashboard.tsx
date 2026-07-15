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
  User,
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

import { useRealtimeData } from "../hooks/useRealtimeData";
import { supabase } from "../../lib/supabase";

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
      {activeNav === "users" && <UsersSection />}
      {activeNav === "activity" && <ActivitySection />}
      {activeNav === "settings" && <SettingsPlaceholder />}
    </DashboardLayout>
  );
}

function OverviewSection() {
  const { data: houses } = useRealtimeData("houses", "created_at", true);
  const { data: admins } = useRealtimeData("admins");

  // Calculate totals across all houses
  const totalHouses = houses.length;
  const totalAdmins = admins.length;
  
  // We don't have "users" or "revenue" tables yet, so we will show 0 for now.
  // In a real production system, these would aggregate from tenants and payments tables.

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Houses" value={totalHouses} icon={<Building2 size={19} />} trend="neutral" trendText="Live from DB" index={0} />
        <StatCard title="Total Admins" value={totalAdmins} icon={<Shield size={19} />} colorClass="bg-[#f2e3c1] text-[#8c6b37]" index={1} />
        <StatCard title="Total Users" value={0} subtitle="residents" icon={<Users size={19} />} trend="neutral" colorClass="bg-[#dbeafe] text-[#2563eb]" index={2} />
        <StatCard title="Monthly Revenue" value="₱0" icon={<Home size={19} />} trend="neutral" colorClass="bg-[#e6efe8] text-primary" index={3} />
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
            <span className="font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">{houses.length} properties</span>
          </div>
          
          {houses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No boarding houses exist yet.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Go to the Houses tab to create one.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {houses.map((house) => {
                // Find admin assigned to this house
                const assignedAdmin = admins.find(a => a.house_id === house.id);
                return (
                  <div key={house.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{house.name}</p>
                        <p className="text-xs text-muted-foreground">{assignedAdmin ? assignedAdmin.name : "Unassigned"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold">0<span className="text-muted-foreground font-normal">/{house.rooms}</span></p>
                        <p className="text-[10px] text-muted-foreground font-['DM_Mono'] uppercase">0% collected</p>
                      </div>
                      <ChevronRight size={15} className="text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
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
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Recent Activity</h3>
            <Activity size={15} className="text-muted-foreground" />
          </div>
          <div className="flex h-[200px] flex-col items-center justify-center text-center px-4">
            <p className="text-sm text-muted-foreground">Activity logs will appear here</p>
            <p className="text-xs text-muted-foreground/70 mt-1">As your platforms runs, real-time events will stream in.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AdminsSection() {
  const { data: admins, loading: loadingAdmins } = useRealtimeData("admins", "name", true);
  const { data: houses } = useRealtimeData("houses", "name", true);
  const [adding, setAdding] = useState(false);

  const handleAddAdmin = async () => {
    setAdding(true);
    const adminName = prompt("Enter new Admin's full name:");
    if (adminName) {
      const email = prompt("Enter admin email:");
      if (email) {
        await supabase.from("admins").insert({ name: adminName, email, status: "active" });
      }
    }
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage admin accounts and their assigned boarding houses.</p>
        <button 
          onClick={handleAddAdmin}
          disabled={adding}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition disabled:opacity-50"
        >
          <UserPlus size={15} /> Add Admin
        </button>
      </div>
      
      {loadingAdmins ? (
        <p className="text-sm text-muted-foreground">Loading admins...</p>
      ) : admins.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium text-foreground">No admins exist yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Name</th>
                <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Email</th>
                <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">House ID</th>
                <th className="px-5 py-3 text-left font-['DM_Mono'] text-[10px] uppercase tracking-[.1em] text-muted-foreground">Status</th>
                <th className="px-5 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-muted/20 transition">
                  <td className="px-5 py-3.5 font-medium">{admin.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{admin.email}</td>
                  <td className="px-5 py-3.5">{admin.house_id || "Unassigned"}</td>
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
      )}
    </div>
  );
}

function HousesSection() {
  const { data: houses, loading: loadingHouses } = useRealtimeData("houses", "created_at", false);
  const { data: admins } = useRealtimeData("admins");
  const [adding, setAdding] = useState(false);

  const handleAddHouse = async () => {
    setAdding(true);
    const houseName = prompt("Enter the name of the new boarding house:");
    if (houseName) {
      const roomCapacity = prompt("How many total rooms does it have?");
      await supabase.from("houses").insert({ 
        name: houseName, 
        rooms: parseInt(roomCapacity || "0", 10) 
      });
    }
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">All registered boarding houses across the platform.</p>
        <button 
          onClick={handleAddHouse}
          disabled={adding}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition disabled:opacity-50"
        >
          <Building2 size={15} /> Add House
        </button>
      </div>

      {loadingHouses ? (
        <p className="text-sm text-muted-foreground">Loading houses...</p>
      ) : houses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium text-foreground">No houses exist yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {houses.map((house, i) => {
            const assignedAdmin = admins.find(a => a.house_id === house.id);
            return (
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
                    <p className="text-xs text-muted-foreground">{assignedAdmin ? assignedAdmin.name : "Unassigned Admin"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-lg font-bold">{house.rooms}</p>
                    <p className="text-[9px] font-['DM_Mono'] uppercase text-muted-foreground">Rooms</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-lg font-bold">0</p>
                    <p className="text-[9px] font-['DM_Mono'] uppercase text-muted-foreground">Occupied</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-lg font-bold">0%</p>
                    <p className="text-[9px] font-['DM_Mono'] uppercase text-muted-foreground">Collected</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActivitySection() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Platform-wide activity log.</p>
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="text-sm font-medium text-foreground">No recent activity.</p>
      </div>
    </div>
  );
}

function UsersSection() {
  const { data: profiles, loading } = useRealtimeData("profiles", "created_at", true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Libre_Baskerville'] text-2xl tracking-tight">All Users</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage all registered accounts across the platform.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading users...</td></tr>
              ) : profiles.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                profiles.map((profile: any) => (
                  <tr key={profile.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                          <User size={14} />
                        </div>
                        {profile.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${
                        profile.role === 'administrator' ? 'bg-amber-100 text-amber-700' :
                        profile.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
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
