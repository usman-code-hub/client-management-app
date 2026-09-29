import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfiles, type Profile } from "../services/users";

export default function Users() {
  const { session, signOut } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function handleRefresh() {
    setRefreshing(true);
    void load().finally(() => setRefreshing(false));
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#A78BFA]">Team management</p>
        <h2 className="text-3xl font-extrabold text-[#F8FAFC]">Users</h2>
        <p className="mt-2 text-sm text-[#94A3B8]">Everyone who can sign in and be assigned on tasks or projects.</p>
      </header>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-[#242936]/60 bg-[#11141B] px-4 py-2 text-xs font-semibold text-[#C8D0DC] hover:border-[#7c5cff] hover:text-white transition disabled:opacity-50"
        >
          <span className={refreshing ? "animate-spin" : ""}>⟳</span>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-[#94A3B8]">Loading users…</div>
      ) : profiles.length === 0 ? (
        <div className="rounded-2xl border border-[#242936] bg-[#11141B] p-8 text-center text-sm text-[#94A3B8]">
          No users yet. Ask someone to sign up.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <div key={profile.id} className="rounded-2xl border border-[#242936]/70 bg-[#11141B] p-5 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.35)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-purple-500/20">
                    {profile.display_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="font-semibold text-[#F8FAFC] text-sm">{profile.display_name || profile.email?.split("@")[0] || "Unknown"}</div>
                    <div className="text-xs text-[#94A3B8] truncate max-w-[200px]">{profile.email}</div>
                  </div>
                </div>
                <span className="rounded-full bg-[#1F2937] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#C8D0DC] border border-[#242936]/50">
                  {profile.status || "active"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {session.user && (
        <div className="rounded-2xl border border-[#242936]/70 bg-[#11141B] p-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#94A3B8] mb-3">Signed-in user</h3>
          <div className="flex items-center gap-4 rounded-xl border border-[#242936]/50 bg-[#0b0e14] p-4">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#C4B5FD] to-[#8B5CF6] flex items-center justify-center text-sm font-bold text-[#08090D] shadow-lg">
              {(session.profile?.display_name?.[0] || session.profile?.email?.[0] || session.user.email?.[0] || "?").toUpperCase()}
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
  );
}
