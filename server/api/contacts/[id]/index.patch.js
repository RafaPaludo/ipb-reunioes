import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { updateContactByUserController } from '../../../controllers/contact.controller'

/*
  Atualiza um contato na tabela **contacts**
*/
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const supabase = await serverSupabaseClient(event)
  const contactId = getRouterParam(event, 'id')
  const body = await readBody(event)

  return updateContactByUserController({
    payload: body,
    supabase,
    userId: user.sub,
    contactId,
  })
})
