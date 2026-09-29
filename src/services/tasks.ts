import { supabase } from "../lib/supabase";
export async function getTasks() { const r = await supabase.from("tasks").select("*").order("created_at", {ascending:false}); return r.data || []; }
export async function createTask(obj:any) { return supabase.from("tasks").insert(obj).select(); }
