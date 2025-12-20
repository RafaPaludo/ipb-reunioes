import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { deleteContactController } from '../../../controllers/contact.controller'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const contactId = getRouterParam(event, 'id')
  const supabase = await serverSupabaseClient(event)

  return deleteContactController({
    contactId,
    userId: user.sub,
    supabase,
  })
})
