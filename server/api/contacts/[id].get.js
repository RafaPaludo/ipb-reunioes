import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getContactByUserController } from '../../controllers/contact.controller'

/*
  Faz a listagem de um único contato da tabela **contacts**
*/
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }
  
  const supabase = await serverSupabaseClient(event)
  const contactId = getRouterParam(event, 'id')
  
  return getContactByUserController({
    userId: user.sub,
    contactId,
    supabase,
  })
})
