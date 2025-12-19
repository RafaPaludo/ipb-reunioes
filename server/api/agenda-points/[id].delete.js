import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { deleteAgendaPointById } from '../../controllers/agenda-points.controller'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const agendaPointId = getRouterParam(event, 'id')
  const supabase = await serverSupabaseClient(event)

  return deleteAgendaPointById({
    agendaPointId: agendaPointId,
    userId: user.sub,
    supabase,
  })
})
