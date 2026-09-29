import { supabase } from "../lib/supabase";
export async function getFixes() { const r = await supabase.from("fixes").select("*").order("created_at", {ascending:false}); return r.data || []; }
export async function createFix(obj:any) { return supabase.from("fixes").insert(obj).select(); }
export async function updateFix(id:string, obj:any) { return supabase.from("fixes").update(obj).eq("id", id).select(); }
export async function deleteFix(id:string) { return supabase.from("fixes").delete().eq("id", id); }
