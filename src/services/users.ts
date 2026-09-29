import { supabase } from "../lib/supabase";

export type Profile = {
  id: string;
  email: string;
  display_name?: string;
  photo_url?: string;
  status?: string;
  created_at?: string;
};

export type ManagedUser = {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  status: string;
};

async function manageUsers<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("manage-users", { body });
  if (error) {
    const context = "context" in error ? error.context : undefined;
    if (context instanceof Response) {
      const responseBody: unknown = await context.clone().json().catch(() => null);
      if (responseBody && typeof responseBody === "object") {
        const detail = "message" in responseBody && typeof responseBody.message === "string"
          ? responseBody.message
          : "error" in responseBody && typeof responseBody.error === "string"
            ? responseBody.error
            : null;
        if (detail) throw new Error(detail);
      }
    }
    if (error.name === "FunctionsFetchError") {
      throw new Error("Cannot reach the manage-users Edge Function. Deploy it to this Supabase project and check its CORS settings.");
    }
    throw new Error(error.message);
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export async function getManagedUsers() {
  const result = await manageUsers<{ users: ManagedUser[] }>({ action: "list" });
  return result.users;
}

export async function inviteManagedUser(email: string, displayName: string) {
  return manageUsers<{ user: ManagedUser }>({ action: "invite", email, display_name: displayName });
}

export async function updateManagedUser(id: string, email: string, displayName: string) {
  return manageUsers<{ user: ManagedUser }>({ action: "update", id, email, display_name: displayName });
}

export async function deleteManagedUser(id: string) {
  return manageUsers<{ success: boolean }>({ action: "delete", id });
}

export async function getProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, photo_url, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Profile[];
}

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, photo_url, status, created_at")
    .eq("id", id)
    .single();
  if (error) throw error;
  return (data || null) as Profile | null;
}

export async function upsertProfile(id: string, obj: Partial<Profile>) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id, ...obj }, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}
