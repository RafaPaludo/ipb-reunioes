import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getPDFMeetingController } from '../../../controllers/meeting.controller'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const supabase = await serverSupabaseClient(event)
  const meetingId = getRouterParam(event, 'id')

  return getPDFMeetingController({
    userId: user.sub,
    meetingId,
    supabase,
  })
});
