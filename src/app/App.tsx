import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdministratorDashboard from "./pages/AdministratorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

type Page = "home" | "login" | "dashboard";

function AppRouter() {
  const { user, isAuthenticated } = useAuth();
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
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
