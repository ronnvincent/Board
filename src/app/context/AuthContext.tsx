import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthContextType, User, UserRole } from "../types/auth";
import { supabase, type Profile } from "../../lib/supabase";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the full profile (including role) for a given auth user
  const fetchAndSetUserProfile = async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    try {
      // Query the profiles table we created in Supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setUser(null);
        return;
      }

      const profile = data as Profile;

      setUser({
        id: profile.id,
        email: authUser.email,
        fullName: profile.full_name,
        role: profile.role,
        createdAt: profile.created_at,
      });
    } catch (err) {
      console.error("Error in fetchAndSetUserProfile:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session?.user) {
          fetchAndSetUserProfile(session.user).finally(() => setIsLoading(false));
        } else {
          setIsLoading(false);
        }
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        if (session?.user) {
          setIsLoading(true);
          fetchAndSetUserProfile(session.user).finally(() => setIsLoading(false));
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Supabase signIn error:", error);
          return { error: error.message || JSON.stringify(error) };
        }
        return {};
      } catch (err: any) {
        console.error("signIn catch error:", err);
        return { error: err?.message || JSON.stringify(err) || "An unexpected error occurred." };
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string
    ): Promise<{ error?: string }> => {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          console.error("Supabase signUp error:", error);
          return { error: error.message || JSON.stringify(error) };
        }
        return {};
      } catch (err: any) {
        console.error("signUp catch error:", err);
        return { error: err?.message || JSON.stringify(err) || "An unexpected error occurred." };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
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

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
