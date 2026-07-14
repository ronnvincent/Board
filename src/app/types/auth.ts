// ─── Role Types ────────────────────────────────────────
export type UserRole = "administrator" | "admin" | "staff" | "user";

// ─── User Model ────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  // Admin-specific: which boarding house they manage
  boardingHouseId?: string;
  // Staff-specific: assigned by admin
  assignedBy?: string;
  // User-specific: their room assignment
  roomNumber?: string;
}

// ─── Auth State ────────────────────────────────────────
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Auth Context Interface (Supabase-ready) ───────────
export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  guestSignIn: (name: string, role: UserRole) => void;
  signOut: () => void;
}

// ─── Role Display Info ─────────────────────────────────
export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bgColor: string }> = {
  administrator: { label: "Administrator", color: "#8c6b37", bgColor: "#f2e3c1" },
  admin:         { label: "Admin",         color: "#1f5149", bgColor: "#d6e4d7" },
  staff:         { label: "Staff",         color: "#2563eb", bgColor: "#dbeafe" },
  user:          { label: "Resident",      color: "#64706a", bgColor: "#ece4d5" },
};
