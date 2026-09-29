import { supabase } from "../lib/supabase";
export async function getClients() { const r = await supabase.from("clients").select("*").order("created_at", {ascending:false}); return r.data || []; }
export async function createClient(obj:any) { return supabase.from("clients").insert(obj).select(); }
