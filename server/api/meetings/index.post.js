import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createMeetingWithSetupController } from '../../controllers/meeting.controller'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const body = await readBody(event)
  const supabase = await serverSupabaseClient(event)

  return createMeetingWithSetupController({
    payload: body,
    userId: user.sub,
    supabase,
  })
})