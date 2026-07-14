import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  onRedirectToLogin: () => void;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  onRedirectToLogin,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading spinner while auth state is resolving
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-['DM_Sans']">Loading…</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Use setTimeout to avoid calling setState during render
    setTimeout(() => onRedirectToLogin(), 0);
    return null;
  }

  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background font-['DM_Sans']">
        <div className="text-center max-w-sm">
          <div className="grid size-16 mx-auto place-items-center rounded-2xl bg-red-50 text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground mb-6">You don't have permission to access this page.</p>
          <button
            onClick={onRedirectToLogin}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-[#173f39] transition"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
