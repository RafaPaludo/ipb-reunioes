import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/*
  Cria um novo contato na tabela **contacts**
*/
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const { data: contacts, error } = await client
    .from('contacts')
    .insert({
      name: body.name,
      email: body.email,
      phone: body.phone,
      user_id: user.sub
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return { contacts }
})