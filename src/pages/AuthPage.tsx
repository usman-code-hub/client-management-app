import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const { signIn, signUp, session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ email: "", password: "", displayName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const result = await signIn(form.email, form.password);
        if (result.error) setError(result.error);
        else window.location.href = "/dashboard";
      } else {
        if (form.password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        const result = await signUp(form.email, form.password, form.displayName || undefined);
        if (result.error) setError(result.error);
        else if (result.user) setSuccess("Account created. You can now sign in.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    setSuccess("");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        scopes: "email,profile,openid",
      },
    });
    setGoogleLoading(false);
    if (error) {
      setError(error.message);
    } else if (data?.url) {
      window.location.href = data.url;
    }
  };

  if (session.user && mode === "signin") {
    return (
      <div className="min-h-screen bg-[#08090D] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="text-[#8B5CF6] text-4xl font-extrabold tracking-tight">✓</div>
          <h1 className="text-xl font-extrabold text-[#F8FAFC]">Signed in successfully</h1>
          <p className="text-sm text-[#94A3B8]">Redirecting you to the dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090D] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-150 h-150 rounded-full bg-[#8B5CF6]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-125 h-125 rounded-full bg-[#6366F1]/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#242936]/60 bg-[#11141B] px-4 py-3">
            <span className="text-[#8B5CF6]">◈</span>
            <span className="text-sm font-extrabold text-[#F8FAFC]">CLIENT COMMAND</span>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-[#F8FAFC] tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {mode === "signin" ? "Sign in to continue to your workspace." : "Set up your account to manage clients, projects, and tasks."}
          </p>
        </div>

        {error && <div className="rounded-xl bg-[#7F1D1D]/30 border border-[#7F1D1D]/40 px-4 py-3 text-sm text-[#FCA5A5]">{error}</div>}
        {success && <div className="rounded-xl bg-[#14532D]/30 border border-[#14532D]/40 px-4 py-3 text-sm text-[#86EFAC]">{success}</div>}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full rounded-xl border border-[#242936] bg-[#11141B] px-4 py-3 flex items-center justify-center gap-3 text-sm font-semibold text-[#F8FAFC] hover:border-[#7c5cff] hover:bg-[#151923] transition disabled:opacity-50 disabled:cursor-wait shadow-[0_4px_14px_-6px_rgba(139,92,246,0.25)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Connecting to Google…" : "Continue with Google"}
          </button>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#242936] -translate-y-1/2" />
          <div className="flex justify-center gap-4 pt-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">or</span>
          </div>
        </div>

        <form onSubmit={handleEmail} className="rounded-2xl border border-[#242936]/70 bg-[#11141B] p-6 space-y-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)]">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#C8D0DC]">
                {mode === "signup" ? "Display Name" : "Email"}
              </label>
              <input
                className="w-full rounded-xl border border-[#292e39] bg-[#0b0e14] px-3.5 py-3 text-sm text-[#F5F7FB] outline-none transition focus:border-[#7957ff] focus:ring-4 focus:ring-[#7957ff]/10"
                type={mode === "signup" && !form.email ? "text" : "email"}
                value={mode === "signup" ? form.displayName : form.email}
                onChange={(e) => setForm((f) => (mode === "signup" ? { ...f, displayName: e.target.value } : { ...f, email: e.target.value }))}
                placeholder={mode === "signup" ? "Usman" : "you@example.com"}
                required
              />
            </div>
            {mode === "signup" && (
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#C8D0DC]">Email</label>
                <input
                  className="w-full rounded-xl border border-[#292e39] bg-[#0b0e14] px-3.5 py-3 text-sm text-[#F5F7FB] outline-none transition focus:border-[#7957ff] focus:ring-4 focus:ring-[#7957ff]/10"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                />
              </div>
            )}
          </div>
          <div className="col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#C8D0DC]">Password</label>
            <input
              className="w-full rounded-xl border border-[#292e39] bg-[#0b0e14] px-3.5 py-3 text-sm text-[#F5F7FB] outline-none transition focus:border-[#7957ff] focus:ring-4 focus:ring-[#7957ff]/10"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder={mode === "signup" ? "Min 6 characters" : "••••••••"}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-linear-to-br from-[#6d4aff] to-[#925cff] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 disabled:cursor-wait disabled:opacity-60 transition hover:scale-[1.02]"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <p className="text-center text-xs text-[#94A3B8]">
            {mode === "signin" ? "No account yet? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setSuccess(""); }}
              className="text-[#C4B5FD] hover:text-white transition font-medium"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
