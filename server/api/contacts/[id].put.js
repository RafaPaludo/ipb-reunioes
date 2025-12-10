import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/*
  Atualiza um contato na tabela **contacts**
*/
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const { data, error } = await client
    .from('contacts')
    .update({
      name: body.name,
      email: body.email,
      phone: body.phone
    })
    .eq('id', id)
    .eq('user_id', user.sub)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return data
})
