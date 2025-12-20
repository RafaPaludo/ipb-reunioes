import {
  insertMeeting,
  deleteMeetingById,
  findMeetingByTimeRange,
} from '../../repositories/meeting.repository'
import { insertAgendas } from '../../repositories/agenda.repository'
import { insertParticipants } from '../../repositories/participant.repository'
import { insertReminders } from '../../repositories/reminder.repository'

import convertUCalendarDate from '../../utils/convertUCalendarDate'

export async function createMeetingWithSetupService({ payload, userId, supabase }) {
  const { title, location, meeting_url, meeting_type, date, start_time, end_time, agendas = [], participants = [] } = payload

  if (!title || !date || !start_time || !end_time) {
    throw new Error('INVALID_PAYLOAD')
  }

  // Converte datas do objeto UCalendar para timestamptz
  const startTime = convertUCalendarDate(date, start_time)
  const endTime = convertUCalendarDate(date, end_time)

  let meeting

  try {
    // 1. Meeting
    meeting = await insertMeeting(
      {
        title,
        location,
        meeting_type,
        meeting_url,
        start_time: startTime,
        end_time: endTime,
        created_by: userId,
      },
      supabase
    )

    // 2. Agendas
    if (agendas.length) {
      await insertAgendas(
        agendas.map(agenda => ({
          title: agenda.title,
          meeting_id: meeting.id
        })),
        supabase
      )
    }

    // 3.Partucipantes (sempre inclui o usuário)
    const filterd = participants.filter(participant => participant.id !== userId)

    await insertParticipants(
      [
        ...filterd.map(participant => ({
          contact_id: participant.id,
          meeting_id: meeting.id,
        })),
        {
          user_id: userId,
          meeting_id: meeting.id,
        }
      ],
      supabase
    )

    // 4. Lembretes
    const reminders = buildMeetingReminders(meeting.id, startTime)
    await insertReminders(reminders, supabase)

    return meeting
  } catch (error) {
    // 🔥 rollback centralizado
    if (meeting?.id) {
      await deleteMeetingById(meeting.id, supabase)
    }
    throw error
  }
}

function buildMeetingReminders(meetingId, startTime) {
  const ONE_MINUTE_IN_SECONDS = 60 * 1000
  const ONE_DAY_IN_SECONDS = 72 * 60 * ONE_MINUTE_IN_SECONDS

  return [
    {
      meeting_id: meetingId,
      remind_at: new Date(Date.now() + 5 * ONE_MINUTE_IN_SECONDS), // agora (ou poucos minutos à frente)
      reminder_type: 'whatsapp',
      reminder_status: 'pending',
      reminder_stage: 'first',
    },
    {
      meeting_id: meetingId,
      remind_at: new Date(new Date(startTime).getTime() - ONE_DAY_IN_SECONDS), // 1 dia antes
      reminder_type: 'whatsapp',
      reminder_status: 'pending',
      reminder_stage: 'second',
    },
    {
      meeting_id: meetingId,
      remind_at: new Date(new Date(startTime).getTime() - 60 * ONE_MINUTE_IN_SECONDS), // 1 hora antes
      reminder_type: 'whatsapp',
      reminder_status: 'pending',
      reminder_stage: 'third',
    },
  ]
}

export async function getMeetingAtTimeService({ startUTC, endUTC, userId, supabase}) {
  if (new Date(startUTC) > new Date(endUTC)) {
    throw new Error('INVALID_DATE')
  }

  return await findMeetingByTimeRange(
    {
      userId,
      startUTC,
      endUTC
    },
    supabase
  )
}