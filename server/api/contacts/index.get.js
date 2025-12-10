import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/*
  Faz a listagem dos contatos da tabela **contacts**
*/
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const { data, error } = await client
    .from('contacts')
    .select('*')
    .eq('user_id', user.sub) // 🔒 só contatos do usuário logado

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return data
})
