import { supabase } from '../lib/supabase';
export const getTesting = async () => (await supabase.from('test_cases').select('*')).data || [];
export const createTestCase = (obj:any) => supabase.from('test_cases').insert(obj).select();
export const updateTestCase = (id:number|undefined, obj:any) => supabase.from('test_cases').update(obj).eq('id',id);
