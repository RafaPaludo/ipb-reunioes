import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { deleteAgendaPointByIdController } from '../../controllers/agenda-points.controller'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const agendaPointId = getRouterParam(event, 'id')
  const supabase = await serverSupabaseClient(event)

  return deleteAgendaPointByIdController({
    agendaPointId: agendaPointId,
    userId: user.sub,
    supabase,
  })
})
