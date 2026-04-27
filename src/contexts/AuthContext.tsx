import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const adminCheckRequestRef = useRef(0);
  const ADMIN_CACHE_PREFIX = "elib_admin_status:";
  const clearAuthState = () => {
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  };

  const checkAdmin = async (userId: string, retries = 2): Promise<boolean | null> => {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (error) {
      // Fallback to direct query if RPC fails for any reason.
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleError) {
        return !!roleData;
      }

      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return checkAdmin(userId, retries - 1);
      }
      return null;
    }

    return !!data;
  };

  const applySession = async (nextSession: Session | null) => {
    const requestId = ++adminCheckRequestRef.current;
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (!nextSession?.user) {
      setIsAdmin(false);
      return;
    }

    const cacheKey = `${ADMIN_CACHE_PREFIX}${nextSession.user.id}`;
    const cachedAdmin = localStorage.getItem(cacheKey);
    if (cachedAdmin === "true") {
      // Show stable admin UI during refresh while server check resolves.
      setIsAdmin(true);
    }

    const adminStatus = await checkAdmin(nextSession.user.id);
    if (requestId !== adminCheckRequestRef.current) return;

    if (adminStatus === null) {
      // Keep current role state on transient failures.
      return;
    }

    setIsAdmin(adminStatus);
    localStorage.setItem(cacheKey, adminStatus ? "true" : "false");
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
        clearAuthState();
        setLoading(false);
        return;
      }

      if (!session) {
        clearAuthState();
        setLoading(false);
        return;
      }

      // Never await network/RPC inside this callback — Supabase can stall refresh until it returns.
      queueMicrotask(() => {
        void applySession(session);
      });
    });

    const GET_USER_MS = 10_000;
    const LOADING_FAILSAFE_MS = 12_000;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          clearAuthState();
          return;
        }

        const userRace = await Promise.race([
          supabase.auth.getUser(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), GET_USER_MS)),
        ]);

        if (userRace && !userRace.error && userRace.data.user) {
          await applySession({ ...session, user: userRace.data.user });
        } else {
          // Offline / slow network: keep local session so the app is not stuck on "loading" forever.
          await applySession(session);
        }
      } catch {
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    const failsafe = setTimeout(() => {
      setLoading(false);
    }, LOADING_FAILSAFE_MS);

    void initializeAuth().finally(() => {
      clearTimeout(failsafe);
    });

    return () => {
      clearTimeout(failsafe);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      // Always clear local auth state to prevent "stuck logged-in" UI.
      adminCheckRequestRef.current += 1;
      clearAuthState();
      queryClient.clear();
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.startsWith(ADMIN_CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          sessionStorage.removeItem(key);
        }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
