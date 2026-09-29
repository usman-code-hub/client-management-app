import { supabase } from '../lib/supabase';
export const getEnhancements = async () => (await supabase.from('enhancements').select('*')).data || [];
export const createEnhancement = (obj:any) => supabase.from('enhancements').insert(obj).select();
export const updateEnhancement = (id:number|undefined, obj:any) => supabase.from('enhancements').update(obj).eq('id',id);
