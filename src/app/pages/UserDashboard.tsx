import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  BedDouble,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Home,
  LayoutDashboard,
  Megaphone,
  ReceiptText,
  Send,
  User,
  Users,
  Wrench,
  Image as ImageIcon,
  Store,
  MessageSquare,
  MapPin,
  QrCode,
  X,
  Smile,
  Paperclip,
  ChevronLeft,
  CheckCheck,
  Trash2,
  EyeOff
} from "lucide-react";
import DashboardLayout, { type NavItem } from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import { useAuth } from "../context/AuthContext";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { supabase } from "../../lib/supabase";
import ExploreRooms, { LocationMapModal } from "./ExploreRooms";
import MockPaymentGateway from "../components/shared/MockPaymentGateway";
import { QRCodeSVG } from "qrcode.react";
import EmojiPicker from 'emoji-picker-react';
import { compressImageToBase64 } from "../../lib/imageUtils";
import {
  buildReceiptNumber,
  formatCurrency,
  getDueDateState,
  isMaintenanceOpen,
  isUrgentNotice,
  maintenanceStatusClass,
  maintenanceStatusLabel,
  normalizeMaintenanceStatus,
  registerPushSubscription,
} from "../lib/tenantPortal";

const navItems: NavItem[] = [
  { label: "My Home", icon: <LayoutDashboard size={18} />, id: "dashboard" },
  { label: "My Room", icon: <BedDouble size={18} />, id: "room" },
  { label: "Rent", icon: <CreditCard size={18} />, id: "rent" },
  { label: "Maintenance", icon: <Wrench size={18} />, id: "maintenance" },
  { label: "Community", icon: <Store size={18} />, id: "community" },
  { label: "Messages", icon: <MessageSquare size={18} />, id: "messages" },
  { label: "Visitors", icon: <Users size={18} />, id: "visitors" },
  { label: "Profile", icon: <User size={18} />, id: "profile" },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [activeMaintenanceContext, setActiveMaintenanceContext] = useState<string | null>(null);

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
      
      {activeNav === "profile" && <ProfileSection user={user} tenant={myTenant} room={myRoom} />}

      {myTenant && (
        <>
          {activeNav === "dashboard" && <OverviewSection userName={user?.fullName ?? "Resident"} tenant={myTenant} room={myRoom} onNavigate={setActiveNav} />}
          {activeNav === "room" && <RoomSection tenant={myTenant} room={myRoom} />}
          {activeNav === "rent" && <RentSectionV2 tenant={myTenant} />}
          {activeNav === "maintenance" && (
              <MaintenanceSectionV2
              room={myRoom}
              tenant={myTenant}
              onFollowUp={(profileId, requestId) => {
                setActiveChatUserId(profileId);
                setActiveMaintenanceContext(requestId);
                setActiveNav("messages");
              }}
            />
          )}
          {activeNav === "community" && (
            <CommunitySection 
              profileId={user?.id} 
              houseId={myRoom?.house_id} 
              onMessageSeller={(sellerId) => {
                setActiveChatUserId(sellerId);
                setActiveNav("messages");
              }} 
            />
          )}
          {activeNav === "messages" && (
            <MessagesSection 
              currentUserId={user?.id} 
              activeChatUserId={activeChatUserId} 
              setActiveChatUserId={setActiveChatUserId} 
              maintenanceContextId={activeMaintenanceContext}
              clearMaintenanceContext={() => setActiveMaintenanceContext(null)}
            />
          )}
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

function OverviewSection({ userName, tenant, room, onNavigate }: { userName: string, tenant: any, room: any, onNavigate: (tab: string) => void }) {
  const { data: maintenance } = useRealtimeData("maintenance_requests");
  const { data: houses } = useRealtimeData("houses");
  const { data: notices } = useRealtimeData("notices", "created_at", true);
  const { data: profiles } = useRealtimeData("profiles");
  const { data: payments } = useRealtimeData("payments", "created_at", true);
  const { data: rentBills } = useRealtimeData("rent_bills", "due_date", true);
  const { data: visitors } = useRealtimeData("visitors", "created_at", false);
  const { data: notifications } = useRealtimeData("notifications", "created_at", true);
  const [paying, setPaying] = useState(false);
  const [activeLocationHouse, setActiveLocationHouse] = useState<any>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [leavingSubmit, setLeavingSubmit] = useState(false);

  const assignedHouse = houses.find((house: any) => house.id === room?.house_id);
  const myRequests = maintenance.filter((m: any) => m.tenant_id === tenant.id || (!m.tenant_id && m.room_id === room?.id));
  const openRequests = myRequests.filter((m: any) => isMaintenanceOpen(m.status)).length;
  const urgentNotice = notices.find((notice: any) => isUrgentNotice(notice));
  const myNotifications = notifications.filter((n: any) => !n.profile_id || n.profile_id === tenant.profile_id);
  const unreadNotifications = myNotifications.filter((n: any) => !n.is_read);
  const urgentNotification = myNotifications.find((n: any) => n.priority === "urgent" && !n.is_read);
  const unpaidBills = rentBills.filter((bill: any) => bill.tenant_id === tenant.id && bill.status !== "paid" && bill.status !== "void");
  const nextBill = unpaidBills[0];
  const latestPayment = payments.find((payment: any) => payment.tenant_id === tenant.id);
  const rentAmount = nextBill?.amount || room?.price || 5000;
  const dueDate = nextBill?.due_date || tenant.due_date;
  const dueState = getDueDateState(dueDate);
  const pendingVisitors = visitors.filter((visitor: any) => visitor.profile_id === tenant.profile_id && visitor.status === "pending").length;

  const handleLeaveRoom = async () => {
    if (!leaveReason.trim()) return;
    setLeavingSubmit(true);
    
    try {
      const admins = profiles.filter((p: any) => p.role === "admin" || p.role === "administrator");
      const messagePromises = admins.map((admin: any) => 
        supabase.from("messages").insert({
          sender_id: tenant.profile_id,
          receiver_id: admin.id,
          content: `Notice of Move Out. Room: ${room?.number || "Unknown"}. Reason: ${leaveReason}`
        })
      );
      await Promise.all(messagePromises);
      await supabase.from("tenants").delete().eq("id", tenant.id);
    } catch (err) {
      console.error(err);
      alert("Failed to process leave request");
      setLeavingSubmit(false);
    }
  };

  const handleQuickPay = async () => {
    setPaying(false);
    const paidAt = new Date().toISOString();
    const receiptNumber = buildReceiptNumber();
    await supabase.from("tenants").update({ rent_status: "Paid" }).eq("id", tenant.id);
    if (nextBill?.id) {
      await supabase.from("rent_bills").update({ status: "paid", paid_at: paidAt }).eq("id", nextBill.id);
    }
    await supabase.from("payments").insert({
      tenant_id: tenant.id,
      rent_bill_id: nextBill?.id || null,
      amount: rentAmount,
      description: `Rent Payment for Room ${room?.number || ""}`,
      receipt_number: receiptNumber,
      payment_method: "card",
      status: "Paid",
      paid_at: paidAt
    });
    if (tenant.profile_id) {
      await supabase.from("notifications").insert({
        profile_id: tenant.profile_id,
        title: "Payment receipt ready",
        body: `Receipt ${receiptNumber} was generated for ${formatCurrency(rentAmount)}.`,
        category: "rent",
        priority: "normal"
      });
    }
  };

  const dashboardCards = [
    {
      id: "room",
      title: "Room",
      value: room ? `Room ${room.number}` : "Unassigned",
      detail: assignedHouse?.name || "Boarding house",
      icon: <BedDouble size={18} />,
      accent: "bg-primary/10 text-primary",
    },
    {
      id: "rent",
      title: "Rent",
      value: formatCurrency(rentAmount),
      detail: dueState.label,
      icon: <CreditCard size={18} />,
      accent: tenant.rent_status === "Paid" && unpaidBills.length === 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-50 text-amber-700",
    },
    {
      id: "maintenance",
      title: "Maintenance",
      value: `${openRequests} open`,
      detail: `${myRequests.length} total request${myRequests.length === 1 ? "" : "s"}`,
      icon: <Wrench size={18} />,
      accent: openRequests > 0 ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700",
    },
    {
      id: "visitors",
      title: "Visitors",
      value: `${pendingVisitors} pending`,
      detail: "Gate passes",
      icon: <Users size={18} />,
      accent: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-['DM_Mono'] text-[10px] uppercase tracking-[.12em] text-muted-foreground">My home</p>
            <h2 className="mt-2 font-['Libre_Baskerville'] text-2xl tracking-tight sm:text-3xl">
              Good day, <span className="text-primary">{userName.split(" ")[0]}</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Rent, room, visitors, maintenance, and alerts are gathered here for quick mobile access.
            </p>
          </div>
          <button 
            onClick={() => setIsLeaving(true)} 
            className="w-full rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 sm:w-auto"
          >
            Request to Leave Room
          </button>
        </div>
      </motion.div>

      {(urgentNotification || urgentNotice) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900"
        >
          <div className="flex gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">{urgentNotification?.title || urgentNotice?.title || "Emergency notice"}</p>
              <p className="mt-1 text-sm text-red-800">{urgentNotification?.body || urgentNotice?.content}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card, index) => (
          <motion.button
            key={card.id}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            onClick={() => onNavigate(card.id)}
            className="rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/30 hover:bg-muted/30"
          >
            <div className="flex items-center justify-between gap-3">
              <div className={`grid size-10 place-items-center rounded-xl ${card.accent}`}>
                {card.icon}
              </div>
              <ChevronLeft size={16} className="rotate-180 text-muted-foreground" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[.1em] text-muted-foreground">{card.title}</p>
            <p className="mt-1 text-xl font-bold">{card.value}</p>
            <p className={`mt-1 text-xs ${card.id === "rent" ? dueState.tone : "text-muted-foreground"}`}>{card.detail}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold">Current rent</p>
                <p className="mt-1 text-3xl font-bold text-primary">{formatCurrency(rentAmount)}</p>
                <p className={`mt-1 text-sm ${dueState.tone}`}>{dueState.label}</p>
              </div>
              {tenant.rent_status !== "Paid" || unpaidBills.length > 0 ? (
                <button 
                  onClick={() => setPaying(true)}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-[#173f39]"
                >
                  Pay Now
                </button>
              ) : (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Current</span>
              )}
            </div>
            {latestPayment && (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-sm">
                <p className="font-semibold text-emerald-800">Latest receipt</p>
                <p className="mt-1 text-emerald-700">{latestPayment.receipt_number || latestPayment.id} - {formatCurrency(latestPayment.amount)}</p>
              </div>
            )}
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { id: "rent", label: "View receipts", icon: <ReceiptText size={16} /> },
              { id: "maintenance", label: "Request repair", icon: <Wrench size={16} /> },
              { id: "visitors", label: "Register visitor", icon: <Users size={16} /> },
              { id: "profile", label: "Update profile", icon: <User size={16} /> },
            ].map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.id)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm font-bold transition hover:bg-muted/30"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {assignedHouse && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{assignedHouse.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">View the route from your current location.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLocationHouse(assignedHouse)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                >
                  <MapPin size={14} /> Map
                </button>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-sm font-bold">Alerts</h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{unreadNotifications.length} unread</span>
            </div>
            <div className="divide-y divide-border">
              {myNotifications.slice(0, 4).map((notification: any) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={async () => {
                    await supabase.from("notifications").update({ is_read: true }).eq("id", notification.id);
                  }}
                  className="flex w-full gap-3 px-5 py-4 text-left transition hover:bg-muted/30"
                >
                  <div className={`grid size-9 shrink-0 place-items-center rounded-xl ${notification.priority === "urgent" ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"}`}>
                    <Bell size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{notification.body}</p>
                  </div>
                </button>
              ))}
              {myNotifications.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No alerts yet.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <LocationMapModal
        isOpen={Boolean(activeLocationHouse)}
        onClose={() => setActiveLocationHouse(null)}
        house={activeLocationHouse}
      />

      {paying && (
        <MockPaymentGateway 
          amount={rentAmount} 
          description={`Rent Payment for Room ${room?.number || ""}`}
          onCancel={() => setPaying(false)}
          onSuccess={handleQuickPay}
        />
      )}

      <AnimatePresence>
        {isLeaving && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
            >
              <h3 className="font-['Libre_Baskerville'] text-xl font-bold mb-2">Leave Room</h3>
              <p className="mb-4 text-sm text-muted-foreground">Please provide a reason. Your request will be sent to the administration and your room assignment will be released.</p>
              <textarea
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Reason for leaving..."
                className="mb-4 h-32 w-full resize-none rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-red-500"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsLeaving(false)}
                  disabled={leavingSubmit}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-muted-foreground transition hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeaveRoom}
                  disabled={leavingSubmit || !leaveReason.trim()}
                  className="rounded-xl bg-red-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  {leavingSubmit ? "Processing..." : "Confirm & Leave"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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

function RentSectionV2({ tenant }: { tenant: any }) {
  const [paying, setPaying] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const { data: rooms } = useRealtimeData("rooms");
  const { data: payments } = useRealtimeData("payments", "created_at", true);
  const { data: rentBills } = useRealtimeData("rent_bills", "due_date", true);
  
  const myRoom = rooms.find((r: any) => r.id === tenant.room_id);
  const myBills = rentBills
    .filter((bill: any) => bill.tenant_id === tenant.id)
    .sort((a: any, b: any) => new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime());
  const unpaidBills = myBills.filter((bill: any) => bill.status !== "paid" && bill.status !== "void");
  const activeBill = unpaidBills.find((bill: any) => bill.id === selectedBillId) || unpaidBills[0];
  const rentAmount = activeBill?.amount || myRoom?.price || 5000;
  const dueState = getDueDateState(activeBill?.due_date || tenant.due_date);
  const myPayments = payments
    .filter((p: any) => p.tenant_id === tenant.id)
    .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const handlePaymentSuccess = async () => {
    const paidAt = new Date().toISOString();
    const receiptNumber = buildReceiptNumber();
    setPaying(false);
    
    await supabase.from("tenants").update({ rent_status: "Paid" }).eq("id", tenant.id);
    
    if (activeBill?.id) {
      await supabase.from("rent_bills").update({ status: "paid", paid_at: paidAt }).eq("id", activeBill.id);
    }

    await supabase.from("payments").insert({
      tenant_id: tenant.id,
      rent_bill_id: activeBill?.id || null,
      amount: rentAmount,
      description: activeBill?.billing_period ? `Rent for ${activeBill.billing_period}` : `Rent Payment for Room ${myRoom?.number || ""}`,
      receipt_number: receiptNumber,
      payment_method: "card",
      status: "Paid",
      paid_at: paidAt
    });

    if (tenant.profile_id) {
      await supabase.from("notifications").insert({
        profile_id: tenant.profile_id,
        title: "Rent payment confirmed",
        body: `Receipt ${receiptNumber} is now available in your rent history.`,
        category: "rent",
        priority: "normal"
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-['DM_Mono'] text-[10px] uppercase tracking-[.12em] text-muted-foreground">Current bill</p>
            <p className="mt-2 text-3xl font-bold text-primary">{formatCurrency(rentAmount)}</p>
            <p className={`mt-1 text-sm ${dueState.tone}`}>{dueState.label}</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
              tenant.rent_status === "Paid" && unpaidBills.length === 0 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}>
              {unpaidBills.length > 0 ? `${unpaidBills.length} unpaid bill${unpaidBills.length === 1 ? "" : "s"}` : tenant.rent_status}
            </span>
            {(tenant.rent_status !== "Paid" || unpaidBills.length > 0) && (
              <button 
                onClick={() => setPaying(true)}
                className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-[#173f39] sm:w-auto"
              >
                Pay Now
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {paying && (
        <MockPaymentGateway 
          amount={rentAmount} 
          description={activeBill?.billing_period ? `Rent for ${activeBill.billing_period}` : `Rent Payment for Room ${myRoom?.number || ""}`}
          onCancel={() => setPaying(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Upcoming Bills</h3>
          </div>
          <div className="divide-y divide-border">
            {myBills.map((bill: any) => {
              const state = getDueDateState(bill.due_date);
              return (
                <button
                  key={bill.id}
                  type="button"
                  onClick={() => setSelectedBillId(bill.id)}
                  className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted/30 ${selectedBillId === bill.id ? "bg-primary/5" : ""}`}
                >
                  <div>
                    <p className="text-sm font-bold">{bill.billing_period || "Monthly rent"}</p>
                    <p className={`mt-1 text-xs ${state.tone}`}>{state.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(bill.amount)}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${bill.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-50 text-amber-600"}`}>
                      {bill.status}
                    </span>
                  </div>
                </button>
              );
            })}
            {myBills.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No rent bills have been posted yet. Your current tenant due date is still shown above.
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold">Receipts & Payment History</h3>
          </div>
          <div className="divide-y divide-border">
            {myPayments.map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                    <ReceiptText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{payment.description}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {payment.receipt_number || payment.id} - {new Date(payment.paid_at || payment.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="mb-1 text-sm font-bold text-emerald-600">{formatCurrency(payment.amount)}</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
            {myPayments.length === 0 && (
              <div className="p-12 text-center">
                <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-muted">
                  <CreditCard size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No past payments</p>
                <p className="mt-1 text-xs text-muted-foreground">Receipts and confirmation history will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RentSection({ tenant }: { tenant: any }) {
  const [paying, setPaying] = useState(false);
  const { data: rooms } = useRealtimeData("rooms");
  const { data: payments } = useRealtimeData("payments", "created_at", true);
  
  const myRoom = rooms.find((r) => r.id === tenant.room_id);
  const myPayments = payments
    .filter((p: any) => p.tenant_id === tenant.id)
    .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

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
            
            // 1. Update rent status
            await supabase.from("tenants").update({ rent_status: "Paid" }).eq("id", tenant.id);
            
            // 2. Insert payment record
            await supabase.from("payments").insert({
              tenant_id: tenant.id,
              amount: myRoom?.price || 5000,
              description: `Rent Payment for Room ${myRoom?.number || ''}`,
              status: "Paid"
            });
          }}
        />
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold">Payment History</h3>
        </div>
        <div className="divide-y divide-border">
          {myPayments.map((payment: any) => (
            <div key={payment.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold">{payment.description}</p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                    {new Date(payment.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-emerald-600 mb-1">
                  ₱{Number(payment.amount).toLocaleString()}
                </p>
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
          {myPayments.length === 0 && (
            <div className="p-12 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted mx-auto mb-3">
                <CreditCard size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No past payments</p>
              <p className="text-xs text-muted-foreground mt-1">Your payment history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MaintenanceSectionV2({
  room,
  tenant,
  onFollowUp,
}: {
  room: any;
  tenant: any;
  onFollowUp: (profileId: string, requestId: string) => void;
}) {
  const { data: requests, loading } = useRealtimeData("maintenance_requests", "created_at", false);
  const { data: updates } = useRealtimeData("maintenance_updates", "created_at", true);
  const { data: profiles } = useRealtimeData("profiles");
  const { data: staff } = useRealtimeData("staff");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [submitting, setSubmitting] = useState(false);

  const admins = profiles.filter((p: any) => p.role === "admin" || p.role === "administrator" || p.role === "staff");
  const firstResponder = admins[0];
  const myRequests = requests
    .filter((r: any) => r.tenant_id === tenant.id || (!r.tenant_id && r.room_id === room?.id))
    .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const handleSubmit = async () => {
    if (!subject.trim() || !room) return;
    setSubmitting(true);
    const payload = {
      room_id: room.id,
      tenant_id: tenant.id,
      subject: subject.trim(),
      description: description.trim() || subject.trim(),
      date_reported: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("maintenance_requests")
      .insert(payload)
      .select("id")
      .maybeSingle();

    if (error) {
      alert("Failed to submit request: " + error.message);
    } else {
      const requestId = data?.id;
      if (requestId) {
        await supabase.from("maintenance_updates").insert({
          maintenance_request_id: requestId,
          author_id: tenant.profile_id,
          message: "Request submitted by tenant."
        });
      }
      await supabase.from("notifications").insert({
        profile_id: null,
        title: "New maintenance request",
        body: `${tenant.name} submitted: ${subject.trim()}`,
        category: "maintenance",
        priority: priority === "urgent" ? "urgent" : "normal",
        related_id: requestId || null
      });
      setSubject("");
      setDescription("");
      setPriority("normal");
    }
    setSubmitting(false);
  };

  const handleFollowUp = async (req: any) => {
    if (!tenant.profile_id) return;
    if (!firstResponder?.id) {
      alert("No administrator or staff account is available to message yet.");
      return;
    }

    const intro = `Follow-up for maintenance request: ${req.subject || "Room issue"}`;
    await supabase.from("messages").insert({
      sender_id: tenant.profile_id,
      receiver_id: firstResponder.id,
      content: intro,
      related_maintenance_request_id: req.id
    });
    onFollowUp(firstResponder.id, req.id);
  };

  if (!room) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="text-sm font-medium text-foreground">You are not assigned to a room.</p>
        <p className="mt-1 text-xs text-muted-foreground">You must be assigned to a room to submit maintenance requests.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Wrench size={19} />
          </div>
          <div>
            <h3 className="text-sm font-bold">Request maintenance for Room {room.number}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Every request stays in your history, even after room changes.</p>
          </div>
        </div>

        <div className="grid gap-3">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject, e.g. Broken AC"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add details, location, or when the issue happens..."
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex rounded-xl border border-border bg-background p-1">
              {(["low", "normal", "high", "urgent"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${priority === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {value}
                </button>
              ))}
            </div>
            <button 
              onClick={handleSubmit}
              disabled={submitting || !subject.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-[#173f39] disabled:opacity-50"
            >
              <Send size={14} /> {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold">Maintenance History</h3>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground">
            {myRequests.length} total
          </span>
        </div>
        
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading requests...</div>
        ) : myRequests.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">You have no maintenance requests.</div>
        ) : (
          <div className="divide-y divide-border">
            {myRequests.map((req: any) => {
              const normalizedStatus = normalizeMaintenanceStatus(req.status);
              const requestUpdates = updates.filter((update: any) => update.maintenance_request_id === req.id);
              const assignedStaff = staff.find((person: any) => person.id === req.assigned_staff_id || person.profile_id === req.assigned_staff_id);
              const [originalDesc, adminReply] = (req.description || "").split("|||ADMIN_REPLY|||");
              return (
                <div key={req.id} className="px-5 py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <div className={`grid size-9 shrink-0 place-items-center rounded-xl ${maintenanceStatusClass(normalizedStatus)}`}>
                        {isMaintenanceOpen(normalizedStatus) ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{req.subject || originalDesc}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(req.created_at || new Date()).toLocaleDateString()} · Priority: {req.priority || "normal"}
                        </p>
                        {assignedStaff && (
                          <p className="mt-1 text-xs text-muted-foreground">Assigned to {assignedStaff.name}</p>
                        )}
                      </div>
                    </div>
                    <span className={`w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${maintenanceStatusClass(normalizedStatus)}`}>
                      {maintenanceStatusLabel(normalizedStatus)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 pl-0 sm:pl-12">
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</p>
                      <p className="mt-1 text-sm">{originalDesc || req.subject}</p>
                    </div>
                    {adminReply && (
                      <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                        <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                          <MessageSquare size={12}/> Admin Reply
                        </p>
                        <p className="text-sm text-foreground/80">{adminReply}</p>
                      </div>
                    )}
                    {requestUpdates.length > 0 && (
                      <div className="rounded-xl border border-border p-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timeline</p>
                        <div className="space-y-2">
                          {requestUpdates.slice(0, 4).map((update: any) => (
                            <div key={update.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="mt-1 size-1.5 rounded-full bg-primary" />
                              <span>{update.message} <span className="font-mono">({new Date(update.created_at).toLocaleDateString()})</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleFollowUp(req)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold text-primary transition hover:bg-muted"
                    >
                      <MessageSquare size={14} /> Follow up in Messages
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MaintenanceSection({ room, tenant }: { room: any, tenant: any }) {
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
      tenant_id: tenant.id,
      subject: newRequest,
      description: newRequest
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
          myRequests.map((req: any) => {
            const [originalDesc, adminReply] = (req.description || "").split("|||ADMIN_REPLY|||");
            return (
            <div key={req.id} className="flex flex-col px-5 py-4 gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`grid size-8 place-items-center rounded-lg ${
                    req.status === "resolved" || req.status === "closed" ? "bg-emerald-100 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {req.status === "resolved" || req.status === "closed" ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{req.subject || originalDesc}</p>
                    <p className="text-xs text-muted-foreground">{new Date(req.created_at || new Date()).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase whitespace-nowrap ${
                  req.status === "resolved" || req.status === "closed" ? "bg-emerald-100 text-emerald-700" : 
                  req.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-amber-50 text-amber-600"
                }`}>{req.status?.replace("_", " ") || "open"}</span>
              </div>
              
              {adminReply && (
                <div className="ml-11 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1 flex items-center gap-1">
                    <MessageSquare size={12}/> Admin Reply
                  </p>
                  <p className="text-sm text-foreground/80">{adminReply}</p>
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function CommunitySection({ profileId, houseId, onMessageSeller }: { profileId?: string, houseId?: string, onMessageSeller: (id: string) => void }) {
  const { data: notices } = useRealtimeData("notices");
  const { data: marketplace } = useRealtimeData("marketplace_items");
  const { data: profiles } = useRealtimeData("profiles");
  const { data: tenants } = useRealtimeData("tenants");
  const { data: rooms } = useRealtimeData("rooms");

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
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-5xl">
      {/* Notice Board */}
      <div className="space-y-4 min-w-0">
        <h3 className="font-['Libre_Baskerville'] text-xl tracking-tight">House Notices</h3>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {notices.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Megaphone size={24} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No Announcements</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notices.map((notice) => (
                <div key={notice.id} className="p-4 sm:p-5">
                  <h4 className="font-bold text-sm sm:text-base">{notice.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{notice.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Marketplace */}
      <div className="space-y-4 min-w-0">
        <h3 className="font-['Libre_Baskerville'] text-xl tracking-tight">Marketplace</h3>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 mb-4">
          <p className="text-sm font-bold mb-3">Sell an Item</p>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="What are you selling?"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Price (₱)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="flex-1 min-w-0 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={handlePostItem}
                disabled={isPosting}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] disabled:opacity-50 shrink-0"
              >
                {isPosting ? "..." : "Post"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {marketplace.map((item) => {
            const seller = profiles.find((p: any) => p.id === item.profile_id);
            const sellerTenant = tenants.find((t: any) => t.profile_id === seller?.id);
            const sellerRoom = rooms.find((r: any) => r.id === sellerTenant?.room_id);
            return (
            <div key={item.id} className="flex flex-col xs:flex-row xs:items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-4 gap-3">
              <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                {seller?.avatar_url ? (
                  <img src={seller.avatar_url} alt="Avatar" className="size-9 sm:size-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="grid size-9 sm:size-10 place-items-center rounded-full bg-primary/20 text-primary shrink-0">
                    <User size={16} />
                  </div>
                )}
                <div className="min-w-0 overflow-hidden">
                  <p className="font-bold text-sm truncate">{item.item_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {seller?.full_name || "Resident"} 
                    {sellerRoom && ` • Rm ${sellerRoom.number}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between xs:flex-col xs:items-end shrink-0 pl-12 xs:pl-0">
                <p className="font-bold text-primary text-sm">₱{item.price.toLocaleString()}</p>
                {seller?.id !== profileId && (
                  <button onClick={() => onMessageSeller(seller?.id)} className="text-xs font-bold text-emerald-600 mt-0.5 hover:underline">Message</button>
                )}
              </div>
            </div>
          )})}
          {marketplace.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-6 sm:p-8 text-center text-sm text-muted-foreground">
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

  const myVisitors = visitors.filter((v: any) => v.profile_id === profileId).sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  
  const upcomingVisitors = myVisitors.filter((v: any) => v.status === "pending");
  const historyVisitors = myVisitors.filter((v: any) => v.status === "approved");

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
        <div className="border-b border-border px-5 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            Pending Visitors
          </h3>
        </div>
        <div className="divide-y divide-border">
          {upcomingVisitors.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-bold">{v.visitor_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(v.date_of_visit).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600">
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
          {upcomingVisitors.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              You have no pending gate passes.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden mt-6">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Approved History
          </h3>
        </div>
        <div className="divide-y divide-border">
          {historyVisitors.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-5 py-4 opacity-80 hover:opacity-100 transition">
              <div>
                <p className="font-bold">{v.visitor_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(v.date_of_visit).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
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
          {historyVisitors.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No approved visitors yet.
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

function ProfileSection({ user, tenant, room }: { user: any, tenant: any, room: any }) {
  const [activeTab, setActiveTab] = useState("personal");
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [pushStatus, setPushStatus] = useState("");
  
  const { data: profiles } = useRealtimeData("profiles");
  const realProfile = profiles.find((p: any) => p.id === user?.id) || user;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    let updateData: any = {};

    if (activeTab === "personal") {
      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;
      const phone = formData.get("phone") as string;
      
      if (firstName || lastName) {
        updateData.full_name = `${firstName || ''} ${lastName || ''}`.trim();
      }
      if (phone !== null) updateData.phone = phone;

    } else if (activeTab === "emergency") {
      const emergencyName = formData.get("emergencyName") as string;
      const emergencyRelation = formData.get("emergencyRelation") as string;
      const emergencyPhone = formData.get("emergencyPhone") as string;
      
      if (emergencyName !== null) updateData.emergency_name = emergencyName;
      if (emergencyRelation !== null) updateData.emergency_relation = emergencyRelation;
      if (emergencyPhone !== null) updateData.emergency_phone = emergencyPhone;

    } else if (activeTab === "preferences") {
      updateData.pref_rent = formData.get("prefRent") !== null;
      updateData.pref_maintenance = formData.get("prefMaintenance") !== null;
      updateData.pref_announcements = formData.get("prefAnnouncements") !== null;
      updateData.pref_visitors = formData.get("prefVisitors") !== null;
      updateData.pref_push = formData.get("prefPush") !== null;

    } else if (activeTab === "security") {
      const newPassword = formData.get("newPassword") as string;
      const confirmPassword = formData.get("confirmPassword") as string;
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          alert("New password and confirm password do not match!");
          setIsSaving(false);
          return;
        }
        const { error: passError } = await supabase.auth.updateUser({ password: newPassword });
        if (passError) {
          alert("Failed to update password. " + passError.message);
          setIsSaving(false);
          return;
        }
      }
    }

    try {
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id);
        if (error) throw error;
      }
      setSuccessMsg("Changes saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnablePush = async () => {
    if (!user?.id) return;
    setPushStatus("Requesting browser permission...");
    try {
      const result = await registerPushSubscription(user.id);
      if (!result.ok) {
        setPushStatus(result.reason || "Push notifications are not available.");
        return;
      }

      await supabase.from("push_subscriptions").insert({
        profile_id: user.id,
        endpoint: result.endpoint || "browser-permission-granted",
        subscription: { endpoint: result.endpoint || "browser-permission-granted" }
      });
      await supabase.from("profiles").update({ pref_push: true }).eq("id", user.id);
      setPushStatus("Browser push is enabled for this device.");
    } catch (error) {
      console.error("Unable to enable push notifications:", error);
      setPushStatus("Push setup failed. In-app alerts will still work.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Storage upload failed, using local base64");
        try {
          const base64DataUrl = await compressImageToBase64(file, 400, 0.7);
          const { error } = await supabase.from('profiles').update({ avatar_url: base64DataUrl }).eq('id', user.id);
          if (error) throw error;
          
          setSuccessMsg("Profile picture updated!");
        } catch (err) {
          console.error("Failed to process image locally:", err);
          alert("Could not save the image locally. Please try a smaller image.");
        }
        setTimeout(() => setSuccessMsg(""), 3000);
        return;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error } = await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
      if (error) throw error;
      
      setSuccessMsg("Profile picture updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar! Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const currentAvatar = realProfile?.avatar_url || user?.avatar_url;
  
  const fullName = realProfile?.full_name || realProfile?.fullName || user?.fullName || "";
  const firstName = fullName.split(" ")[0] || "";
  const lastName = fullName.split(" ").slice(1).join(" ") || "";

  const profileKey = JSON.stringify(realProfile);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">My Profile</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => setActiveTab("personal")} className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "personal" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Personal Information</button>
          <button type="button" onClick={() => setActiveTab("emergency")} className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "emergency" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Emergency Contact</button>
          <button type="button" onClick={() => setActiveTab("preferences")} className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "preferences" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Preferences</button>
          <button type="button" onClick={() => setActiveTab("security")} className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "security" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Security</button>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800">
              <CheckCircle2 size={18} />
              <p className="text-sm font-medium">{successMsg}</p>
            </div>
          )}

          <form key={profileKey} onSubmit={handleSave}>
            {activeTab === "personal" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-bold mb-4">Profile Picture</h3>
                  <div className="flex items-center gap-6">
                    <div className="grid size-20 place-items-center rounded-full bg-muted border border-border overflow-hidden">
                      {currentAvatar ? <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={32} className="text-muted-foreground" />}
                    </div>
                    <div className="space-y-2">
                      <label className={`inline-block px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg transition ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-primary/90"}`}>
                        {uploading ? "Uploading..." : "Upload New"}
                        <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleAvatarUpload} />
                      </label>
                      <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold pt-4 border-t border-border">Basic Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <input type="text" name="firstName" defaultValue={firstName} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <input type="text" name="lastName" defaultValue={lastName} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <input type="email" defaultValue={realProfile?.email || user?.email || ""} className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none cursor-not-allowed opacity-80" readOnly title="Contact support to change email" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <input type="tel" name="phone" defaultValue={realProfile?.phone || ""} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "emergency" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-lg font-bold">Emergency Contact</h3>
                <p className="text-sm text-muted-foreground -mt-4 mb-4">Who should we contact in case of an emergency?</p>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Contact Name</label>
                    <input type="text" name="emergencyName" defaultValue={realProfile?.emergency_name || ""} placeholder="Jane Doe" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                      <input type="text" name="emergencyRelation" defaultValue={realProfile?.emergency_relation || ""} placeholder="Mother, Spouse, etc." className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                      <input type="tel" name="emergencyPhone" defaultValue={realProfile?.emergency_phone || ""} placeholder="+1 (555) 000-0000" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-lg font-bold">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground -mt-4 mb-4">Choose how you want to be notified about house updates.</p>
                
                <div className="space-y-4">
                  {[
                    { title: "Rent Reminders", desc: "Get notified when rent is due or overdue.", name: "prefRent", dbKey: "pref_rent" as keyof typeof realProfile },
                    { title: "Maintenance Updates", desc: "Receive updates on your maintenance requests.", name: "prefMaintenance", dbKey: "pref_maintenance" as keyof typeof realProfile },
                    { title: "House Announcements", desc: "Stay informed about general house news.", name: "prefAnnouncements", dbKey: "pref_announcements" as keyof typeof realProfile },
                    { title: "Visitor Approvals", desc: "Get alerts when your visitor pass is approved.", name: "prefVisitors", dbKey: "pref_visitors" as keyof typeof realProfile },
                    { title: "Browser Push", desc: "Allow this device to receive emergency browser alerts when supported.", name: "prefPush", dbKey: "pref_push" as keyof typeof realProfile },
                  ].map((item, i) => (
                    <label key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition">
                      <input type="checkbox" name={item.name} defaultChecked={realProfile?.[item.dbKey] ?? true} className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary" />
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">Enable browser push on this device</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Urgent alerts still appear in-app if browser permission is denied.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleEnablePush}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                      >
                        Enable Push
                      </button>
                    </div>
                    {pushStatus && <p className="mt-3 text-xs text-muted-foreground">{pushStatus}</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-lg font-bold">Security</h3>
                <p className="text-sm text-muted-foreground -mt-4 mb-4">Update your password to keep your account secure.</p>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">New Password</label>
                    <input type="password" name="newPassword" placeholder="••••••••" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                    <input type="password" name="confirmPassword" placeholder="••••••••" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              {room ? (
                <div className="hidden sm:block">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Lease</p>
                  <p className="text-sm font-bold mt-0.5">Room {room.room_number}</p>
                </div>
              ) : <div />}
              
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function MessagesSection({
  currentUserId,
  activeChatUserId,
  setActiveChatUserId,
  maintenanceContextId,
  clearMaintenanceContext,
}: {
  currentUserId?: string;
  activeChatUserId: string | null;
  setActiveChatUserId: (id: string | null) => void;
  maintenanceContextId?: string | null;
  clearMaintenanceContext?: () => void;
}) {
  const { data: allMessages } = useRealtimeData("messages", "created_at", true);
  const { data: profiles } = useRealtimeData("profiles");
  const { data: tenants } = useRealtimeData("tenants");
  const { data: rooms } = useRealtimeData("rooms");
  
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [deletingConvo, setDeletingConvo] = useState<string | null>(null);

  // --- Per-message deletion state ---
  const [contextMenu, setContextMenu] = useState<{ msgId: string; isMe: boolean; x: number; y: number } | null>(null);
  const [hiddenMsgIds, setHiddenMsgIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`hidden_msgs_${currentUserId}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Persist hidden message IDs
  const persistHidden = useCallback((ids: Set<string>) => {
    setHiddenMsgIds(ids);
    localStorage.setItem(`hidden_msgs_${currentUserId}`, JSON.stringify([...ids]));
  }, [currentUserId]);

  const handleDeleteForEveryone = async (msgId: string) => {
    setContextMenu(null);
    const { error } = await supabase.from("messages").delete().eq("id", msgId);
    if (error) alert("Failed to delete message: " + error.message);
  };

  const handleDeleteForMe = (msgId: string) => {
    setContextMenu(null);
    const next = new Set(hiddenMsgIds);
    next.add(msgId);
    persistHidden(next);
  };

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [contextMenu]);

  const openContextMenu = (e: { clientX: number; clientY: number }, msgId: string, isMe: boolean) => {
    // Clamp position to stay within viewport
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 120);
    setContextMenu({ msgId, isMe, x, y });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || !activeChatUserId) return;
    setSending(true);
    try {
      const base64 = await compressImageToBase64(file, 800, 0.7);
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        receiver_id: activeChatUserId,
        content: base64,
        related_maintenance_request_id: maintenanceContextId || null
      });
      if (error) alert("Failed to send image");
    } catch (err) {
      console.error(err);
      alert("Failed to process image");
    }
    setSending(false);
  };

  const myMessages = allMessages.filter((m: any) => m.sender_id === currentUserId || m.receiver_id === currentUserId);

  const partnerIds = Array.from(new Set(myMessages.map((m: any) => m.sender_id === currentUserId ? m.receiver_id : m.sender_id)));
  
  if (activeChatUserId && !partnerIds.includes(activeChatUserId)) {
    partnerIds.unshift(activeChatUserId);
  }

  const handleDeleteConversation = async (partnerId: string) => {
    if (!currentUserId) return;
    const confirmed = window.confirm("Delete this entire conversation? This cannot be undone.");
    if (!confirmed) return;
    setDeletingConvo(partnerId);
    const convoMessages = allMessages.filter(
      (m: any) =>
        (m.sender_id === currentUserId && m.receiver_id === partnerId) ||
        (m.sender_id === partnerId && m.receiver_id === currentUserId)
    );
    const ids = convoMessages.map((m: any) => m.id);
    if (ids.length > 0) {
      const { error } = await supabase.from("messages").delete().in("id", ids);
      if (error) {
        alert("Failed to delete conversation: " + error.message);
      }
    }
    if (activeChatUserId === partnerId) {
      setActiveChatUserId(null);
    }
    setDeletingConvo(null);
  };

  const partners = partnerIds.map(id => profiles.find((p: any) => p.id === id)).filter(Boolean);
  const activePartner = profiles.find((p: any) => p.id === activeChatUserId);

  const activePartnerTenant = tenants.find((t: any) => t.profile_id === activeChatUserId);
  const activePartnerRoom = rooms.find((r: any) => r.id === activePartnerTenant?.room_id);

  const chatHistory = myMessages.filter((m: any) => 
    ((m.sender_id === currentUserId && m.receiver_id === activeChatUserId) ||
    (m.receiver_id === currentUserId && m.sender_id === activeChatUserId)) &&
    !hiddenMsgIds.has(m.id)
  ).sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

  useEffect(() => {
    if (!currentUserId || !activeChatUserId) return;
    const unreadMessages = chatHistory.filter((m: any) => m.receiver_id === currentUserId && !m.is_read);
    
    if (unreadMessages.length > 0) {
      const unreadIds = unreadMessages.map((m: any) => m.id);
      supabase.from("messages").update({ is_read: true }).in("id", unreadIds).then();
    }
  }, [chatHistory, currentUserId, activeChatUserId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !activeChatUserId) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: activeChatUserId,
      content: newMessage,
      related_maintenance_request_id: maintenanceContextId || null
    });
    if (error) alert("Failed to send message: " + error.message);
    else {
      setNewMessage("");
      setShowEmoji(false);
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-[75vh] md:h-[80vh] rounded-2xl border border-border bg-card overflow-hidden max-w-6xl">
      <div className={`${activeChatUserId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-b md:border-b-0 md:border-r border-border bg-muted/10 flex-col h-full`}>
        <div className="p-4 border-b border-border">
          <h3 className="font-['Libre_Baskerville'] font-bold text-lg tracking-tight">Conversations</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {partners.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground p-4">No conversations yet.</p>
          ) : (
            partners.map((p: any) => {
              const pTenant = tenants.find((t: any) => t.profile_id === p.id);
              const pRoom = rooms.find((r: any) => r.id === pTenant?.room_id);
              const lastMsg = myMessages
                .filter((m: any) => (m.sender_id === p.id && m.receiver_id === currentUserId) || (m.sender_id === currentUserId && m.receiver_id === p.id))
                .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
              const unreadCount = myMessages.filter((m: any) => m.sender_id === p.id && m.receiver_id === currentUserId && !m.is_read).length;
              return (
                <div
                  key={p.id}
                  className={`group relative w-full flex items-center gap-3 p-3 rounded-xl transition cursor-pointer ${activeChatUserId === p.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}
                  onClick={() => setActiveChatUserId(p.id)}
                >
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="Avatar" className="size-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="grid size-10 place-items-center rounded-full bg-primary/20 text-primary shrink-0">
                      <User size={16} />
                    </div>
                  )}
                  <div className="text-left overflow-hidden flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm truncate">{p.full_name}</p>
                      {unreadCount > 0 && (
                        <span className="shrink-0 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{unreadCount}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {lastMsg
                        ? lastMsg.content.startsWith("data:image/") ? "📷 Image" : lastMsg.content.slice(0, 35) + (lastMsg.content.length > 35 ? "…" : "")
                        : pRoom ? `Room ${pRoom.number}` : "Start chatting"
                      }
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteConversation(p.id); }}
                    disabled={deletingConvo === p.id}
                    className="shrink-0 p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all disabled:opacity-50"
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={`${!activeChatUserId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-background relative h-full`}>
        {activeChatUserId && activePartner ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3 bg-card z-10 shadow-sm shrink-0">
              <button 
                onClick={() => setActiveChatUserId(null)}
                className="md:hidden p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
              {activePartner.avatar_url ? (
                <img src={activePartner.avatar_url} alt="Avatar" className="size-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                  <User size={16} />
                </div>
              )}
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="font-bold truncate">{activePartner.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  Tenant {activePartnerRoom && ` • Room ${activePartnerRoom.number}`}
                </p>
              </div>
              <button
                onClick={() => handleDeleteConversation(activeChatUserId!)}
                disabled={deletingConvo === activeChatUserId}
                className="shrink-0 p-2 rounded-xl text-muted-foreground hover:bg-red-100 hover:text-red-600 transition disabled:opacity-50"
                title="Delete conversation"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col">
              {maintenanceContextId && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-primary">Maintenance follow-up</p>
                      <p className="mt-1 text-xs text-muted-foreground">Messages you send now will be linked to request {maintenanceContextId.slice(0, 8)}.</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearMaintenanceContext}
                      className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                      aria-label="Clear maintenance context"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
              {chatHistory.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                  <MessageSquare size={32} className="mb-3 opacity-20" />
                  <p className="text-sm">Start the conversation with {activePartner.full_name}</p>
                </div>
              ) : (
                chatHistory.map((msg: any) => {
                  const isMe = msg.sender_id === currentUserId;
                  const senderProfile = isMe ? profiles.find((p: any) => p.id === currentUserId) : activePartner;
                  const avatarUrl = senderProfile?.avatar_url;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        openContextMenu(e, msg.id, isMe);
                      }}
                      onTouchStart={(e) => {
                        const touch = e.touches[0];
                        longPressTimer.current = setTimeout(() => {
                          openContextMenu({ clientX: touch.clientX, clientY: touch.clientY }, msg.id, isMe);
                        }, 500);
                      }}
                      onTouchEnd={() => {
                        if (longPressTimer.current) {
                          clearTimeout(longPressTimer.current);
                          longPressTimer.current = null;
                        }
                      }}
                      onTouchMove={() => {
                        if (longPressTimer.current) {
                          clearTimeout(longPressTimer.current);
                          longPressTimer.current = null;
                        }
                      }}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        <div className="shrink-0 mt-auto hidden sm:block">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="size-8 rounded-full object-cover" />
                          ) : (
                            <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                              <User size={14} />
                            </div>
                          )}
                        </div>
                        <div className={`rounded-2xl px-5 py-3 text-sm select-none ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted border border-border rounded-bl-sm"}`}>
                          {msg.content.startsWith("data:image/") ? (
                            <img src={msg.content} alt="Attachment" className="rounded-xl max-h-64 object-cover" />
                          ) : (
                            <p>{msg.content}</p>
                          )}
                          <p className={`text-[10px] mt-1 text-right flex items-center gap-1 ${isMe ? "justify-end text-primary-foreground/70" : "justify-start text-muted-foreground"}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {isMe && (
                              <span className={msg.is_read ? "text-blue-200" : "opacity-50"} title={msg.is_read ? "Seen" : "Sent"}>
                                <CheckCheck size={12} />
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Message context menu */}
              <AnimatePresence>
                {contextMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="fixed z-[100] rounded-xl bg-card border border-border shadow-2xl backdrop-blur-sm overflow-hidden"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1 min-w-[180px]">
                      {contextMenu.isMe && (
                        <button
                          onClick={() => handleDeleteForEveryone(contextMenu.msgId)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={15} />
                          Delete for Everyone
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteForMe(contextMenu.msgId)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition"
                      >
                        <EyeOff size={15} />
                        Delete for Me
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-3 md:p-4 border-t border-border bg-card shrink-0">
              <div className="flex gap-2 relative items-center">
                <div className="relative">
                  <button 
                    onClick={() => setShowEmoji(!showEmoji)} 
                    className="p-2 text-muted-foreground hover:text-foreground transition rounded-full hover:bg-muted"
                  >
                    <Smile size={20} />
                  </button>
                  <AnimatePresence>
                    {showEmoji && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-12 left-0 z-50 shadow-xl rounded-xl overflow-hidden"
                      >
                        <EmojiPicker onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <label className="p-2 text-muted-foreground hover:text-foreground transition rounded-full hover:bg-muted cursor-pointer">
                  <Paperclip size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={sending} />
                </label>

                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 rounded-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary pr-12 transition"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 aspect-square grid place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition w-8 h-8"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
            <MessageSquare size={48} className="mb-4 opacity-10" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
