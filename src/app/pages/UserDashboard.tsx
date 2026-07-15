import { useState } from "react";
import { motion } from "motion/react";
import {
  BedDouble,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  Send,
  User,
  Wrench,
} from "lucide-react";
import DashboardLayout, { type NavItem } from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import { useAuth } from "../context/AuthContext";

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, id: "dashboard" },
  { label: "My Room", icon: <BedDouble size={18} />, id: "room" },
  { label: "Rent", icon: <CreditCard size={18} />, id: "rent" },
  { label: "Maintenance", icon: <Wrench size={18} />, id: "maintenance" },
  { label: "Announcements", icon: <Megaphone size={18} />, id: "announcements" },
  { label: "Profile", icon: <User size={18} />, id: "profile" },
];

import { useRealtimeData } from "../hooks/useRealtimeData";
import { supabase } from "../../lib/supabase";

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <DashboardLayout
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      pageTitle={navItems.find((n) => n.id === activeNav)?.label ?? "Dashboard"}
    >
      {activeNav === "dashboard" && <OverviewSection userName={user?.fullName ?? "Resident"} />}
      {activeNav === "room" && <RoomSection />}
      {activeNav === "rent" && <RentSection />}
      {activeNav === "maintenance" && <MaintenanceSection />}
      {activeNav === "announcements" && <AnnouncementsSection />}
      {activeNav === "profile" && <ProfilePlaceholder />}
    </DashboardLayout>
  );
}

function OverviewSection({ userName }: { userName: string }) {
  const { data: maintenance } = useRealtimeData("maintenance_requests", "created_at", false);
  const openRequests = maintenance.filter(m => m.status !== "done").length;

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="My Room" value="Room 04" icon={<BedDouble size={19} />} index={0} />
        <StatCard title="Rent Due" value="₱5,500" icon={<CreditCard size={19} />} colorClass="bg-amber-50 text-amber-600" subtitle="Jul 1" index={1} />
        <StatCard title="Open Requests" value={openRequests} icon={<Wrench size={19} />} colorClass="bg-[#dbeafe] text-[#2563eb]" index={2} />
        <StatCard title="Move-in" value="Mar 15" icon={<Calendar size={19} />} colorClass="bg-[#eee4d6] text-muted-foreground" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rent quick view */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card"
        >
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Rent Status</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold">₱5,500</p>
                <p className="text-xs text-muted-foreground">Due July 1, 2025</p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">Unpaid</span>
            </div>
            <button className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition">
              Pay Now
            </button>
          </div>
        </motion.div>

        {/* Announcements quick view */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card"
        >
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Latest Announcement</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone size={14} className="text-primary" />
              <p className="text-sm font-bold">{mockAnnouncements[0].title}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-6">{mockAnnouncements[0].body}</p>
            <p className="mt-3 font-['DM_Mono'] text-[10px] text-muted-foreground">{mockAnnouncements[0].date}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function RoomSection() {
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
            <p className="text-xl font-bold">Room 04</p>
            <p className="text-sm text-muted-foreground">The Green House · 2nd Floor</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="font-['DM_Mono'] text-[9px] uppercase text-muted-foreground">Status</p>
            <p className="mt-1 text-sm font-semibold text-emerald-600">Occupied</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="font-['DM_Mono'] text-[9px] uppercase text-muted-foreground">Move-in Date</p>
            <p className="mt-1 text-sm font-semibold">Mar 15, 2025</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="font-['DM_Mono'] text-[9px] uppercase text-muted-foreground">Monthly Rent</p>
            <p className="mt-1 text-sm font-semibold">₱5,500</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="font-['DM_Mono'] text-[9px] uppercase text-muted-foreground">Floor</p>
            <p className="mt-1 text-sm font-semibold">2nd Floor</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RentSection() {
  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold">₱5,500</p>
            <p className="text-sm text-muted-foreground">Due July 1, 2025</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">Unpaid</span>
        </div>
        <button className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition">
          Pay Now
        </button>
      </motion.div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold">Payment History</h3>
        </div>
        <div className="divide-y divide-border">
          {mockRentHistory.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium">{r.month}</p>
                <p className="text-xs text-muted-foreground">Due {r.dueDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold">{r.amount}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  r.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-50 text-amber-600"
                }`}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MaintenanceSection() {
  const { data: requests, loading } = useRealtimeData("maintenance_requests", "created_at", false);
  const [newRequest, setNewRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newRequest.trim()) return;
    setSubmitting(true);
    await supabase.from("maintenance_requests").insert({
      issue: newRequest,
      status: "pending",
      date_reported: new Date().toLocaleDateString()
    });
    setNewRequest("");
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Submit request */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <h3 className="text-sm font-bold mb-3">Submit a Request</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Describe the issue..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
          />
          <button 
            onClick={handleSubmit}
            disabled={submitting || !newRequest.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition shrink-0 disabled:opacity-50"
          >
            <Send size={14} /> Submit
          </button>
        </div>
      </motion.div>

      {/* My requests */}
      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold">My Requests</h3>
        </div>
        
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">You have no maintenance requests.</div>
        ) : (
          requests.map((req) => (
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

function AnnouncementsSection() {
  return (
    <div className="space-y-4 max-w-2xl">
      {mockAnnouncements.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Megaphone size={14} className="text-primary" />
            <p className="text-sm font-bold">{a.title}</p>
          </div>
          <p className="text-sm text-muted-foreground leading-6">{a.body}</p>
          <p className="mt-3 font-['DM_Mono'] text-[10px] text-muted-foreground">{a.date}</p>
        </motion.div>
      ))}
    </div>
  );
}

function ProfilePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-muted mb-4"><User size={24} className="text-muted-foreground" /></div>
      <h3 className="text-lg font-bold">My Profile</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">Profile editing will be available once Supabase is integrated.</p>
    </div>
  );
}
