import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
// import convertUCalendarDate from '../../../utils/convertUCalendarDate'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const meetingId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const meeting = body.meeting || {}
  const agendas = meeting.agendas || []
  const participants = body.participants || []

  const start_time = ''
  const end_time = '' 

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado.' })
  }

  // 1. Atualizar a Reunião
  const { error: meetingError } = await client
    .from('meetings')
    .update({
      title: meeting.title,
      location: meeting.location,
      meeting_url: meeting.meeting_url,
      meeting_type: meeting.meeting_type,
      attachment_url: meeting.attachment_url,
      start_time,
      end_time,
    })
    .eq('id', meetingId)
    .eq('created_by', user.sub)
    .select()
    .single()

  if (meetingError) {
    throw createError({ statusCode: 400, statusMessage: meetingError.message })
  }

  // 2. Atualizar agendas
  const incomingAgendaIds = agendas
    .filter(agenda => agenda.id) // só os que já existem
    .map(agenda => agenda.id)

  // 2.1 Buscar agendas atuais da reunião
  const { data: existingAgendas } = await client
    .from('meeting_agendas')
    .select('id')
    .eq('meeting_id', meetingId)

  // 2.2 Descobrir quais agendas precisam ser deletadas
  const agendasToDelete = existingAgendas
    .filter(agenda => !incomingAgendaIds.includes(agenda.id))
    .map(agenda => agenda.id)

  // 2.3 Deletar agendas removidas
  if (agendasToDelete.length > 0) {
    await client
      .from('meeting_agendas')
      .delete()
      .in('id', agendasToDelete)
  }

  // 2.4 UPDATE das agendas que já existem
  for (const agenda of agendas) {
    if (agenda.id) {
      await client
        .from('meeting_agendas')
        .update({
          title: agenda.title,
          order_index: agenda.order_index || 0,
        })
        .eq('id', agenda.id)
    }
  }

  // 2.5 INSERT nas novas
  for (const agenda of agendas) {
    if (!agenda.id) {
      await client
        .from('meeting_agendas')
        .insert({
          meeting_id: meetingId,
          title: agenda.title,
        })
    }
  }

  /*
    TODO::
    
    NÃO PERMITE REMOVER PARTICIPANTES DEPOIS QUE ELES ESTEJAM COM ENCAMINHAMENTOS ASSINADOS
  
  */ 
  
  // 3. Atualizar participants
  await client
    .from('meeting_participants')
    .delete()
    .eq('meeting_id', meetingId)

  if (participants.length > 0) {
    const participantsPayload = participants.map((participant) => ({
      meeting_id: meetingId,
      contact_id: participant.id,
    }))

    const { error: participantsError } = await client
      .from('meeting_participants')
      .insert(participantsPayload)

    if (participantsError) {
      throw createError({ statusCode: 400, statusMessage: participantsError.message })
    }
  }

  return { ok: true }
})