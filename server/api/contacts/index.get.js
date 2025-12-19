import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getAllContactsByUserController } from '../../controllers/contact.controller'

/*
  Faz a listagem dos contatos da tabela **contacts**
*/
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }
  
  const supabase = await serverSupabaseClient(event)

  return getAllContactsByUserController({
    userId: user.sub,
    supabase,
  })
})
