import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { upsertProfile } from "../services/users";

type UserSession = {
  user: { id: string; email?: string; aud?: string } | null;
  profile: Awaited<ReturnType<typeof upsertProfile>> | null;
  loading: boolean;
};

const AuthContext = createContext<{
  session: UserSession;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: string; user?: { id: string; email?: string }; confirmationRequired?: boolean }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession>({ user: null, profile: null, loading: true });

  const fetchSession = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (s?.user) {
      setSession({ user: s.user, profile: null, loading: true });
      try {
        let profile: Awaited<ReturnType<typeof upsertProfile>> | null = await supabase.from("profiles").select("id, email, display_name, photo_url, status, created_at").eq("id", s.user.id).single().then((r) => (r.error ? null : (r.data || null)));
        if (!profile) {
          const { error: upErr } = await supabase.from("profiles").insert({ id: s.user.id, email: s.user.email || "", display_name: s.user.email?.split("@")[0] || "" }).select().single();
          if (!upErr) {
            profile = await supabase.from("profiles").select("id, email, display_name, photo_url, status, created_at").eq("id", s.user.id).single().then((r) => (r.error ? null : (r.data || null)));
          }
        }
        if (!profile) {
          const displayName = s.user.user_metadata?.display_name || s.user.email?.split("@")[0] || "";
          profile = await upsertProfile(s.user.id, { email: s.user.email || "", display_name: displayName, status: "active" });
        }
        setSession({ user: s.user, profile, loading: false });
      } catch {
        setSession({ user: s.user, profile: null, loading: false });
      }
    } else {
      setSession({ user: null, profile: null, loading: false });
    }
  }, []);

  useEffect(() => {
    fetchSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => void fetchSession());
    return () => subscription.unsubscribe();
  }, [fetchSession]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || email.split("@")[0] } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      try {
        await upsertProfile(data.user.id, { email, display_name: data.user.user_metadata?.display_name || displayName || email.split("@")[0], status: "active" });
      } catch {
        // profile may already exist; ignore
      }
      return { user: { id: data.user.id, email: data.user.email }, confirmationRequired: !data.session };
    }
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession({ user: null, profile: null, loading: false });
  };

  const refreshSession = async () => {
    await fetchSession();
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        scopes: "email,profile,openid",
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  return (
    <AuthContext.Provider value={{ session, signIn, signUp, signInWithGoogle, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
