import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { updateAgendaController } from '../../controllers/agenda.controller'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado.' })
  }

  const agendaId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const supabase = await serverSupabaseClient(event)

  return updateAgendaController({
    agendaId,
    payload: body,
    userId: user.sub,
    supabase
  })
})
