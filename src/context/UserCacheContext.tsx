import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabase";

export type User = {
  id: string;
  email: string;
  display_name?: string;
  photo_url?: string;
};

type UserCache = {
  users: User[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const UserCacheContext = createContext<UserCache | null>(null);

export function UserCacheProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, display_name, photo_url")
        .order("created_at", { ascending: false });
      if (!error && data) setUsers(data as User[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => void fetchUsers());
    return () => subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    setLoading(true);
    await fetchUsers();
  };

  return (
    <UserCacheContext.Provider value={{ users, loading, refresh }}>
      {children}
    </UserCacheContext.Provider>
  );
}

export function useUserCache() {
  const ctx = useContext(UserCacheContext);
  if (!ctx) throw new Error("useUserCache must be used inside UserCacheProvider");
  return ctx;
}
