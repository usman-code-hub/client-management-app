import { supabase } from "../lib/supabase";
export async function getProject(id:string) { const r = await supabase.from("projects").select("*").eq("id", id).single(); return r.data; }