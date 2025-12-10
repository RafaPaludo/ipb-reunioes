/* 
  Faz a autenticação com o supabase, para poder executar queries no banco,
  pois não temos acesso ao composable:
  import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
*/
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
  { auth: { persistSession: false } }
)
