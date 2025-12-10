import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/*
  Faz a listagem das reuniões tabela **contacts** em um determinado período
*/
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const query = getQuery(event)
  const startUTC = query.startUTC
  const endUTC = query.endUTC

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  if (!startUTC || !endUTC) {
    throw createError({ statusCode: 400, statusMessage: 'startUTC e endUTC são obrigatórios' })
  }

  const { data, error } = await client
    .from('meetings')
    .select('id, title, start_time, location')
    .gte('start_time', startUTC)
    .lte('start_time', endUTC)
    .order('start_time', { ascending: true })
    .eq('created_by', user.sub) // 🔒 só contatos do usuário logado    

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return data
})
