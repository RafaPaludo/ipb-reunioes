import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { updateMeetingStatusController } from '../../../controllers/meeting.controller'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado.' })
  }

  const supabase = await serverSupabaseClient(event)
  const body = await readBody(event)
  const meetingId = getRouterParam(event, 'id')

  return updateMeetingStatusController({
    userId: user.sub,
    payload: body,
    meetingId,
    supabase,
  })
})