import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthContextType, User, UserRole } from "../types/auth";

// ─── Seeded Accounts (fixed credentials) ───────────────
const SEEDED_ACCOUNTS: { email: string; password: string; user: User }[] = [
  {
    email: "superadmin",
    password: "superadmin123",
    user: {
      id: "sa-001",
      email: "superadmin",
      fullName: "Super Administrator",
      role: "administrator",
      createdAt: "2025-01-01T00:00:00Z",
    },
  },
  {
    email: "admin",
    password: "admin123",
    user: {
      id: "adm-001",
      email: "admin",
      fullName: "House Manager",
      role: "admin",
      boardingHouseId: "bh-001",
      createdAt: "2025-01-15T00:00:00Z",
    },
  },
];

// ─── Storage Keys ──────────────────────────────────────
const STORAGE_KEY = "boardinghow_session";
const USERS_KEY = "boardinghow_users";

// ─── Helpers ───────────────────────────────────────────
function generateId(): string {
  return `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getStoredUsers(): { email: string; password: string; user: User }[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeUser(email: string, password: string, user: User) {
  const users = getStoredUsers();
  users.push({ email, password, user });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ─── Context ───────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));

      // Check seeded accounts first
      const seeded = SEEDED_ACCOUNTS.find(
        (a) => a.email === email && a.password === password
      );
      if (seeded) {
        setUser(seeded.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded.user));
        return {};
      }

      // Check registered users
      const stored = getStoredUsers().find(
        (a) => a.email === email && a.password === password
      );
      if (stored) {
        setUser(stored.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.user));
        return {};
      }

      return { error: "Invalid email or password. Please try again." };
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string
    ): Promise<{ error?: string }> => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));

      // Check if email already taken (seeded + stored)
      const allEmails = [
        ...SEEDED_ACCOUNTS.map((a) => a.email),
        ...getStoredUsers().map((a) => a.email),
      ];
      if (allEmails.includes(email)) {
        return { error: "An account with this email already exists." };
      }

      // Always create as "user" role — no role selection
      const newUser: User = {
        id: generateId(),
        email,
        fullName,
        role: "user" as UserRole,
        createdAt: new Date().toISOString(),
      };

      storeUser(email, password, newUser);
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

      return {};
    },
    []
  );

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
