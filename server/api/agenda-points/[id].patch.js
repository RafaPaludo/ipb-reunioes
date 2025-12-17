import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const agendaPointId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { agenda_id, content, participant_id, status, order_index, due_date } = body

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado.' })
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

  // 3️⃣ Campos permitidos para update
  const allowedFields = [
    'content',
    'status',
    'participant_id',
    'order_index',
    'due_date',
  ]
  const payload = {}

  for (const field of allowedFields) {
    if (field in body) payload[field] = body[field]
  }

  if (Object.keys(payload).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum campo válido enviado.' })
  }

  // 4️⃣ Atualizar o encaminhamento
  const { data: updatedPoint, error: updateError } = await client
    .from('agenda_points')
    .update(payload)
    .eq('id', agendaPointId)
    .select()
    .single()

  if (updateError) {
    throw createError({ statusCode: 400, statusMessage: updateError.message })
  }

  return updatedPoint
})
