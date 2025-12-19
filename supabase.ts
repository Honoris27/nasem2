
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsvlkkphuqmadfpvhzso.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_A3BmmlouI0sgNlURQXJUjw_BQkgnCT9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
