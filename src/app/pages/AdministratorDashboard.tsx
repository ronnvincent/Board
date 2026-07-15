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
  Edit2,
  Trash2,
} from "lucide-react";
import { useEffect } from "react";
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
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

  const totalHouses = houses.length;
  const totalAdmins = admins.length;
  const totalUsers = profiles.length;
  
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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to revoke this admin's access? This will permanently delete their account.")) {
      await supabase.from("admins").delete().eq("id", id);
    }
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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this property? This cannot be undone.")) {
      await supabase.from("houses").delete().eq("id", id);
    }
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

      <HouseModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        house={houseToEdit} 
      />
    </div>
  );
}

function HouseModal({ isOpen, onClose, house }: { isOpen: boolean, onClose: () => void, house: any }) {
  const [name, setName] = useState(house?.name || "");
  const [rooms, setRooms] = useState(house?.rooms?.toString() || "");
  const [position, setPosition] = useState<[number, number]>(
    house?.latitude && house?.longitude 
      ? [house.latitude, house.longitude] 
      : [14.5995, 120.9842] // Default to Manila
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(house?.name || "");
    setRooms(house?.rooms?.toString() || "");
    if (house?.latitude && house?.longitude) {
      setPosition([house.latitude, house.longitude]);
    } else {
      setPosition([14.5995, 120.9842]);
    }
  }, [house, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name,
      rooms: parseInt(rooms || "0", 10),
      latitude: position[0],
      longitude: position[1]
    };

    if (house) {
      await supabase.from("houses").update(payload).eq("id", house.id);
    } else {
      const { data: newHouse, error } = await supabase.from("houses").insert(payload).select().single();
      
      if (!error && newHouse) {
        const capacity = payload.rooms;
        if (capacity > 0) {
          const roomInserts = Array.from({ length: capacity }).map((_, i) => ({
            house_id: newHouse.id,
            number: String(i + 1).padStart(2, '0'),
            status: "vacant",
            price: 5000,
            features: ["Wi-Fi", "AC"]
          }));
          await supabase.from("rooms").insert(roomInserts);
        }
      }
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
        <h3 className="font-bold text-lg mb-4">{house ? "Edit Boarding House" : "Create Boarding House"}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground">Property Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">Total Room Capacity</label>
            <input type="number" min="0" value={rooms} onChange={(e) => setRooms(e.target.value)} className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">Location Pin (Click on map to set)</label>
            <div className="mt-1 h-[200px] w-full rounded-xl overflow-hidden border border-border relative z-0">
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
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted transition">Cancel</button>
          <button onClick={handleSave} disabled={saving || !name || !rooms} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition disabled:opacity-50">
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

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to permanently delete this user?")) {
      await supabase.from("profiles").delete().eq("id", userId);
    }
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
                          'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <option value="user">Resident</option>
                        <option value="admin">Admin</option>
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
