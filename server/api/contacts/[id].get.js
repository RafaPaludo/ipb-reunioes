import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/*
  Faz a listagem de um único contato da tabela **contacts**
*/
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const { data, error } = await client
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.sub)
    .single()

  if (error) {
    throw createError({ statusCode: 404, statusMessage: error.message })
  }

  return data
})
