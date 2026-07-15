import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BedDouble,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  Send,
  User,
  Users,
  Wrench,
  Image as ImageIcon,
  Store,
  MessageSquare,
  MapPin,
  QrCode,
  X
} from "lucide-react";
import DashboardLayout, { type NavItem } from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import { useAuth } from "../context/AuthContext";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { supabase } from "../../lib/supabase";
import ExploreRooms, { LocationMapModal } from "./ExploreRooms";
import MockPaymentGateway from "../components/shared/MockPaymentGateway";
import { QRCodeSVG } from "qrcode.react";

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, id: "dashboard" },
  { label: "My Room", icon: <BedDouble size={18} />, id: "room" },
  { label: "Rent", icon: <CreditCard size={18} />, id: "rent" },
  { label: "Maintenance", icon: <Wrench size={18} />, id: "maintenance" },
  { label: "Community", icon: <Store size={18} />, id: "community" },
  { label: "Visitors", icon: <Users size={18} />, id: "visitors" },
  { label: "Profile", icon: <User size={18} />, id: "profile" },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState("dashboard");

  // Fetch all tenants to find the one linked to this user profile
  const { data: tenants, loading: tenantsLoading } = useRealtimeData("tenants");
  const { data: rooms } = useRealtimeData("rooms");

  const myTenant = tenants.find((t) => t.profile_id === user?.id);
  const myRoom = myTenant ? rooms.find((r) => r.id === myTenant.room_id) : null;

  return (
    <DashboardLayout
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      pageTitle={navItems.find((n) => n.id === activeNav)?.label ?? "Dashboard"}
    >
      {!myTenant && !tenantsLoading && activeNav === "dashboard" && (
        <div className="-mt-8">
          <ExploreRooms />
        </div>
      )}

      {!myTenant && !tenantsLoading && activeNav !== "dashboard" && activeNav !== "profile" && (
        <UnassignedPlaceholder />
      )}
      
      {activeNav === "profile" && <ProfilePlaceholder />}

      {myTenant && (
        <>
          {activeNav === "dashboard" && <OverviewSection userName={user?.fullName ?? "Resident"} tenant={myTenant} room={myRoom} />}
          {activeNav === "room" && <RoomSection tenant={myTenant} room={myRoom} />}
          {activeNav === "rent" && <RentSection tenant={myTenant} />}
          {activeNav === "maintenance" && <MaintenanceSection room={myRoom} />}
          {activeNav === "community" && <CommunitySection profileId={user?.id} houseId={myRoom?.house_id} />}
          {activeNav === "visitors" && <VisitorsSection profileId={user?.id} />}
        </>
      )}
    </DashboardLayout>
  );
}

function UnassignedPlaceholder() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[60vh] flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-border"
    >
      <div className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary mb-6">
        <BedDouble size={24} />
      </div>
      <h2 className="font-['Libre_Baskerville'] text-2xl tracking-tight mb-2">Room Required</h2>
      <p className="text-muted-foreground max-w-md">
        This feature is only available to residents who have been assigned to a boarding house and room. Please check the Dashboard to explore available rooms, or wait for an administrator to assign you.
      </p>
    </motion.div>
  );
}

function OverviewSection({ userName, tenant, room }: { userName: string, tenant: any, room: any }) {
  const { data: maintenance } = useRealtimeData("maintenance_requests");
  const { data: houses } = useRealtimeData("houses");
  const [paying, setPaying] = useState(false);
  const [activeLocationHouse, setActiveLocationHouse] = useState<any>(null);
  // Only count open requests for THIS room
  const openRequests = maintenance.filter((m: any) => m.room_id === room?.id && m.status !== "done").length;
  const assignedHouse = houses.find((house: any) => house.id === room?.house_id);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <p className="font-['DM_Mono'] text-[10px] uppercase tracking-[.12em] text-muted-foreground mb-2">Welcome home</p>
        <h2 className="font-['Libre_Baskerville'] text-2xl tracking-tight">
          Good day, <span className="text-primary">{userName.split(" ")[0]}</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Here's a quick look at your room and dues.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="My Room" value={room ? `Room ${room.number}` : "Unassigned"} icon={<BedDouble size={19} />} index={0} />
        <StatCard 
          title="Rent Status" 
          value={tenant.rent_status} 
          icon={<CreditCard size={19} />} 
          colorClass={tenant.rent_status === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"} 
          subtitle={tenant.due_date ? `Due ${tenant.due_date}` : "No due date set"} 
          index={1} 
        />
        <StatCard title="Open Requests" value={openRequests} icon={<Wrench size={19} />} colorClass="bg-[#dbeafe] text-[#2563eb]" index={2} />
      </div>

      {assignedHouse && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{assignedHouse.name}</p>
              <p className="text-xs text-muted-foreground">Tap to see the route from your current location.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveLocationHouse(assignedHouse)}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
            >
              <MapPin size={14} /> See Location
            </button>
          </div>
        </motion.div>
      )}

      <LocationMapModal
        isOpen={Boolean(activeLocationHouse)}
        onClose={() => setActiveLocationHouse(null)}
        house={activeLocationHouse}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rent quick view */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Current Bill</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold">Standard Rent</p>
                <p className="text-xs text-muted-foreground">
                  {tenant.due_date ? `Due ${tenant.due_date}` : "No due date set"}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                tenant.rent_status === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}>
                {tenant.rent_status}
              </span>
            </div>
            {tenant.rent_status !== "Paid" && (
              <button 
                onClick={() => setPaying(true)}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition"
              >
                Pay Now
              </button>
            )}
          </div>
        </motion.div>

        {paying && (
          <MockPaymentGateway 
            amount={room?.price || 5000} 
            description={`Rent Payment for Room ${room?.number || ''}`}
            onCancel={() => setPaying(false)}
            onSuccess={async () => {
              setPaying(false);
              await supabase.from("tenants").update({ rent_status: "Paid" }).eq("id", tenant.id);
            }}
          />
        )}

        {/* Announcements quick view */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card flex flex-col"
        >
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Latest Announcement</h3>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center items-center text-center">
            <Megaphone size={20} className="text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No new announcements</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function RoomSection({ tenant, room }: { tenant: any, room: any }) {
  if (!room) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center max-w-lg mx-auto">
        <p className="text-sm font-medium text-foreground">You are not assigned to a physical room.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary text-[#e6b65c]">
            <BedDouble size={24} />
          </div>
          <div>
            <p className="text-xl font-bold">Room {room.number}</p>
            <p className="text-sm text-muted-foreground">The Green House</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="font-['DM_Mono'] text-[9px] uppercase text-muted-foreground">Status</p>
            <p className="mt-1 text-sm font-semibold capitalize text-emerald-600">{room.status}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="font-['DM_Mono'] text-[9px] uppercase text-muted-foreground">Tenant Since</p>
            <p className="mt-1 text-sm font-semibold">{new Date(tenant.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RentSection({ tenant }: { tenant: any }) {
  const [paying, setPaying] = useState(false);
  const { data: rooms } = useRealtimeData("rooms");
  const myRoom = rooms.find((r) => r.id === tenant.room_id);

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold">Standard Rent</p>
            <p className="text-sm text-muted-foreground">
              {tenant.due_date ? `Due ${tenant.due_date}` : "No due date set by admin"}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            tenant.rent_status === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}>
            {tenant.rent_status}
          </span>
        </div>
        {tenant.rent_status !== "Paid" && (
          <button 
            onClick={() => setPaying(true)}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition"
          >
            Pay Now
          </button>
        )}
      </motion.div>

      {paying && (
        <MockPaymentGateway 
          amount={myRoom?.price || 5000} 
          description={`Rent Payment for Room ${myRoom?.number || ''}`}
          onCancel={() => setPaying(false)}
          onSuccess={async () => {
            setPaying(false);
            await supabase.from("tenants").update({ rent_status: "Paid" }).eq("id", tenant.id);
          }}
        />
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold">Payment History</h3>
        </div>
        <div className="p-8 text-center text-sm text-muted-foreground">
          No past payments recorded yet.
        </div>
      </div>
    </div>
  );
}

function MaintenanceSection({ room }: { room: any }) {
  const { data: requests, loading } = useRealtimeData("maintenance_requests", "created_at", false);
  const [newRequest, setNewRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Only show requests for THIS user's room
  const myRequests = requests.filter((r: any) => r.room_id === room?.id);

  const handleSubmit = async () => {
    if (!newRequest.trim() || !room) return;
    setSubmitting(true);
    const { error } = await supabase.from("maintenance_requests").insert({
      room_id: room.id,
      issue: newRequest,
      status: "pending",
      date_reported: new Date().toLocaleDateString()
    });
    if (error) {
      alert("Failed to submit request: " + error.message);
    } else {
      setNewRequest("");
    }
    setSubmitting(false);
  };

  if (!room) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center max-w-2xl">
        <p className="text-sm font-medium text-foreground">You are not assigned to a room.</p>
        <p className="text-xs text-muted-foreground mt-1">You must be assigned to a room to submit maintenance requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Submit request */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <h3 className="text-sm font-bold mb-3">Submit a Request for Room {room.number}</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Describe the issue (e.g. Broken AC)..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
          />
          <div className="flex gap-2">
            <button
              onClick={() => alert("Photo upload feature coming soon! (Simulation)")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted transition"
              title="Attach a photo"
            >
              <ImageIcon size={14} />
            </button>
            <button 
              onClick={handleSubmit}
              disabled={submitting || !newRequest.trim()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition disabled:opacity-50"
            >
              <Send size={14} /> Submit
            </button>
          </div>
        </div>
      </motion.div>

      {/* My requests */}
      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold">My Requests</h3>
        </div>
        
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading requests...</div>
        ) : myRequests.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">You have no maintenance requests.</div>
        ) : (
          myRequests.map((req: any) => (
            <div key={req.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className={`grid size-8 place-items-center rounded-lg ${
                  req.status === "done" ? "bg-emerald-100 text-emerald-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {req.status === "done" ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                </div>
                <div>
                  <p className="text-sm font-medium">{req.issue}</p>
                  <p className="text-xs text-muted-foreground">{req.date_reported}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                req.status === "done" ? "bg-emerald-100 text-emerald-700" : 
                req.status === "in-progress" ? "bg-blue-100 text-blue-700" : "bg-amber-50 text-amber-600"
              }`}>{req.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CommunitySection({ profileId, houseId }: { profileId?: string, houseId?: string }) {
  const { data: notices } = useRealtimeData("notices");
  const { data: marketplace } = useRealtimeData("marketplace_items");

  const [newItem, setNewItem] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const [isPosting, setIsPosting] = useState(false);

  const handlePostItem = async () => {
    if (!newItem.trim() || !newPrice || !profileId) return;
    setIsPosting(true);
    const { error } = await supabase.from("marketplace_items").insert({
      profile_id: profileId,
      item_name: newItem,
      price: parseFloat(newPrice),
      status: "available"
    });
    
    if (error) {
      alert("Failed to post item: " + error.message);
    } else {
      setNewItem("");
      setNewPrice("");
    }
    setIsPosting(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
      {/* Notice Board */}
      <div className="space-y-4">
        <h3 className="font-['Libre_Baskerville'] text-xl tracking-tight">House Notices</h3>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {notices.length === 0 ? (
            <div className="p-12 text-center">
              <Megaphone size={24} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No Announcements</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notices.map((notice) => (
                <div key={notice.id} className="p-5">
                  <h4 className="font-bold">{notice.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Marketplace */}
      <div className="space-y-4">
        <h3 className="font-['Libre_Baskerville'] text-xl tracking-tight">Marketplace</h3>
        <div className="rounded-2xl border border-border bg-card p-5 mb-4">
          <p className="text-sm font-bold mb-3">Sell an Item</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="What are you selling?"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Price (₱)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full sm:w-24 rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={handlePostItem}
                disabled={isPosting}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-[#173f39] disabled:opacity-50"
              >
                {isPosting ? "..." : "Post"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {marketplace.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-bold">{item.item_name}</p>
                <p className="text-xs text-muted-foreground">Seller: Resident • Posted today</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">₱{item.price.toLocaleString()}</p>
                <button className="text-xs font-bold text-emerald-600 mt-1 hover:underline">Message Seller</button>
              </div>
            </div>
          ))}
          {marketplace.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No items for sale right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VisitorsSection({ profileId }: { profileId?: string }) {
  const { data: visitors } = useRealtimeData("visitors");
  const [visitorName, setVisitorName] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [selectedPass, setSelectedPass] = useState<any | null>(null);

  const [isRegistering, setIsRegistering] = useState(false);

  const myVisitors = visitors.filter(v => v.profile_id === profileId);

  const handleRegister = async () => {
    if (!visitorName.trim() || !visitDate || !profileId) return;
    setIsRegistering(true);
    const { error } = await supabase.from("visitors").insert({
      profile_id: profileId,
      visitor_name: visitorName,
      date_of_visit: new Date(visitDate).toISOString(),
      status: "pending"
    });
    
    if (error) {
      alert("Failed to register visitor: " + error.message);
    } else {
      setVisitorName("");
      setVisitDate("");
    }
    setIsRegistering(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Users size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Register a Visitor</h2>
            <p className="text-sm text-muted-foreground">Pre-register your guests for easier gate access.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">Visitor Name</label>
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">Date & Time of Visit</label>
            <input
              type="datetime-local"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        <button 
          onClick={handleRegister}
          disabled={!visitorName.trim() || !visitDate || isRegistering}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:bg-[#173f39] disabled:opacity-50"
        >
          {isRegistering ? "Generating..." : "Generate Gate Pass"}
        </button>
      </motion.div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold">Upcoming Visitors</h3>
        </div>
        <div className="divide-y divide-border">
          {myVisitors.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-bold">{v.visitor_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(v.date_of_visit).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  v.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-600'
                }`}>
                  {v.status}
                </span>
                <button
                  onClick={() => setSelectedPass(v)}
                  className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20 transition"
                  title="View Gate Pass"
                >
                  <QrCode size={16} />
                </button>
              </div>
            </div>
          ))}
          {myVisitors.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              You haven't registered any visitors yet.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-background p-6 shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setSelectedPass(null)}
                className="absolute right-4 top-4 rounded-full bg-muted p-2 hover:bg-muted/80 transition"
              >
                <X size={16} />
              </button>

              <div className="text-center mb-6 mt-4">
                <h3 className="font-['Libre_Baskerville'] text-2xl font-bold mb-1">Gate Pass</h3>
                <p className="text-sm text-muted-foreground">Show this at the entrance</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center mb-6">
                <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
                  <QRCodeSVG value={selectedPass.id} size={200} level="H" includeMargin={false} />
                </div>
                <p className="font-mono text-xs text-muted-foreground tracking-widest break-all text-center">
                  {selectedPass.id}
                </p>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4 text-center">
                <p className="font-bold text-lg">{selectedPass.visitor_name}</p>
                <p className="text-sm text-muted-foreground">{new Date(selectedPass.date_of_visit).toLocaleString()}</p>
                <div className="mt-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    selectedPass.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedPass.status}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfilePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-muted mb-4"><User size={24} className="text-muted-foreground" /></div>
      <h3 className="text-lg font-bold">My Profile</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">Profile editing will be available in a future update.</p>
    </div>
  );
}
