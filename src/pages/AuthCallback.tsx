import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      console.error("OAuth error:", error);
      navigate("/login?error=oauth_failed");
      return;
    }

    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard", { replace: true });
      } else {
        const { data: { session: freshSession }, error: freshError } = await supabase.auth.getSession();
        if (freshSession?.user && !freshError) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login?error=session_missing");
        }
      }
    }).catch(() => {
      navigate("/login?error=session_missing");
    });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#08090D] flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="h-10 w-10 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin mx-auto" />
        <h1 className="text-xl font-extrabold text-[#F8FAFC]">Signing you in…</h1>
        <p className="text-sm text-[#94A3B8]">Please wait while we finish connecting your account.</p>
      </div>
    </div>
  );
}
