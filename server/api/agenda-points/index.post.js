import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { insertAgendaPointsController } from '../../controllers/agenda-points.controller.js'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado.' })
  }

  const body = await readBody(event)
  const supabase = await serverSupabaseClient(event)

  // Envia para o controller para criar um encaminhamento
  return insertAgendaPointsController({
    payload: body,
    userId: user.sub,
    supabase
  })
})
