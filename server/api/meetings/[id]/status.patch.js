import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const body = await readBody(event)
  const user = await serverSupabaseUser(event)
  const meetingId = getRouterParam(event, 'id')

  const { meeting_status } = body
  const allowedTransitions = ['scheduled', 'in_progress', 'paused', 'finished']

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado.' })
  }

  if (!allowedTransitions.includes(meeting_status)) {
    throw createError({
      statusCode: 400,
      message: 'Status inválido'
    })
  }

  const payload = {
    meeting_status: meeting_status,
  }

  if (meeting_status === 'in_progress') {
    payload.started_at = new Date().toISOString()
  }

  if (meeting_status === 'finished') {
    payload.finished_at = new Date().toISOString()
  }

  // 1. Atualizar a Reunião
  const { error: meetingError, data: updatedMeeting } = await client
    .from('meetings')
    .update(payload)
    .eq('id', meetingId)
    .eq('created_by', user.sub)
    .select()
    .single()

  if (meetingError) {
    throw createError({ statusCode: 400, statusMessage: meetingError.message })
  }

  return updatedMeeting
})