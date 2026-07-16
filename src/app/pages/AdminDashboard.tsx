import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  X,
  MessageSquareText,
  BedDouble,
  KeyRound,
  Edit2,
  ImagePlus,
  User,
} from "lucide-react";
import DashboardLayout, { type NavItem } from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import HouseLoading from "../components/shared/HouseLoading";
import { compressImageToBase64 } from "../../lib/imageUtils";

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
      {activeNav === "dashboard" && <AdmissionsSection />}
    </DashboardLayout>
  );
}

function OverviewSection() {
  const { data: rooms, loading: loadingRooms } = useRealtimeData("rooms", "number", true);
  const { data: maintenance } = useRealtimeData("maintenance_requests");
  const { data: houses } = useRealtimeData("houses");
  const { data: tenants } = useRealtimeData("tenants");
  const { data: profiles } = useRealtimeData("profiles");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const occupied = rooms.filter((r) => r.status === "occupied").length;
  const total = rooms.length;
  const openTasks = maintenance.filter((m) => m.status !== "done").length;
  const occupiedByHouse = houses.map((house: any) => {
    const houseRooms = rooms.filter((room: any) => room.house_id === house.id);
    const occupiedCount = houseRooms.filter((room: any) => room.status === "occupied").length;
    return {
      ...house,
      roomCount: houseRooms.length,
      occupiedCount,
    };
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Occupied" value={occupied} subtitle={`/${total}`} icon={<Home size={19} />} index={0} />
        <StatCard title="Due Today" value={0} icon={<ClipboardList size={19} />} colorClass="bg-[#f2e3c1] text-[#876127]" index={1} />
        <StatCard title="Open Tasks" value={openTasks} icon={<Wrench size={19} />} colorClass="bg-[#eee4d6] text-muted-foreground" index={2} />
        <StatCard title="Collection Rate" value="100%" icon={<Building2 size={19} />} trend="up" trendText="+0%" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">House & Room Overview</h3>
              <span className="text-[10px] font-['DM_Mono'] uppercase tracking-[.12em] text-muted-foreground">Live snapshot</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {occupiedByHouse.map((house: any) => (
                <div key={house.id} className="rounded-xl border border-border bg-background/70 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{house.name}</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{house.occupiedCount}/{house.roomCount}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Rooms: {house.roomCount} • Occupied: {house.occupiedCount}</p>
                </div>
              ))}
            </div>
          </div>

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
              <HouseLoading size="sm" label="Loading rooms..." className="h-[200px]" />
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
                    onClick={() => setSelectedRoomId(room.id)}
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
        </div>

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

      {/* Room Detail Modal */}
      <AnimatePresence>
        {selectedRoomId && (() => {
          const room = rooms.find((r: any) => r.id === selectedRoomId);
          if (!room) return null;
          const house = houses.find((h: any) => h.id === room.house_id);
          const roomTenants = (tenants as any[]).filter((t: any) => t.room_id === room.id);
          const maxOccupants = room.max_occupants || 1;
          const isOccupied = room.status === "occupied";

          return (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={() => setSelectedRoomId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`grid size-10 place-items-center rounded-xl text-sm font-bold ${
                      isOccupied ? "bg-emerald-100 text-emerald-700" : "bg-amber-50 text-amber-600"
                    }`}>
                      {room.number}
                    </div>
                    <div>
                      <h3 className="font-['Libre_Baskerville'] text-base font-bold">Room {room.number}</h3>
                      <p className="text-xs text-muted-foreground">
                        {house?.name || "Unknown House"} · {roomTenants.length}/{maxOccupants} occupants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      isOccupied ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {room.status}
                    </span>
                    <button
                      onClick={() => setSelectedRoomId(null)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-muted transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Room details */}
                {room.price > 0 && (
                  <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Rent</span>
                    <span className="font-bold text-primary">₱{room.price.toLocaleString()}</span>
                  </div>
                )}

                {/* Tenants list */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {roomTenants.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <BedDouble size={28} className="mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No tenants in this room</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      <div className="px-5 py-2 bg-muted/20">
                        <p className="text-[10px] font-['DM_Mono'] uppercase tracking-wider text-muted-foreground">
                          {roomTenants.length} {roomTenants.length === 1 ? "tenant" : "tenants"}
                        </p>
                      </div>
                      {roomTenants.map((tenant: any) => {
                        const profile = profiles.find((p: any) => p.id === tenant.profile_id);
                        const moveIn = tenant.created_at
                          ? new Date(tenant.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—";
                        return (
                          <div key={tenant.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition">
                            <div className="flex items-center gap-3">
                              {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="size-9 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                                  <User size={14} />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold">{tenant.name}</p>
                                <p className="text-[10px] text-muted-foreground">Moved in {moveIn}</p>
                              </div>
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              tenant.rent_status === "Paid"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}>
                              {tenant.rent_status || "Due"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function AdmissionsSection() {
  const { data: tenants } = useRealtimeData("tenants");
  const { data: rooms } = useRealtimeData("rooms");
  const { data: houses } = useRealtimeData("houses");
  const [activeTab, setActiveTab] = useState<"requests" | "approved">("requests");
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const pendingRequests = tenants.filter((tenant: any) => tenant.rent_status === "Due" && tenant.profile_id);
  const approvedRequests = tenants.filter((tenant: any) => tenant.rent_status === "Paid" && tenant.profile_id);

  const handleApprove = async (tenantId: string) => {
    await supabase.from("tenants").update({ rent_status: "Paid" }).eq("id", tenantId);
    setSelectedTenantId(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Admissions Queue</h3>
            <p className="text-sm text-muted-foreground">Review room applications, assign rooms, and approve residents.</p>
          </div>
          <div className="flex rounded-full border border-border bg-background p-1">
            <button onClick={() => setActiveTab("requests")} className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${activeTab === "requests" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Requests</button>
            <button onClick={() => setActiveTab("approved")} className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${activeTab === "approved" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Approved</button>
          </div>
        </div>
      </div>

      {activeTab === "requests" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {pendingRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground lg:col-span-2">No admission requests pending.</div>
          ) : pendingRequests.map((tenant: any) => {
            const linkedRoom = rooms.find((room: any) => room.id === tenant.room_id);
            const linkedHouse = houses.find((house: any) => house.id === linkedRoom?.house_id);
            return (
              <motion.div key={tenant.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{tenant.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Admission request for {linkedRoom ? `Room ${linkedRoom.number}` : "an available space"}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase text-amber-600">Pending</span>
                </div>
                <div className="mt-4 rounded-xl border border-border bg-background/70 p-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><MessageSquareText size={14} className="text-primary" /> Resident request received.</div>
                  <div className="mt-2 flex items-center gap-2"><Home size={14} className="text-primary" /> {linkedHouse?.name || "House not assigned"}</div>
                  <div className="mt-2 flex items-center gap-2"><BedDouble size={14} className="text-primary" /> {linkedRoom ? `Room ${linkedRoom.number}` : "No room assigned yet"}</div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setSelectedTenantId(tenant.id)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted">Review</button>
                  <button onClick={() => handleApprove(tenant.id)} className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-[#173f39]">Approve</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {approvedRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground lg:col-span-2">No approved admissions yet.</div>
          ) : approvedRequests.map((tenant: any) => {
            const linkedRoom = rooms.find((room: any) => room.id === tenant.room_id);
            const linkedHouse = houses.find((house: any) => house.id === linkedRoom?.house_id);
            return (
              <div key={tenant.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{tenant.name}</p>
                    <p className="text-xs text-muted-foreground">Approved resident</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-emerald-700">Approved</span>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>{linkedHouse?.name || "House"} · {linkedRoom ? `Room ${linkedRoom.number}` : "No room assigned"}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTenantId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="shrink-0 p-6 pb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Admission Review</h3>
                <p className="text-sm text-muted-foreground">Confirm the room and house details before approving.</p>
              </div>
              <button type="button" onClick={() => setSelectedTenantId(null)} className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:bg-muted"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-0">
              <div className="rounded-xl border border-border bg-background/70 p-4">
                <p className="text-sm font-semibold">{tenants.find((tenant: any) => tenant.id === selectedTenantId)?.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">This resident is ready for admission. Assign a room and approve them from here.</p>
              </div>
            </div>
            <div className="shrink-0 p-6 pt-4 flex justify-end gap-2">
              <button onClick={() => setSelectedTenantId(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted">Close</button>
              <button onClick={() => handleApprove(selectedTenantId)} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-[#173f39]">Approve Admission</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function RoomsSection() {
  const { data: rooms, loading } = useRealtimeData("rooms", "number", true);
  const [adding, setAdding] = useState(false);
  const [modalData, setModalData] = useState<any>(null); // null = closed, {} = create, {id...} = edit
  
  const [roomNumber, setRoomNumber] = useState("");
  const [roomStatus, setRoomStatus] = useState<"vacant" | "occupied" | "maintenance">("vacant");
  const [roomPrice, setRoomPrice] = useState("5000");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const openCreateModal = () => {
    setRoomNumber("");
    setRoomStatus("vacant");
    setRoomPrice("5000");
    setRoomDescription("");
    setRoomImages([]);
    setModalData({});
  };

  const openEditModal = (room: any) => {
    setRoomNumber(room.number || "");
    setRoomStatus(room.status || "vacant");
    setRoomPrice((room.price || 0).toString());
    setRoomDescription(room.description || "");
    setRoomImages(room.images || []);
    setModalData(room);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImage(true);
    const newImages = [...roomImages];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const base64 = await compressImageToBase64(files[i]);
        newImages.push(base64);
      } catch (err) {
        console.error("Failed to compress image:", err);
        alert("Failed to process one of the images.");
      }
    }
    
    setRoomImages(newImages);
    setUploadingImage(false);
  };

  const removeImage = (index: number) => {
    setRoomImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveRoom = async () => {
    if (!roomNumber.trim()) return;
    setAdding(true);

    const payload = {
      number: roomNumber.trim(),
      status: roomStatus,
      price: Number(roomPrice) || 5000,
      description: roomDescription.trim() || "Newly added room",
      images: roomImages
    };

    if (modalData.id) {
      await supabase.from("rooms").update(payload).eq("id", modalData.id);
    } else {
      await supabase.from("rooms").insert(payload);
    }
    
    setAdding(false);
    setModalData(null);
  };

  const handleDeleteRoom = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this room? All associated tenants will be unassigned.")) {
      await supabase.from("rooms").delete().eq("id", id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Checking room updates..." : `Manage all ${rooms.length} rooms in The Green House.`}
        </p>
        <button 
          onClick={openCreateModal}
          disabled={adding}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition disabled:opacity-50"
        >
          <DoorOpen size={15} /> Add Room
        </button>
      </div>
      
      {loading ? (
        <HouseLoading size="sm" label="Loading rooms..." className="rounded-2xl border border-border bg-card" />
      ) : rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium text-foreground">No rooms exist yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Click Add Room to create your first one.</p>
        </div>
      ) : null}

      {modalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="shrink-0 p-6 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{modalData.id ? "Edit Room" : "Create Room"}</h3>
                <p className="text-sm text-muted-foreground">{modalData.id ? "Update room details and images." : "Add a new room with default details."}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalData(null)}
                className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:bg-muted"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-4 min-h-0">
              <div>
                <label className="text-xs font-bold uppercase tracking-[.15em] text-muted-foreground">Room Number</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="e.g. 101"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[.15em] text-muted-foreground">Status</label>
                  <select
                    value={roomStatus}
                    onChange={(e) => setRoomStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[.15em] text-muted-foreground">Monthly Price</label>
                  <input
                    type="number"
                    min="0"
                    value={roomPrice}
                    onChange={(e) => setRoomPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[.15em] text-muted-foreground">Description</label>
                <textarea
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Describe the room"
                />
              </div>
              
              <div className="pb-4">
                <label className="text-xs font-bold uppercase tracking-[.15em] text-muted-foreground mb-2 block">Room Images</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {roomImages.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                      <img src={img} alt={`Room img ${i}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={20} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition cursor-pointer">
                    <ImagePlus size={20} />
                    <span className="text-[10px] mt-1 font-semibold">Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={handleImageUpload} 
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {uploadingImage && <p className="text-[10px] text-primary animate-pulse">Processing images...</p>}
              </div>
            </div>

            <div className="shrink-0 p-6 pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalData(null)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoom}
                disabled={adding || !roomNumber.trim() || uploadingImage}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-[#173f39] disabled:opacity-50"
              >
                {adding ? "Saving..." : modalData.id ? "Save Changes" : "Create Room"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {!loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            {room.images && room.images.length > 0 && (
              <div className="w-full h-32 rounded-xl overflow-hidden mb-3 border border-border">
                <img src={room.images[0]} alt="Room preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold">Room {room.number}</span>
              <div className="flex items-center gap-1">
                <span className={`mr-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  room.status === "occupied"
                    ? "bg-emerald-100 text-emerald-700"
                    : room.status === "vacant"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-red-50 text-red-500"
                }`}>
                  {room.status}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(room); }}
                  className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition"
                  title="Edit Room"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={(e) => handleDeleteRoom(room.id, e)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg transition"
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
      )}
    </div>
  );
}

function TenantsSection() {
  const { data: tenants, loading } = useRealtimeData("tenants", "name", true);
  const { data: profiles } = useRealtimeData("profiles");
  const [adding, setAdding] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");

  // Only show profiles that are 'user' and not already assigned to a tenant
  const availableProfiles = profiles.filter(
    (p) => p.role === "user" && !tenants.find((t) => t.profile_id === p.id)
  );

  const handleAddTenant = async () => {
    if (!newTenantName.trim()) return;
    await supabase.from("tenants").insert({ 
      name: newTenantName, 
      rent_status: "Due",
      profile_id: selectedProfileId || null
    });
    setAdding(false);
    setNewTenantName("");
    setSelectedProfileId("");
  };

  const handleUpdateRent = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Paid" ? "Due" : currentStatus === "Due" ? "Overdue" : "Paid";
    await supabase.from("tenants").update({ rent_status: nextStatus }).eq("id", id);
  };

  const handleDeleteTenant = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this tenant?")) {
      await supabase.from("tenants").delete().eq("id", id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">All tenants and their rent status.</p>
        <button 
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold transition hover:bg-muted"
        >
          <UserPlus size={15} /> {adding ? "Cancel" : "Add Tenant"}
        </button>
      </div>

      {adding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Tenant Name" 
              value={newTenantName}
              onChange={(e) => setNewTenantName(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">No Account Link (Guest)</option>
              {availableProfiles.map((p) => (
                <option key={p.id} value={p.id}>Link to Account: {p.full_name}</option>
              ))}
            </select>
            <button 
              onClick={handleAddTenant}
              disabled={!newTenantName.trim()}
              className="rounded-xl bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <HouseLoading size="sm" label="Loading tenants..." className="rounded-2xl border border-border bg-card" />
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
                  <td className="px-5 py-3.5 font-medium">
                    {t.name}
                    {t.profile_id && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Linked</span>}
                  </td>
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

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("Staff");

  const handleAddStaff = async () => {
    if (!staffName.trim()) return;
    setAdding(true);
    await supabase.from("staff").insert({ name: staffName.trim(), role: staffRole.trim() || "Staff", status: "active", tasks: 0 });
    setAdding(false);
    setIsStaffModalOpen(false);
    setStaffName("");
    setStaffRole("Staff");
  };

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this staff member?")) {
      await supabase.from("staff").delete().eq("id", id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage house staff — maintenance workers and cleaning crew.</p>
        <button 
          onClick={() => setIsStaffModalOpen(true)}
          disabled={adding}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition"
        >
          <UserPlus size={15} /> Add Staff
        </button>
      </div>

      {isStaffModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="shrink-0 p-6 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Create Staff Member</h3>
                <p className="text-sm text-muted-foreground">Add a staff profile with a role and status.</p>
              </div>
              <button type="button" onClick={() => setIsStaffModalOpen(false)} className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:bg-muted"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-4 min-h-0">
              <div>
                <label className="text-xs font-bold uppercase tracking-[.15em] text-muted-foreground">Name</label>
                <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[.15em] text-muted-foreground">Role</label>
                <input type="text" value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div className="shrink-0 p-6 pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setIsStaffModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted">Cancel</button>
              <button type="button" onClick={handleAddStaff} disabled={adding || !staffName.trim()} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-[#173f39] disabled:opacity-50">{adding ? "Saving..." : "Save Staff"}</button>
            </div>
          </motion.div>
        </div>
      )}

      {loading ? (
        <HouseLoading size="sm" label="Loading staff..." className="rounded-2xl border border-border bg-card" />
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

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestIssue, setRequestIssue] = useState("");
  const [requestRoomId, setRequestRoomId] = useState("");
  const { data: rooms } = useRealtimeData("rooms");

  const handleAddRequest = async () => {
    if (!requestIssue.trim()) return;
    setAdding(true);
    await supabase.from("maintenance_requests").insert({ 
      subject: requestIssue.trim(),
      description: requestIssue.trim(),
      room_id: requestRoomId || null,
      date_reported: new Date().toLocaleDateString()
    });
    setAdding(false);
    setIsRequestModalOpen(false);
    setRequestIssue("");
    setRequestRoomId("");
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
          onClick={() => setIsRequestModalOpen(true)}
          disabled={adding}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition"
        >
          <Wrench size={15} /> Add Request
        </button>
      </div>
      
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="shrink-0 p-6 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">New Maintenance Request</h3>
                <p className="text-sm text-muted-foreground">Capture the issue and associate it with a room.</p>
              </div>
              <button type="button" onClick={() => setIsRequestModalOpen(false)} className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:bg-muted"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-4 min-h-0">
              <div>
                <label className="text-xs font-bold uppercase tracking-[.15em] text-muted-foreground">Issue</label>
                <textarea value={requestIssue} onChange={(e) => setRequestIssue(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[.15em] text-muted-foreground">Room</label>
                <select value={requestRoomId} onChange={(e) => setRequestRoomId(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Unassigned</option>
                  {rooms.map((room: any) => <option key={room.id} value={room.id}>Room {room.number}</option>)}
                </select>
              </div>
            </div>
            <div className="shrink-0 p-6 pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setIsRequestModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted">Cancel</button>
              <button type="button" onClick={handleAddRequest} disabled={adding || !requestIssue.trim()} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-[#173f39] disabled:opacity-50">{adding ? "Saving..." : "Save Request"}</button>
            </div>
          </motion.div>
        </div>
      )}

      {loading ? (
        <HouseLoading size="sm" label="Loading maintenance requests..." className="rounded-2xl border border-border bg-card" />
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
                  <p className="text-sm font-medium">{m.subject || m.description}</p>
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
