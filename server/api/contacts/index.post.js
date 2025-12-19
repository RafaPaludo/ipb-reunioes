import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { insertContactController } from '../../controllers/contact.controller.js'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const body = await readBody(event)
  const supabase = await serverSupabaseClient(event)

  return insertContactController({
    payload: body,
    supabase,
    userId: user.sub,
  })
})