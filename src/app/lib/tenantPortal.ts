/**
 * Tenant portal utility functions used across the User Dashboard.
 */

/** Generate a receipt number like "RCP-20260715-XXXX" */
export function buildReceiptNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCP-${y}${m}${d}-${rand}`;
}

/** Format a number as Philippine peso currency */
export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/** Return a label + tone based on the due date */
export function getDueDateState(dueDate: string | null | undefined): { label: string; tone: string } {
  if (!dueDate) return { label: "No due date set", tone: "text-muted-foreground" };

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`, tone: "text-red-600 font-semibold" };
  if (diffDays === 0) return { label: "Due today", tone: "text-amber-600 font-semibold" };
  if (diffDays <= 3) return { label: `Due in ${diffDays} day${diffDays === 1 ? "" : "s"}`, tone: "text-amber-600" };
  return { label: `Due ${due.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}`, tone: "text-muted-foreground" };
}

/** Check if a maintenance request is still open */
export function isMaintenanceOpen(status: string): boolean {
  const closed = ["resolved", "closed", "completed", "cancelled"];
  return !closed.includes((status || "").toLowerCase());
}

/** Check if a notice is urgent */
export function isUrgentNotice(notice: any): boolean {
  return notice?.priority === "urgent" || notice?.is_urgent === true;
}

/** Return a Tailwind class string for a maintenance status badge */
export function maintenanceStatusClass(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "resolved" || s === "completed") return "bg-emerald-100 text-emerald-700";
  if (s === "in_progress" || s === "in progress") return "bg-blue-100 text-blue-700";
  if (s === "cancelled") return "bg-gray-100 text-gray-500";
  return "bg-amber-100 text-amber-700"; // pending / open
}

/** Return a human-readable label for a maintenance status */
export function maintenanceStatusLabel(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "in_progress") return "In Progress";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Normalize a maintenance status string */
export function normalizeMaintenanceStatus(status: string): string {
  return (status || "pending").toLowerCase().replace(/\s+/g, "_");
}

/** Register a push subscription (stub — real implementation needs a service worker) */
export async function registerPushSubscription(_profileId: string): Promise<void> {
  // Push notification registration would go here
  console.info("Push subscription registration is a stub in this environment.");
}
