import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getMeetingAtTimeController } from '../../controllers/meeting.controller'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const query = getQuery(event)
  const { startUTC, endUTC } = query

  if (!startUTC || !endUTC) {
    throw createError({
      statusCode: 400,
      statusMessage: 'startUTC e endUTC são obrigatórios'
    })
  }
  
  const supabase = await serverSupabaseClient(event)

  return getMeetingAtTimeController({
    userId: user.sub,
    startUTC,
    endUTC,
    supabase,
  })
})
