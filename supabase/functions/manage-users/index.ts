import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected server error.";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return jsonResponse({ error: "Sign in is required." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmails = (Deno.env.get("ADMIN_EMAILS") || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!supabaseUrl || !anonKey || !serviceRoleKey || adminEmails.length === 0) {
    return jsonResponse({ error: "User management is not configured on the server." }, 500);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) return jsonResponse({ error: "Your session is invalid or expired." }, 401);
  if (!authData.user.email || !adminEmails.includes(authData.user.email.toLowerCase())) {
    return jsonResponse({ error: "Only configured administrators can manage users." }, 403);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = await request.json();
    const action = body?.action;

    if (action === "list") {
      const authUsers = [];
      for (let page = 1; ; page += 1) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
        if (error) throw error;
        authUsers.push(...data.users);
        if (data.users.length < 100) break;
      }

      return jsonResponse({
        users: authUsers.map((user) => ({
          id: user.id,
          email: user.email || "",
          display_name: String(user.user_metadata?.display_name || ""),
          created_at: user.created_at,
          status: user.email_confirmed_at ? "active" : "invited",
        })),
      });
    }

    if (action === "invite") {
      const email = String(body.email || "").trim().toLowerCase();
      const displayName = String(body.display_name || "").trim();
      if (!email || !displayName) return jsonResponse({ error: "Email and display name are required." }, 400);
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { display_name: displayName },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Supabase did not return the invited user.");

      const { error: profileError } = await admin.from("profiles").upsert({
        id: data.user.id,
        email,
        display_name: displayName,
        status: "active",
      }, { onConflict: "id" });
      if (profileError) console.error("Could not sync invited user profile:", profileError.message);

      return jsonResponse({ user: {
        id: data.user.id,
        email,
        display_name: displayName,
        created_at: data.user.created_at,
        status: "invited",
      } });
    }

    if (action === "update") {
      const id = String(body.id || "");
      const email = String(body.email || "").trim().toLowerCase();
      const displayName = String(body.display_name || "").trim();
      if (!id || !email || !displayName) return jsonResponse({ error: "User ID, email, and display name are required." }, 400);

      const { data: existing, error: existingError } = await admin.auth.admin.getUserById(id);
      if (existingError) throw existingError;
      const { data, error } = await admin.auth.admin.updateUserById(id, {
        email,
        user_metadata: { ...existing.user.user_metadata, display_name: displayName },
      });
      if (error) throw error;

      const { error: profileError } = await admin.from("profiles").upsert({
        id,
        email,
        display_name: displayName,
        status: "active",
      }, { onConflict: "id" });
      if (profileError) console.error("Could not sync updated user profile:", profileError.message);

      return jsonResponse({ user: {
        id: data.user.id,
        email: data.user.email || email,
        display_name: displayName,
        created_at: data.user.created_at,
        status: data.user.email_confirmed_at ? "active" : "invited",
      } });
    }

    if (action === "delete") {
      const id = String(body.id || "");
      if (!id) return jsonResponse({ error: "User ID is required." }, 400);
      if (id === authData.user.id) return jsonResponse({ error: "You cannot delete your own account here." }, 400);
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Unsupported user-management action." }, 400);
  } catch (error) {
    console.error("User management request failed:", messageOf(error));
    return jsonResponse({ error: messageOf(error) }, 400);
  }
});