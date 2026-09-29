import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  deleteManagedUser,
  getManagedUsers,
  inviteManagedUser,
  updateManagedUser,
  type ManagedUser,
} from "../services/users";

export default function Settings() {
  const { session, signOut } = useAuth();
  const [dark, setDark] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userError, setUserError] = useState("");
  const [userNotice, setUserNotice] = useState("");
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  async function loadUsers() {
    setUsersLoading(true);
    setUserError("");
    try {
      setUsers(await getManagedUsers());
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "Could not load users.");
    } finally {
      setUsersLoading(false);
    }
  }

  useEffect(() => { void loadUsers(); }, []);

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const displayName = String(form.get("display_name") || "").trim();
    setSavingUser(true);
    setUserError("");
    setUserNotice("");
    try {
      if (editingUser) {
        await updateManagedUser(editingUser.id, email, displayName);
        setUserNotice("User updated.");
      } else {
        await inviteManagedUser(email, displayName);
        setUserNotice("Invitation sent.");
      }
      setFormOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "Could not save user.");
    } finally {
      setSavingUser(false);
    }
  }

  async function removeUser(user: ManagedUser) {
    if (user.id === session.user?.id) return;
    if (!window.confirm(`Delete ${user.email}? They will no longer be able to sign in.`)) return;
    setDeletingUserId(user.id);
    setUserError("");
    setUserNotice("");
    try {
      await deleteManagedUser(user.id);
      setUserNotice("User deleted.");
      await loadUsers();
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "Could not delete user.");
    } finally {
      setDeletingUserId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#A78BFA]">Application</p>
        <h2 className="text-3xl font-extrabold text-[#F8FAFC]">Settings</h2>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#F8FAFC]">User management</h3>
            <p className="mt-1 text-sm text-[#94A3B8]">Invite, update, or remove sign-in accounts.</p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingUser(null); setFormOpen(true); setUserError(""); setUserNotice(""); }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7C3AED]"
          >
            <Plus size={16} /> Add user
          </button>
        </div>

        {formOpen && (
          <form onSubmit={saveUser} className="grid gap-4 rounded-xl border border-[#242936]/70 bg-[#11141B] p-5 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[#C8D0DC]">
              Email
              <input name="email" type="email" required defaultValue={editingUser?.email || ""} className="mt-2 w-full rounded-lg border border-[#292E39] bg-[#0B0E14] px-3 py-2.5 text-sm text-white outline-none focus:border-[#8B5CF6]" />
            </label>
            <label className="text-xs font-semibold text-[#C8D0DC]">
              Display name
              <input name="display_name" required defaultValue={editingUser?.display_name || ""} className="mt-2 w-full rounded-lg border border-[#292E39] bg-[#0B0E14] px-3 py-2.5 text-sm text-white outline-none focus:border-[#8B5CF6]" />
            </label>
            {editingUser && <p className="text-xs text-[#94A3B8] sm:col-span-2">The user may need to confirm an email address change.</p>}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={() => { setFormOpen(false); setEditingUser(null); }} className="inline-flex items-center gap-2 rounded-lg border border-[#374151] px-3 py-2 text-sm text-[#C8D0DC] hover:bg-[#1F2937]"><X size={15} /> Cancel</button>
              <button type="submit" disabled={savingUser} className="rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{savingUser ? "Saving..." : editingUser ? "Save changes" : "Send invitation"}</button>
            </div>
          </form>
        )}

        {userError && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">{userError}</p>}
        {userNotice && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">{userNotice}</p>}

        <div className="overflow-hidden rounded-xl border border-[#242936]/70 bg-[#11141B]">
          {usersLoading ? (
            <p className="p-5 text-sm text-[#94A3B8]">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="p-5 text-sm text-[#94A3B8]">No users found.</p>
          ) : (
            <div className="divide-y divide-[#242936]/70">
              {users.map((user) => (
                <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#F8FAFC]">{user.display_name || user.email}</p>
                    <p className="truncate text-xs text-[#94A3B8]">{user.email} · {user.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" title="Edit user" aria-label={`Edit ${user.email}`} onClick={() => { setEditingUser(user); setFormOpen(true); setUserError(""); setUserNotice(""); }} className="rounded-lg border border-[#374151] p-2 text-[#C8D0DC] hover:bg-[#1F2937]"><Pencil size={15} /></button>
                    <button type="button" title="Delete user" aria-label={`Delete ${user.email}`} disabled={user.id === session.user?.id || deletingUserId === user.id} onClick={() => { void removeUser(user); }} className="rounded-lg border border-[#7F1D1D]/50 p-2 text-red-300 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="space-y-4">
        <div className="rounded-2xl border border-[#242936]/60 bg-gradient-to-br from-[#11141B] to-[#0f1118] p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]">
          <h3 className="text-sm font-bold text-[#F8FAFC] mb-4">App Configuration</h3>
          <div className="space-y-3 text-xs text-[#C8D0DC]">
            <label className="flex items-center gap-3">
              <span>Dark Theme</span>
              <button
                onClick={() => setDark(!dark)}
                className={`w-10 h-5 rounded-full ${dark ? "bg-[#8B5CF6]" : "bg-[#242936]"}`}
              >
                <span className={`block w-3 h-3 rounded-full bg-white transition-transform ${dark ? "translate-x-5" : ""}`} />
              </button>
            </label>
            <label className="flex items-center gap-3">
              <span>Notifications</span>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-10 h-5 rounded-full ${notifications ? "bg-[#8B5CF6]" : "bg-[#242936]"}`}
              >
                <span className={`block w-3 h-3 rounded-full bg-white transition-transform ${notifications ? "translate-x-5" : ""}`} />
              </button>
            </label>
            <p className="text-[#64748B]">DB: Supabase PostgreSQL · Auth: Active</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#242936]/60 bg-gradient-to-br from-[#11141B] to-[#0f1118] p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]">
          <h3 className="text-sm font-bold text-[#F8FAFC] mb-3">System Info</h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-[#C8D0DC]">
            <div>Backend: <span className="text-[#F8FAFC]">Supabase PostgreSQL</span></div>
            <div>Mode: Auth-enabled</div>
          </div>
        </div>

        {session.user && (
          <div className="rounded-2xl border border-[#242936]/60 bg-gradient-to-br from-[#11141B] to-[#0f1118] p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]">
            <h3 className="text-sm font-bold text-[#F8FAFC] mb-3">Signed-in User</h3>
            <div className="flex items-center gap-4 rounded-xl border border-[#242936]/50 bg-[#0b0e14] p-4">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#C4B5FD] to-[#8B5CF6] flex items-center justify-center text-sm font-bold text-[#08090D] shadow-lg">
                {(session.profile?.display_name?.[0] || session.user.email?.[0] || "?").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#F8FAFC] truncate">{session.profile?.display_name || session.user.email?.split("@")[0] || "User"}</div>
                <div className="text-xs text-[#94A3B8] truncate">{session.user.email}</div>
              </div>
              <button
                onClick={() => { void signOut().then(() => { window.location.href = "/login"; }); }}
                className="rounded-xl border border-[#374151] bg-[#11141B] px-4 py-2 text-xs font-semibold text-[#E5E7EB] hover:bg-[#1F2937] transition"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
