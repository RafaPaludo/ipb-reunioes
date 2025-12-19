import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { updateAgendaPointController } from '../../controllers/agenda-points.controller'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado.' })
  }

  const agendaPointId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const supabase = await serverSupabaseClient(event)

  return updateAgendaPointController({
    agendaPointId: agendaPointId,
    payload: body,
    userId: user.sub,
    supabase,
  })
})
