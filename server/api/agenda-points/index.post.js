import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  const { agenda_id, content, participant_id, status, order_index, due_date } = body

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado.' })
  }

  if (!agenda_id || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'agenda_id e content são obrigatórios.'
    })
  }

  // 1️⃣ Validar se a agenda pertence a uma reunião do usuário
  const { data: agenda, error: agendaError } = await client
    .from('meeting_agendas')
    .select('id, meeting_id')
    .eq('id', agenda_id)
    .single()

  if (agendaError || !agenda) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Agenda não encontrada.'
    })
  }

  // 2️⃣ Validar se a reunião pertence ao usuário
  const { data: meeting, error: meetingError } = await client
    .from('meetings')
    .select('id')
    .eq('id', agenda.meeting_id)
    .eq('created_by', user.sub)
    .single()

  if (meetingError || !meeting) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Você não tem permissão para alterar esta agenda.'
    })
  }

  // 3️⃣ Criar o encaminhamento
  const { data: point, error: pointError } = await client
    .from('agenda_points')
    .insert({
      agenda_id,
      content,
      participant_id: participant_id || null,
      status: status || 'pending',
      order_index: order_index ?? 0,
      due_date,
    })
    .select()
    .single()

  if (pointError) {
    throw createError({
      statusCode: 400,
      statusMessage: pointError.message
    })
  }

  return point
})
