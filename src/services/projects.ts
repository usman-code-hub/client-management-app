import { supabase } from "../lib/supabase";
export async function getProjects() { const r = await supabase.from("projects").select("*").order("created_at", {ascending:false}); return r.data || []; }
export async function createProject(obj:any) { return supabase.from("projects").insert(obj).select(); }