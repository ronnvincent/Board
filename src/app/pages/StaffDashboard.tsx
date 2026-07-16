import { useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  LayoutDashboard,
  Loader2,
  Megaphone,
  User,
  Wrench,
} from "lucide-react";
import DashboardLayout, { type NavItem } from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, id: "dashboard" },
  { label: "My Tasks", icon: <ClipboardList size={18} />, id: "tasks" },
  { label: "Announcements", icon: <Megaphone size={18} />, id: "announcements" },
  { label: "Profile", icon: <User size={18} />, id: "profile" },
];

// Mock data
const mockTasks = [
  { id: "t1", title: "Fix leaking faucet in Room 08", room: "08", status: "in-progress", priority: "high", date: "Jul 12" },
  { id: "t2", title: "Replace AC filter in Room 03", room: "03", status: "pending", priority: "medium", date: "Jul 13" },
  { id: "t3", title: "Repaint hallway walls — 2nd floor", room: "—", status: "pending", priority: "low", date: "Jul 14" },
  { id: "t4", title: "Door lock replacement in Room 15", room: "15", status: "pending", priority: "high", date: "Jul 14" },
  { id: "t5", title: "Unclog drain in shared bathroom", room: "Shared", status: "done", priority: "medium", date: "Jul 10" },
  { id: "t6", title: "Light fixture repair in Room 01", room: "01", status: "done", priority: "low", date: "Jul 09" },
];

const mockAnnouncements = [
  { id: "a1", title: "Water interruption on July 16", body: "There will be a scheduled water service interruption from 8:00 AM to 12:00 PM. Please store water in advance.", date: "Jul 14" },
  { id: "a2", title: "Monthly house meeting", body: "Please join us this Saturday at 3:00 PM in the common area for our monthly house meeting.", date: "Jul 12" },
  { id: "a3", title: "New cleaning schedule", body: "The updated cleaning schedule has been posted. Please check the bulletin board for your assigned areas.", date: "Jul 10" },
];

export default function StaffDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <DashboardLayout
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      pageTitle={navItems.find((n) => n.id === activeNav)?.label ?? "Dashboard"}
    >
      {activeNav === "dashboard" && <OverviewSection />}
      {activeNav === "tasks" && <TasksSection />}
      {activeNav === "announcements" && <AnnouncementsSection />}
      {activeNav === "profile" && <ProfilePlaceholder />}
    </DashboardLayout>
  );
}

function OverviewSection() {
  const pending = mockTasks.filter((t) => t.status === "pending").length;
  const inProgress = mockTasks.filter((t) => t.status === "in-progress").length;
  const done = mockTasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Pending" value={pending} icon={<Circle size={19} />} colorClass="bg-amber-50 text-amber-600" index={0} />
        <StatCard title="In Progress" value={inProgress} icon={<Loader2 size={19} />} colorClass="bg-blue-50 text-blue-600" index={1} />
        <StatCard title="Completed" value={done} icon={<CheckCircle2 size={19} />} colorClass="bg-emerald-50 text-emerald-600" trend="up" trendText="this week" index={2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Active tasks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card"
        >
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Active Tasks</h3>
          </div>
          <div className="divide-y divide-border">
            {mockTasks
              .filter((t) => t.status !== "done")
              .map((task) => (
                <div key={task.id} className="flex flex-col gap-3 px-4 py-4 transition hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`grid size-8 place-items-center rounded-lg ${
                      task.status === "in-progress" ? "bg-blue-100 text-blue-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {task.status === "in-progress" ? <Wrench size={14} /> : <Clock size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Room {task.room} · {task.date}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    task.priority === "high" ? "bg-red-100 text-red-600"
                      : task.priority === "medium" ? "bg-amber-50 text-amber-600"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Latest announcement */}
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

function TasksSection() {
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "done">("all");
  const filtered = filter === "all" ? mockTasks : mockTasks.filter((t) => t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "pending", "in-progress", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition capitalize ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {filtered.map((task) => (
          <div key={task.id} className="flex flex-col gap-3 px-4 py-4 transition hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-4">
              <div className={`grid size-9 place-items-center rounded-xl ${
                task.status === "done" ? "bg-emerald-100 text-emerald-600"
                  : task.status === "in-progress" ? "bg-blue-100 text-blue-600"
                    : "bg-amber-50 text-amber-600"
              }`}>
                {task.status === "done" ? <CheckCircle2 size={16} /> : task.status === "in-progress" ? <Wrench size={16} /> : <Circle size={16} />}
              </div>
              <div>
                <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                <p className="text-xs text-muted-foreground">Room {task.room} · {task.date}</p>
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
              task.status === "done" ? "bg-emerald-100 text-emerald-700"
                : task.status === "in-progress" ? "bg-blue-100 text-blue-700"
                  : "bg-amber-50 text-amber-600"
            }`}>
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsSection() {
  return (
    <div className="space-y-4">
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
