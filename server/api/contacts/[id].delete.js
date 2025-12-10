import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID inválido'
    })
  }

  const { error } = await client
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.sub) // garante que só deleta contatos do usuário atual

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
