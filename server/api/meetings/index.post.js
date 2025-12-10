import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import convertUCalendarDate from '../../utils/convertUCalendarDate'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const body = await readBody(event)
  const client = await serverSupabaseClient(event)

  // Converte datas
  const start_time = convertUCalendarDate(body.date, body.start_time)
  const end_time = convertUCalendarDate(body.date, body.end_time)

  // 1️⃣ Inserir reunião
  const { data: meeting, error: meetingError } = await client
    .from('meetings')
    .insert({
      start_time,
      end_time,
      title: body.title,
      location: body.location,
      meeting_url: body.meeting_url,
      meeting_type: body.meeting_type,
      created_by: user.sub
    })
    .select()
    .single()

  if (meetingError) {
    throw createError({
      statusCode: 400,
      statusMessage: meetingError.message
    })
  }

  // Função para deletar reunião em caso de erro posterior
  const rollbackMeeting = async () => {
    if (meeting?.id) {
      await client.from('meetings').delete().eq('id', meeting.id)
    }
  }

  // 2️⃣ Inserir agendas
  if (body.agendas?.length && meeting.id) {
    const { error: agendaError } = await client
      .from('meeting_agendas')
      .insert(
        body.agendas.map((p) => ({
          title: p.title,
          meeting_id: meeting.id
        }))
      )

    if (agendaError) {
      await rollbackMeeting()
      throw createError({
        statusCode: 400,
        statusMessage: agendaError.message
      })
    }
  }

  // 3️⃣ Inserir participantes
  if (body.participants?.length && meeting.id) {
    // Filtra contatos válidos (não duplicar o usuário atual)
    const filteredParticipants = body.participants?.filter(
      (p) => p.id !== user.sub
    ) || []

    // Prepara array completo de participantes
    const allParticipants = [
      ...filteredParticipants.map((p) => ({
        contact_id: p.id,
        meeting_id: meeting.id
      })),
      {
        user_id: user.sub,
        meeting_id: meeting.id
      }
    ]

    const { error: participantError } = await client
      .from('meeting_participants')
      .insert(allParticipants)

    if (participantError) {
      await rollbackMeeting()
      throw createError({
        statusCode: 400,
        statusMessage: participantError.message
      })
    }
  } else if (meeting.id) {
    // Caso não haja participantes extras, pelo menos adiciona o usuário
    const { error: participantError } = await client
      .from('meeting_participants')
      .insert({
        user_id: user.sub,
        meeting_id: meeting.id
      })

    if (participantError) {
      await rollbackMeeting()
      throw createError({
        statusCode: 400,
        statusMessage: participantError.message
      })
    }
  }

  // 4️⃣ Inserir reminders (badaladas)
  if (meeting.id) {
    const remindersToInsert = [
      {
        meeting_id: meeting.id,
        remind_at: new Date(new Date().getTime() + 5 * 60 * 1000), // agora (ou poucos minutos à frente)
        reminder_type: 'whatsapp',
        reminder_status: 'pending',
        reminder_stage: 'first'
      },
      {
        meeting_id: meeting.id,
        remind_at: new Date(new Date(start_time).getTime() - 72 * 60 * 60 * 1000), // 1 dia antes
        reminder_type: 'whatsapp',
        reminder_status: 'pending',
        reminder_stage: 'second'
      },
      {
        meeting_id: meeting.id,
        remind_at: new Date(new Date(start_time).getTime() - 60 * 60 * 1000), // 1 hora antes
        reminder_type: 'whatsapp',
        reminder_status: 'pending',
        reminder_stage: 'third'
      }
    ]

    const { error: reminderError } = await client
      .from('reminders')
      .insert(remindersToInsert)

    if (reminderError) {
      await rollbackMeeting()
      throw createError({
        statusCode: 400,
        statusMessage: reminderError.message
      })
    }
  }

  return { meeting }
})