import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Home,
  LayoutDashboard,
  BedDouble,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  UserPlus,
  Activity,
  User,
  ChevronRight,
  MoreHorizontal,
  Edit2,
  Trash2,
  MapPin,
  Wind,
  Wifi,
  Bath,
  Plus,
  X,
  Info,
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Megaphone,
  Clock,
  Wrench,
  MessageSquare
} from "lucide-react";
import { useEffect } from "react";
import DashboardLayout, { type NavItem } from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import RoleBadge from "../components/dashboard/RoleBadge";

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, id: "dashboard" },
  { label: "Maintenance", icon: <Wrench size={18} />, id: "maintenance" },
  { label: "Announcements", icon: <Megaphone size={18} />, id: "announcements" },
  { label: "Security Gate", icon: <ShieldCheck size={18} />, id: "security" },
  { label: "Admissions", icon: <Activity size={18} />, id: "admissions" },
  { label: "Admins", icon: <Shield size={18} />, id: "admins" },
  { label: "All Houses", icon: <Building2 size={18} />, id: "houses" },
  { label: "All Users", icon: <Users size={18} />, id: "users" },
  { label: "Activity Log", icon: <Activity size={18} />, id: "activity" },
  { label: "Settings", icon: <Settings size={18} />, id: "settings" },
];

import { useRealtimeData } from "../hooks/useRealtimeData";
import { supabase } from "../../lib/supabase";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Scanner } from "@yudiel/react-qr-scanner";

// Fix for default marker icon in react-leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function LocationPicker({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return <Marker position={position} />;
}

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
      {activeNav === "maintenance" && <MaintenanceSection />}
      {activeNav === "announcements" && <AnnouncementsSection />}
      {activeNav === "security" && <SecurityGateSection />}
      {activeNav === "admissions" && <AdmissionsSection />}
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
  const { data: profiles } = useRealtimeData("profiles");
  const { data: rooms } = useRealtimeData("rooms");
  const { data: tenants } = useRealtimeData("tenants");

  const totalHouses = houses.length;
  const totalAdmins = admins.length;
  const totalUsers = profiles.length;
  const pendingAdmissions = (tenants as any[]).filter((tenant: any) => tenant.rent_status === "Due" && tenant.profile_id);
  
  const monthlyRevenue = rooms
    .filter((r: any) => r.status === "occupied")
    .reduce((sum: number, room: any) => sum + (room.price || 0), 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Houses" value={totalHouses} icon={<Building2 size={19} />} trend="neutral" trendText="Live from DB" index={0} />
        <StatCard title="Total Admins" value={totalAdmins} icon={<Shield size={19} />} colorClass="bg-[#f2e3c1] text-[#8c6b37]" index={1} />
        <StatCard title="Total Users" value={totalUsers} subtitle="registered accounts" icon={<Users size={19} />} trend="neutral" colorClass="bg-[#dbeafe] text-[#2563eb]" index={2} />
        <StatCard title="Monthly Revenue" value={`₱${monthlyRevenue.toLocaleString()}`} icon={<Home size={19} />} trend="neutral" colorClass="bg-[#e6efe8] text-primary" index={3} />
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
                const assignedAdmin = admins.find(a => a.house_id === house.id);
                const houseRooms = rooms.filter((r: any) => r.house_id === house.id);
                const occupiedCount = houseRooms.filter((r: any) => r.status === "occupied").length;
                const capacity = house.rooms || 0;
                const occupancyPercent = capacity > 0 ? Math.round((occupiedCount / capacity) * 100) : 0;

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
                        <p className="text-sm font-bold">{occupiedCount}<span className="text-muted-foreground font-normal">/{capacity}</span></p>
                        <p className="text-[10px] text-muted-foreground font-['DM_Mono'] uppercase">{occupancyPercent}% occupied</p>
                      </div>
                      <ChevronRight size={15} className="text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Admissions summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Admissions Queue</h3>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase text-amber-600">{pendingAdmissions.length} pending</span>
          </div>
          <div className="space-y-3 p-4">
            {pendingAdmissions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">No pending admissions right now.</div>
            ) : pendingAdmissions.slice(0, 4).map((tenant: any) => {
              const linkedRoom = rooms.find((room: any) => room.id === tenant.room_id);
              const linkedHouse = houses.find((house: any) => house.id === linkedRoom?.house_id);
              return (
                <div key={tenant.id} className="rounded-xl border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{tenant.name}</p>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase text-amber-600">Pending</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{linkedHouse?.name || "House not assigned"} • {linkedRoom ? `Room ${linkedRoom.number}` : "Room pending"}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AdmissionsSection() {
  const { data: tenants } = useRealtimeData("tenants");
  const { data: rooms } = useRealtimeData("rooms");
  const { data: houses } = useRealtimeData("houses");

  const pendingAdmissions = (tenants as any[]).filter((tenant: any) => tenant.rent_status === "Due" && tenant.profile_id);
  const approvedAdmissions = (tenants as any[]).filter((tenant: any) => tenant.rent_status === "Paid" && tenant.profile_id);

  const handleApprove = async (tenantId: string) => {
    await supabase.from("tenants").update({ rent_status: "Paid" }).eq("id", tenantId);
  };

  const handleDecline = async (tenantId: string) => {
    if (window.confirm("Are you sure you want to decline this application?")) {
      await supabase.from("tenants").delete().eq("id", tenantId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Admissions Queue</h3>
            <p className="text-sm text-muted-foreground">Review room requests and approve residents from a single place.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <div className="rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-600">{pendingAdmissions.length} pending</div>
            <div className="rounded-full bg-emerald-100 px-3 py-1.5 font-semibold text-emerald-700">{approvedAdmissions.length} approved</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {pendingAdmissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground lg:col-span-2">No pending admissions.</div>
        ) : pendingAdmissions.map((tenant: any) => {
          const linkedRoom = rooms.find((room: any) => room.id === tenant.room_id);
          const linkedHouse = houses.find((house: any) => house.id === linkedRoom?.house_id);

          return (
            <div key={tenant.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{tenant.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Awaiting admission review</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase text-amber-600">Pending</span>
              </div>
              <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                <p>{linkedHouse?.name || "House not assigned"}</p>
                <p className="mt-1">{linkedRoom ? `Room ${linkedRoom.number}` : "Room pending"}</p>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => handleDecline(tenant.id)} className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted">Decline</button>
                <button onClick={() => handleApprove(tenant.id)} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-[#173f39]">Approve</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminsSection() {
  const { data: admins, loading: loadingAdmins } = useRealtimeData("admins", "name", true);
  const { data: houses } = useRealtimeData("houses", "name", true);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState<any>(null);

  const handleCreate = () => {
    setAdminToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (admin: any) => {
    setAdminToEdit(admin);
    setModalOpen(true);
  };

  const [adminToDelete, setAdminToDelete] = useState<any>(null);

  const handleDelete = async (id: string) => {
    setAdminToDelete(admins.find((admin: any) => admin.id === id) || null);
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    await supabase.from("admins").delete().eq("id", adminToDelete.id);
    setAdminToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage admin accounts and their assigned boarding houses.</p>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition"
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
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => handleEdit(admin)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition" title="Edit Admin">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(admin.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Revoke Access">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        admin={adminToEdit} 
        houses={houses} 
      />

      {adminToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold">Revoke Admin Access</h3>
            <p className="mt-2 text-sm text-muted-foreground">This will permanently delete the selected admin account.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setAdminToDelete(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted">Cancel</button>
              <button type="button" onClick={confirmDeleteAdmin} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function AdminModal({ isOpen, onClose, admin, houses }: { isOpen: boolean, onClose: () => void, admin: any, houses: any[] }) {
  const [name, setName] = useState(admin?.name || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [houseId, setHouseId] = useState(admin?.house_id || "unassigned");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(admin?.name || "");
    setEmail(admin?.email || "");
    setHouseId(admin?.house_id || "unassigned");
  }, [admin, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name,
      email,
      house_id: houseId === "unassigned" ? null : houseId,
      status: "active"
    };

    if (admin) {
      await supabase.from("admins").update(payload).eq("id", admin.id);
    } else {
      await supabase.from("admins").insert(payload);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <h3 className="font-bold text-lg mb-4">{admin ? "Edit Admin" : "Create Admin"}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">Assigned House</label>
            <select value={houseId} onChange={(e) => setHouseId(e.target.value)} className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="unassigned">None (Unassigned)</option>
              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted transition">Cancel</button>
          <button onClick={handleSave} disabled={saving || !name || !email} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Admin"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function HousesSection() {
  const { data: houses, loading: loadingHouses } = useRealtimeData("houses", "created_at", false);
  const { data: admins } = useRealtimeData("admins");
  const { data: allRooms } = useRealtimeData("rooms");
  const [modalOpen, setModalOpen] = useState(false);
  const [houseToEdit, setHouseToEdit] = useState<any>(null);

  const handleCreate = () => {
    setHouseToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (house: any) => {
    setHouseToEdit(house);
    setModalOpen(true);
  };

  const [houseToDelete, setHouseToDelete] = useState<any>(null);

  const handleDelete = async (id: string) => {
    setHouseToDelete(houses.find((house: any) => house.id === id) || null);
  };

  const confirmDeleteHouse = async () => {
    if (!houseToDelete) return;
    await supabase.from("houses").delete().eq("id", houseToDelete.id);
    setHouseToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">All registered boarding houses across the platform.</p>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition"
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
            const houseRooms = allRooms.filter((r: any) => r.house_id === house.id);
            const occupiedCount = houseRooms.filter((r: any) => r.status === "occupied").length;
            const prices = houseRooms.map((r: any) => r.price || 0).filter((p: number) => p > 0);
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
            const monthlyRevenue = houseRooms
              .filter((r: any) => r.status === "occupied")
              .reduce((sum: number, r: any) => sum + (r.price || 0), 0);
            const collectionRate = houseRooms.length > 0 ? Math.round((occupiedCount / houseRooms.length) * 100) : 0;

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
                  <div className="flex-1">
                    <p className="text-sm font-bold">{house.name}</p>
                    <p className="text-xs text-muted-foreground">{assignedAdmin ? assignedAdmin.name : "Unassigned Admin"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(house)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition" title="Edit Property">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(house.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete Property">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-lg font-bold">{house.rooms}</p>
                    <p className="text-[9px] font-['DM_Mono'] uppercase text-muted-foreground">Rooms</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-lg font-bold">{occupiedCount}</p>
                    <p className="text-[9px] font-['DM_Mono'] uppercase text-muted-foreground">Occupied</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-lg font-bold">{collectionRate}%</p>
                    <p className="text-[9px] font-['DM_Mono'] uppercase text-muted-foreground">Occupancy</p>
                  </div>
                </div>
                {/* Price Range & Revenue */}
                {prices.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-emerald-50 p-2">
                      <p className="text-[9px] font-['DM_Mono'] uppercase text-emerald-600/70">Price Range</p>
                      <p className="text-sm font-bold text-emerald-700">
                        {minPrice === maxPrice 
                          ? `₱${minPrice.toLocaleString()}` 
                          : `₱${minPrice.toLocaleString()} – ₱${maxPrice.toLocaleString()}`}
                        <span className="text-[9px] font-normal text-emerald-600/70">/mo</span>
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-2">
                      <p className="text-[9px] font-['DM_Mono'] uppercase text-blue-600/70">Revenue</p>
                      <p className="text-sm font-bold text-blue-700">
                        ₱{monthlyRevenue.toLocaleString()}
                        <span className="text-[9px] font-normal text-blue-600/70">/mo</span>
                      </p>
                    </div>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2">
                  <div>
                    <p className="text-[10px] font-['DM_Mono'] uppercase tracking-[.14em] text-muted-foreground">Location</p>
                    <p className="text-sm font-semibold">{house.latitude != null && house.longitude != null ? "Pinned" : "Not pinned"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEdit(house)}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                  >
                    <MapPin size={13} /> Set Location
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <HouseModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        house={houseToEdit} 
      />

      {houseToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold">Delete Boarding House</h3>
            <p className="mt-2 text-sm text-muted-foreground">This action cannot be undone and will remove the selected property.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setHouseToDelete(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted">Cancel</button>
              <button type="button" onClick={confirmDeleteHouse} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

type RoomTier = {
  id: string;
  name: string;
  price: string;
  count: string;
  hasAC: boolean;
  hasWifi: boolean;
  hasPrivateBath: boolean;
};

const TIER_ACCENTS = [
  { border: "border-l-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  { border: "border-l-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  { border: "border-l-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  { border: "border-l-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
  { border: "border-l-rose-500", bg: "bg-rose-50", text: "text-rose-700" },
];

function AmenityToggle({ icon, label, active, onToggle }: { icon: React.ReactNode; label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted/60 text-muted-foreground hover:bg-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function createDefaultTier(totalRooms: string): RoomTier {
  return {
    id: Math.random().toString(36).substring(2, 9),
    name: "Standard",
    price: "5000",
    count: totalRooms || "0",
    hasAC: true,
    hasWifi: true,
    hasPrivateBath: false,
  };
}

function HouseModal({ isOpen, onClose, house }: { isOpen: boolean, onClose: () => void, house: any }) {
  const [name, setName] = useState(house?.name || "");
  const [rooms, setRooms] = useState(house?.rooms?.toString() || "");
  const [position, setPosition] = useState<[number, number]>(
    house?.latitude && house?.longitude 
      ? [house.latitude, house.longitude] 
      : [14.5995, 120.9842]
  );
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers] = useState<RoomTier[]>([createDefaultTier("")]);

  useEffect(() => {
    setName(house?.name || "");
    setRooms(house?.rooms?.toString() || "");
    if (house?.latitude && house?.longitude) {
      setPosition([house.latitude, house.longitude]);
    } else {
      setPosition([14.5995, 120.9842]);
    }
    // Reset tiers when opening modal
    if (!house) {
      setTiers([createDefaultTier("")]);
    } else {
      setTiers([createDefaultTier(house?.rooms?.toString() || "")]);
    }
  }, [house, isOpen]);

  // Keep default tier count in sync with total capacity when only 1 tier exists
  useEffect(() => {
    if (tiers.length === 1) {
      setTiers(prev => [{ ...prev[0], count: rooms }]);
    }
  }, [rooms]);

  if (!isOpen) return null;

  const totalCapacity = parseInt(rooms || "0", 10);
  const assignedRooms = tiers.reduce((sum, t) => sum + (parseInt(t.count || "0", 10)), 0);
  const isBalanced = assignedRooms === totalCapacity;
  const isOver = assignedRooms > totalCapacity;

  const updateTier = (id: string, updates: Partial<RoomTier>) => {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addTier = () => {
    const remaining = totalCapacity - assignedRooms;
    setTiers(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 9),
      name: prev.length === 1 ? "Deluxe" : prev.length === 2 ? "Premium" : `Tier ${prev.length + 1}`,
      price: "7000",
      count: String(Math.max(0, remaining)),
      hasAC: true,
      hasWifi: true,
      hasPrivateBath: prev.length >= 1,
    }]);
  };

  const removeTier = (id: string) => {
    if (tiers.length <= 1) return;
    setTiers(prev => prev.filter(t => t.id !== id));
  };

  // Pricing summary
  const tierPrices = tiers.map(t => parseInt(t.price || "0", 10)).filter(p => p > 0);
  const minPrice = tierPrices.length > 0 ? Math.min(...tierPrices) : 0;
  const maxPrice = tierPrices.length > 0 ? Math.max(...tierPrices) : 0;
  const estimatedRevenue = tiers.reduce((sum, t) => {
    return sum + (parseInt(t.count || "0", 10) * parseInt(t.price || "0", 10));
  }, 0);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name,
      rooms: totalCapacity,
      latitude: position[0],
      longitude: position[1]
    };

    if (house) {
      // Edit mode: only update house info, not rooms
      await supabase.from("houses").update(payload).eq("id", house.id);
    } else {
      // Create mode: insert house + generate rooms from tiers
      const { data: newHouse, error } = await supabase.from("houses").insert(payload).select().single();
      
      if (!error && newHouse) {
        const roomInserts: any[] = [];
        let roomIndex = 0;

        for (const tier of tiers) {
          const tierCount = parseInt(tier.count || "0", 10);
          const tierPrice = parseInt(tier.price || "0", 10);
          const features: string[] = [];
          if (tier.hasAC) features.push("AC");
          if (tier.hasWifi) features.push("Wi-Fi");
          if (tier.hasPrivateBath) features.push("Private Bath");

          for (let i = 0; i < tierCount; i++) {
            roomIndex++;
            roomInserts.push({
              house_id: newHouse.id,
              number: String(roomIndex).padStart(2, '0'),
              status: "vacant",
              price: tierPrice,
              features,
              description: `${tier.name} room — ${features.join(", ") || "Basic amenities"}`,
            });
          }
        }

        if (roomInserts.length > 0) {
          await supabase.from("rooms").insert(roomInserts);
        }
      }
    }
    setSaving(false);
    onClose();
  };

  const canSave = name && totalCapacity > 0 && isBalanced && tiers.every(t => t.name && parseInt(t.price || "0", 10) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <h3 className="font-bold text-lg mb-1">{house ? "Edit Boarding House" : "Create Boarding House"}</h3>
        <p className="text-sm text-muted-foreground mb-5">Configure property details and room pricing.</p>
        
        <div className="space-y-5">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground">Property Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Total Room Capacity</label>
              <input type="number" min="0" value={rooms} onChange={(e) => setRooms(e.target.value)} className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-bold text-muted-foreground">Location Pin (Click on map to set)</label>
            <div className="mt-1 h-[180px] w-full rounded-xl overflow-hidden border border-border relative z-0">
              <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Coordinates: {position[0].toFixed(4)}, {position[1].toFixed(4)}</p>
          </div>

          {/* Room Tiers Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Room Configuration</label>
                <p className="text-[10px] text-muted-foreground mt-0.5">Define room types with pricing and amenities.</p>
              </div>
              {!house && totalCapacity > 0 && (
                <button
                  type="button"
                  onClick={addTier}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
                >
                  <Plus size={13} /> Add Tier
                </button>
              )}
            </div>

            {house ? (
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  Room tiers only apply when creating new rooms. To change existing room prices and amenities, edit them individually in the <strong>Rooms</strong> tab.
                </p>
              </div>
            ) : totalCapacity === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-xs text-muted-foreground">Set a total room capacity above to configure room tiers.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {tiers.map((tier, i) => {
                    const accent = TIER_ACCENTS[i % TIER_ACCENTS.length];
                    return (
                      <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`rounded-xl border border-border bg-background p-4 border-l-4 ${accent.border}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-['DM_Mono'] uppercase tracking-[.14em] ${accent.text}`}>
                            Tier {i + 1}
                          </span>
                          {tiers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTier(tier.id)}
                              className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 mb-3">
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground">Tier Name</label>
                            <input
                              type="text"
                              value={tier.name}
                              onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                              placeholder="e.g. Standard"
                              className="w-full mt-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground">Monthly Price (₱)</label>
                            <input
                              type="number"
                              min="0"
                              value={tier.price}
                              onChange={(e) => updateTier(tier.id, { price: e.target.value })}
                              className="w-full mt-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground">Room Count</label>
                            <input
                              type="number"
                              min="0"
                              value={tier.count}
                              onChange={(e) => updateTier(tier.id, { count: e.target.value })}
                              className="w-full mt-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-primary"
                            />
                          </div>
                        </div>

                        {/* Amenity Toggles */}
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block">Amenities</label>
                          <div className="flex flex-wrap gap-2">
                            <AmenityToggle
                              icon={<Wind size={13} />}
                              label="AC"
                              active={tier.hasAC}
                              onToggle={() => updateTier(tier.id, { hasAC: !tier.hasAC })}
                            />
                            <AmenityToggle
                              icon={<Wifi size={13} />}
                              label="Wi-Fi"
                              active={tier.hasWifi}
                              onToggle={() => updateTier(tier.id, { hasWifi: !tier.hasWifi })}
                            />
                            <AmenityToggle
                              icon={<Bath size={13} />}
                              label="Private Bath"
                              active={tier.hasPrivateBath}
                              onToggle={() => updateTier(tier.id, { hasPrivateBath: !tier.hasPrivateBath })}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Room Assignment Indicator */}
                <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-semibold ${
                  isBalanced
                    ? "bg-emerald-50 text-emerald-700"
                    : isOver
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600"
                }`}>
                  <span>
                    {assignedRooms} of {totalCapacity} rooms assigned to tiers
                  </span>
                  <span>
                    {isBalanced ? "✓ Balanced" : isOver ? `${assignedRooms - totalCapacity} over capacity` : `${totalCapacity - assignedRooms} remaining`}
                  </span>
                </div>

                {/* Pricing Summary */}
                {tierPrices.length > 0 && (
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-[10px] font-['DM_Mono'] uppercase tracking-[.14em] text-muted-foreground mb-2">Pricing Summary</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Price Range</p>
                        <p className="text-sm font-bold">
                          {minPrice === maxPrice
                            ? `₱${minPrice.toLocaleString()}`
                            : `₱${minPrice.toLocaleString()} – ₱${maxPrice.toLocaleString()}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tiers</p>
                        <p className="text-sm font-bold">{tiers.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Est. Revenue</p>
                        <p className="text-sm font-bold text-primary">₱{estimatedRevenue.toLocaleString()}/mo</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted transition">Cancel</button>
          <button onClick={handleSave} disabled={saving || !canSave} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Property"}
          </button>
        </div>
      </motion.div>
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update role: " + error.message);
    }
  };

  const [userToDelete, setUserToDelete] = useState<any>(null);

  const handleDeleteUser = async (userId: string) => {
    setUserToDelete(profiles.find((profile: any) => profile.id === userId) || null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    await supabase.from("profiles").delete().eq("id", userToDelete.id);
    setUserToDelete(null);
  };

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
                      <select 
                        value={profile.role === 'resident' ? 'user' : profile.role}
                        onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full outline-none border border-transparent hover:border-border cursor-pointer appearance-none text-center ${
                          profile.role === 'administrator' ? 'bg-amber-100 text-amber-700' :
                          profile.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                          profile.role === 'staff' ? 'bg-purple-100 text-purple-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <option value="user">Tenant (User)</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin (Manager)</option>
                        <option value="administrator">Administrator</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteUser(profile.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {userToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold">Delete User</h3>
            <p className="mt-2 text-sm text-muted-foreground">This will permanently delete the selected account from the platform.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setUserToDelete(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted">Cancel</button>
              <button type="button" onClick={confirmDeleteUser} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
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

const playSound = (type: 'success' | 'error') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

function SecurityGateSection() {
  const { data: visitors } = useRealtimeData("visitors");
  const { data: profiles } = useRealtimeData("profiles");
  const { data: tenants } = useRealtimeData("tenants");
  const { data: rooms } = useRealtimeData("rooms");
  const { data: houses } = useRealtimeData("houses");

  const [scanCode, setScanCode] = useState("");
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const matchedVisitor = visitors.find((v) => v.id === lastScanned);
  const approvedVisitors = visitors
    .filter((v) => v.status === "approved")
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = scanCode.trim();
    if (!code) return;

    setLastScanned(code);
    setScanCode("");
    
    // Play sound based on result
    const matched = visitors.find((v) => v.id === code);
    if (matched) {
      playSound('success');
    } else {
      playSound('error');
    }
  };

  const handleCameraScan = (result: any) => {
    if (!result) return;
    
    let scannedText = "";
    if (Array.isArray(result) && result.length > 0) {
      scannedText = result[0].rawValue || result[0].text || result[0];
    } else if (typeof result === 'object' && result.text) {
      scannedText = result.text;
    } else if (typeof result === 'string') {
      scannedText = result;
    }

    if (scannedText && scannedText !== lastScanned) {
      setLastScanned(scannedText);
      setCameraActive(false);

      const matched = visitors.find((v) => v.id === scannedText);
      if (matched) {
        playSound('success');
      } else {
        playSound('error');
      }
    }
  };

  const handleApprove = async () => {
    if (!matchedVisitor) return;
    setIsApproving(true);
    const { error } = await supabase
      .from("visitors")
      .update({ status: "approved" })
      .eq("id", matchedVisitor.id);
    
    if (error) {
      alert("Failed to approve pass: " + error.message);
    }
    setIsApproving(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 max-w-5xl w-full">
      <div className="space-y-6 min-w-0">
        <h3 className="font-['Libre_Baskerville'] text-xl tracking-tight">Scanner</h3>
        
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col items-center">
          {cameraActive ? (
            <div className="w-full max-w-sm aspect-square relative rounded-2xl overflow-hidden bg-black mb-4">
              <Scanner 
                onScan={handleCameraScan} 
                components={{ audio: false, onOff: true, torch: true, zoom: false, finder: true }}
              />
              <button 
                onClick={() => setCameraActive(false)}
                className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 z-10"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="w-full max-w-sm aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/20 mb-4 cursor-pointer hover:bg-muted/40 transition" onClick={() => setCameraActive(true)}>
              <ShieldCheck size={48} className="text-primary/40 mb-4" />
              <p className="font-bold">Click to start camera</p>
              <p className="text-xs text-muted-foreground mt-1">Requires camera permission</p>
            </div>
          )}

          <div className="w-full max-w-sm min-w-0">
            <p className="text-xs text-center text-muted-foreground mb-3 font-bold uppercase tracking-wider">Or verify manually</p>
            <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  placeholder="Paste ID here..."
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm font-mono outline-none focus:border-primary transition"
                />
              </div>
              <button
                type="submit"
                disabled={!scanCode.trim()}
                className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition disabled:opacity-50"
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="space-y-6 min-w-0">
        <h3 className="font-['Libre_Baskerville'] text-xl tracking-tight">Verification Result</h3>
        
        {!lastScanned ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
            <ShieldCheck size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground">Waiting for scan...</p>
            <p className="text-xs text-muted-foreground mt-1">Scan a code to view visitor details.</p>
          </div>
        ) : !matchedVisitor ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center"
          >
            <XCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h4 className="font-bold text-xl text-red-900 mb-2">Invalid Gate Pass</h4>
            <p className="text-sm text-red-700">No visitor found with ID: <br/><span className="font-mono text-xs">{lastScanned}</span></p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl border p-6 ${
              matchedVisitor.status === "approved" 
                ? "border-emerald-200 bg-emerald-50" 
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b border-black/10">
              <div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                matchedVisitor.status === "approved" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
              }`}>
                {matchedVisitor.status === "approved" ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xl truncate">{matchedVisitor.visitor_name}</h4>
                <p className={`text-sm truncate ${matchedVisitor.status === "approved" ? "text-emerald-700" : "text-blue-700"}`}>
                  {matchedVisitor.status === "approved" ? "Entry Approved" : "Valid Pass (Pending)"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-black/50 mb-1">Date of Visit</p>
                <p className="font-medium text-black/80">{new Date(matchedVisitor.date_of_visit).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-black/50 mb-1">Pass ID</p>
                <p className="font-mono text-xs text-black/60 break-all">{matchedVisitor.id}</p>
              </div>
            </div>

            {matchedVisitor.status === "pending" && (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isApproving ? "Approving..." : "Approve Entry"}
              </button>
            )}
            
            {matchedVisitor.status === "approved" && (
              <div className="rounded-2xl bg-emerald-100/50 p-4 text-center">
                <p className="text-sm font-bold text-emerald-700">Visitor is cleared for entry.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="lg:col-span-2 mt-4 space-y-6 min-w-0 w-full">
        <h3 className="font-['Libre_Baskerville'] text-xl tracking-tight flex items-center gap-2">
          <Clock size={20} className="text-muted-foreground" />
          Approved Visitors History
        </h3>
        
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          {approvedVisitors.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 size={32} className="mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-sm font-medium text-foreground">No visitors approved yet</p>
            </div>
          ) : (
            <div className="w-full min-w-0 overflow-x-auto divide-y divide-border">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-4 font-bold text-muted-foreground">Visitor Name</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground">Invited By (Tenant)</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground">Room / House</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground">Date of Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {approvedVisitors.map((v) => {
                    const tenantProfile = profiles.find((p) => p.id === v.profile_id);
                    const tenantRecord = tenants.find((t) => t.profile_id === v.profile_id);
                    const room = rooms.find((r) => r.id === tenantRecord?.room_id);
                    const house = houses.find((h) => h.id === room?.house_id);

                    const tenantName = tenantProfile 
                      ? `${tenantProfile.first_name} ${tenantProfile.last_name}`
                      : "Unknown Tenant";
                    
                    return (
                      <tr key={v.id} className="hover:bg-muted/20 transition">
                        <td className="px-6 py-4 font-bold">{v.visitor_name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 text-primary p-1.5 rounded-full">
                              <User size={14} />
                            </div>
                            <span>{tenantName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {room ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={14} /> Room {room.room_number}, {house?.name || "Unknown House"}
                            </span>
                          ) : (
                            "No Room Assigned"
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(v.date_of_visit).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnnouncementsSection() {
  const { data: notices } = useRealtimeData("notices", "created_at", false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsPosting(true);
    const { error } = await supabase.from("notices").insert({
      title,
      content
    });

    if (error) {
      alert("Failed to post announcement: " + error.message);
    } else {
      setTitle("");
      setContent("");
    }
    setIsPosting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 max-w-6xl">
      <div className="space-y-6">
        <h3 className="font-['Libre_Baskerville'] text-xl tracking-tight">Post Announcement</h3>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground mb-6">
            Broadcast a notice to all tenants. It will appear on their Dashboard Community tab.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Notice Title</label>
              <input
                type="text"
                placeholder="e.g. Water Interruption"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Message Content</label>
              <textarea
                placeholder="Provide the details here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition resize-none"
              />
            </div>
            <button
              onClick={handlePost}
              disabled={!title.trim() || !content.trim() || isPosting}
              className="rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition disabled:opacity-50 mt-2"
            >
              {isPosting ? "Posting..." : "Broadcast Notice"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="font-['Libre_Baskerville'] text-xl tracking-tight">Active Announcements</h3>
        
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          {notices.length === 0 ? (
            <div className="p-12 text-center">
              <Megaphone size={32} className="mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-sm font-medium text-foreground">No active announcements</p>
              <p className="text-xs text-muted-foreground mt-1">When you post a notice, it will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notices.map((notice: any) => (
                <div key={notice.id} className="p-6 hover:bg-muted/30 transition relative group">
                  <button 
                    onClick={() => handleDelete(notice.id)}
                    className="absolute top-6 right-6 p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition"
                    title="Delete notice"
                  >
                    <Trash2 size={16} />
                  </button>
                  <h4 className="font-bold text-lg pr-12">{notice.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{new Date(notice.created_at).toLocaleString()}</p>
                  <p className="text-sm text-foreground/80">{notice.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MaintenanceSection() {
  const { data: requests, loading } = useRealtimeData("maintenance_requests", "created_at", false);
  const { data: rooms } = useRealtimeData("rooms");
  const { data: tenants } = useRealtimeData("tenants");
  const { data: profiles } = useRealtimeData("profiles");
  const { data: houses } = useRealtimeData("houses");
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const handleUpdate = async (req: any, newStatus: string) => {
    setUpdating(req.id);
    const text = replyText[req.id] || "";
    const updateData: any = { status: newStatus };
    
    if (text.trim()) {
      const originalDesc = (req.description || "").split("|||ADMIN_REPLY|||")[0];
      updateData.description = `${originalDesc}|||ADMIN_REPLY|||${text}`;
    }

    const { error } = await supabase.from("maintenance_requests").update(updateData).eq("id", req.id);
    if (error) alert("Failed to update request: " + error.message);
    else {
      setReplyText(prev => {
        const next = { ...prev };
        delete next[req.id];
        return next;
      });
    }
    setUpdating(null);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading maintenance requests...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Maintenance Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and reply to tenant repair requests.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground font-medium">No maintenance requests found.</p>
          </div>
        ) : (
          requests.map((req: any) => {
            const tenant = tenants.find((t: any) => t.id === req.tenant_id);
            const profile = profiles.find((p: any) => p.id === tenant?.profile_id);
            const room = rooms.find((r: any) => r.id === req.room_id);
            const house = houses.find((h: any) => h.id === room?.house_id);

            const [originalDesc, adminReply] = (req.description || "").split("|||ADMIN_REPLY|||");

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="border-b border-border p-5 flex flex-wrap gap-4 items-start justify-between bg-muted/20">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{req.subject || originalDesc}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground"><User size={14}/> {profile?.full_name || "Unknown"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><BedDouble size={14}/> Room {room?.number}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Building2 size={14}/> {house?.name}</span>
                      <span>•</span>
                      <span className="font-mono text-xs">{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    req.status === "done" || req.status === "Done" ? "bg-emerald-100 text-emerald-700" :
                    req.status === "in-progress" || req.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {req.status || "Open"}
                  </span>
                </div>
                
                <div className="p-5">
                  <div className="mb-6 p-4 rounded-xl bg-muted/40 border border-border/50">
                    <p className="text-sm font-medium mb-2 text-muted-foreground uppercase text-[10px] tracking-wider font-mono">Original Description</p>
                    <p className="text-sm">{originalDesc}</p>
                  </div>

                  {adminReply && (
                    <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-sm font-medium mb-2 text-primary uppercase text-[10px] tracking-wider font-mono flex items-center gap-1">
                        <MessageSquare size={12}/> Admin Reply
                      </p>
                      <p className="text-sm">{adminReply}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border mt-4">
                    <p className="text-sm font-semibold mb-3">Update & Reply</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Type a reply to the tenant..."
                        value={replyText[req.id] !== undefined ? replyText[req.id] : (adminReply || "")}
                        onChange={(e) => setReplyText({ ...replyText, [req.id]: e.target.value })}
                        className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(req, "In Progress")}
                          disabled={updating === req.id}
                          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100 transition whitespace-nowrap disabled:opacity-50"
                        >
                          Mark In Progress
                        </button>
                        <button
                          onClick={() => handleUpdate(req, "Done")}
                          disabled={updating === req.id}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition whitespace-nowrap disabled:opacity-50"
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
