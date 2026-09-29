import { supabase } from "../lib/supabase";
export async function getRequirements() { const r = await supabase.from("requirements").select("*").order("created_at", {ascending:false}); return r.data || []; }
export async function createRequirement(obj:any) { return supabase.from("requirements").insert(obj).select(); }
export async function updateRequirement(id:string|undefined, obj:any) { return supabase.from("requirements").update(obj).eq("id", id); }
export async function deleteRequirement(id:string) { return supabase.from("requirements").delete().eq("id", id); }
