import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const agendaPointId = Number(event.context.params?.id)
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  // 1️⃣ Buscar o encaminhamento e descobrir a agenda
  const { data: point, error: pointError } = await client
    .from('agenda_points')
    .select(`
      id,
      agenda_id,
      meeting_agendas (
        meeting_id
      )
    `)
    .eq('id', agendaPointId)
    .single()

  if (pointError || !point) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Encaminhamento não encontrada.'
    })
  }

  // 2️⃣ Validar se a reunião pertence ao usuário
  const { data: meeting, error: meetingError } = await client
    .from('meetings')
    .select('id')
    .eq('id', point.meeting_agendas.meeting_id)
    .eq('created_by', user.sub)
    .single()

  if (meetingError || !meeting) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Você não tem permissão para alterar este encaminhamento.'
    })
  }

  const { error } = await client
    .from('agenda_points')
    .delete()
    .eq('id', agendaPointId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
