import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const agendaId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado.' })
  }

  // 1. Buscar a agenda e identificar a reunião
  const { data: agenda, error: agendaFetchError } = await client
    .from('meeting_agendas')
    .select('id, meeting_id')
    .eq('id', agendaId)
    .single()

  if (agendaFetchError || !agenda) {
    throw createError({ statusCode: 404, statusMessage: 'Agenda não encontrada.' })
  }

  // 2. Verificar se a reunião pertence ao usuário
  const { data: meeting, error: meetingError } = await client
    .from('meetings')
    .select('id')
    .eq('id', agenda.meeting_id)
    .eq('created_by', user.sub) // ajuste conforme sua tabela
    .single()

  if (meetingError || !meeting) {
    throw createError({ statusCode: 403, statusMessage: 'Sem permissão para alterar esta agenda.' })
  }

  // 3. Filtrar campos permitidos
  const allowedFields = ['title', 'content', 'summary', 'order_index']
  const payload = {}

  for (const key of allowedFields) {
    if (key in body) payload[key] = body[key]
  }

  if (Object.keys(payload).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum campo válido enviado.' })
  }

  // 4. Atualizar a agenda
  const { error: updateError } = await client
    .from('meeting_agendas')
    .update(payload)
    .eq('id', agendaId)

  if (updateError) {
    throw createError({ statusCode: 400, statusMessage: updateError.message })
  }

  return { ok: true }
})
