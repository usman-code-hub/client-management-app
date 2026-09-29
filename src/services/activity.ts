import { supabase } from '../lib/supabase';
export const getActivity = async () => (await supabase.from('activity_logs').select('*')).data || [];
export const createActivity = (obj:any) => supabase.from('activity_logs').insert(obj).select();
export const updateActivity = (id:number|undefined, obj:any) => supabase.from('activity_logs').update(obj).eq('id',id);
