import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdministratorDashboard from "./pages/AdministratorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Wrench } from "lucide-react";

type Page = "home" | "login" | "dashboard";

function AppRouter() {
  const { user, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const [page, setPage] = useState<Page>("home");

  // Auto-redirect to dashboard when user signs in or refreshes
  useEffect(() => {
    if (isAuthenticated) {
      if (page === "login") {
        // Small delay so user sees the success state
        const timer = setTimeout(() => setPage("dashboard"), 1200);
        return () => clearTimeout(timer);
      } else if (page === "home") {
        // Immediate redirect if refreshing the page while logged in
        setPage("dashboard");
      }
    }
  }, [isAuthenticated, page]);

  // If user signs out while on dashboard, go home
  useEffect(() => {
    if (!isAuthenticated && page === "dashboard") {
      setPage("home");
    }
  }, [isAuthenticated, page]);

  // Maintenance mode guard
  if (settings.maintenance_mode && user?.role !== "administrator") {
    // If not admin, they only see this screen.
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary mb-6">
          <Wrench size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Site Under Maintenance</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          {settings.platform_name} is currently undergoing scheduled maintenance. Please check back later!
        </p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition">
          Refresh Page
        </button>
      </div>
    );
  }

  if (page === "dashboard") {
    return (
      <ProtectedRoute onRedirectToLogin={() => setPage("login")}>
        {user?.role === "administrator" && <AdministratorDashboard />}
        {user?.role === "admin" && <AdminDashboard />}
        {user?.role === "staff" && <StaffDashboard />}
        {user?.role === "user" && <UserDashboard />}
      </ProtectedRoute>
    );
  }

  if (page === "login") {
    return <LoginPage onGoHome={() => setPage("home")} />;
  }

  return <HomePage onGoToLogin={() => setPage("login")} />;
}

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
