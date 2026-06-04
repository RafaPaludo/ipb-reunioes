import {
  insertMeeting,
  deleteMeetingById,
  findMeetingByTimeRange,
  findMeetingByIdWithIncludes,
  updateMeetingById,
} from '../../repositories/meeting.repository'
import { insertAgendas, updateAgenda, findAgendasIdByMeetingId, deleteAgendaById } from '../../repositories/agenda.repository'
import { deleteAgendaPointByAgendaId } from '../../repositories/agenda-points.repository'
import { insertParticipants } from '../../repositories/participant.repository'
import { insertReminders } from '../../repositories/reminder.repository'

import convertUCalendarDate from '../../utils/convertUCalendarDate'
import { parseIncludes } from '../../utils/parse-includes'

import { MEETING_STATUS } from '#shared/constants/meeting-status'

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

export async function getMeetingAtTimeService({ startUTC, endUTC, userId, supabase }) {
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

export async function updateMeetingStatusService({ meetingId, payload, userId, supabase }) {
  const { meeting_status } = payload
  const allowedTransitions = Object.values(MEETING_STATUS).map(meetingStatus => meetingStatus.key)

  if (!allowedTransitions.includes(meeting_status)) {
    throw new Error('INVALID_STATUS')
  }

  const payloadToDB = {
    meeting_status: meeting_status,
  }

  if (meeting_status === MEETING_STATUS.IN_PROGRESS.key) {
    payloadToDB.started_at = new Date().toISOString()
  }

  if (meeting_status === MEETING_STATUS.FINISHED.key) {
    payloadToDB.finished_at = new Date().toISOString()
  }

  return await updateMeetingById(
    {
      payload: payloadToDB,
      meetingId,
      userId
    },
    supabase
  )
}

export async function getMeetingService({ meetingId, query, userId, supabase }) {
  const ALLOWED_INCLUDES = ['participants', 'agendas']

  const includes = parseIncludes(query.include)

  for (const inc of includes) {
    if (!ALLOWED_INCLUDES.includes(inc)) {
      throw new Error('INVALID_INCLUDE')
    }
  }

  const meeting = await findMeetingByIdWithIncludes({
    meetingId,
    userId,
    includes,
    supabase
  })

  if (!meeting) {
    throw new Error('NOT_FOUND')
  }

  // 🔄 Normalização de participantes
  if (includes.includes('participants')) {
    meeting.meeting_participants = normalizeParticipants(meeting.meeting_participants)
  }

  return meeting
}

export async function updateMeetingService({ meetingId, payload, userId, supabase }) {
  const { title, location, meeting_url, meeting_type, date, start_time, end_time, agendas = [], participants = [] } = payload

  if (!title || !date || !start_time || !end_time) {
    throw new Error('INVALID_PAYLOAD')
  }

  // Converte datas do objeto UCalendar para timestamptz
  const startTime = convertUCalendarDate(date, start_time)
  const endTime = convertUCalendarDate(date, end_time)
  const payloadToDB = {
    title,
    location,
    meeting_type,
    meeting_url,
    start_time: startTime,
    end_time: endTime,
  }

  let meeting

  try {
    // Atualiza os dados da reunião
    meeting = await updateMeetingById(
      {
        payload: payloadToDB,
        meetingId,
        userId
      },
      supabase
    )

    /*
      * Remove as agendas e agenda_points excluídas
      * Atualiza as agendas existentes
      * Cria novas agendas
    */
    const currentAgendasIds = await findAgendasIdByMeetingId(meetingId, supabase)
    const incomingAgendasIds = new Set(agendas.filter(agenda => agenda.id).map(agenda => agenda.id))
    const agendasToRemove = currentAgendasIds.filter(agenda => !incomingAgendasIds.has(agenda.id))

    for (const agenda of agendasToRemove) {
      await deleteAgendaPointByAgendaId(agenda.id, supabase)
      await deleteAgendaById(agenda.id, supabase)
    }

    for (let i = 0, j = agendas.length; i < j; i++) {
      const currentAgenda = agendas[i];
      
      // Atualiza as agendas existentes
      if (currentAgenda.id) {
        await updateAgenda(
          currentAgenda.id,
          { title: currentAgenda.title, meeting_id: meetingId },
          supabase,
        )
      } else {
        // Cria agendas novas
        await insertAgendas({ title: currentAgenda.title, meeting_id: meeting.id }, supabase)
      }
    }

    // // 3.Partucipantes (sempre inclui o usuário)
    // const filterd = participants.filter(participant => participant.id !== userId)

    // await insertParticipants(
    //   [
    //     ...filterd.map(participant => ({
    //       contact_id: participant.id,
    //       meeting_id: meeting.id,
    //     })),
    //     {
    //       user_id: userId,
    //       meeting_id: meeting.id,
    //     }
    //   ],
    //   supabase
    // )

    return meeting
  } catch (error) {
    throw error
  }
}

function normalizeParticipants(participants = []) {
  return participants.map(p => {
    if (p.contacts) {
      return {
        id: p.id,
        type: 'contact',
        contact_id: p.contacts.id,
        name: p.contacts.name,
        email: p.contacts.email,
        phone: p.contacts.phone,
        role: p.role,
        status: p.status,
      }
    }

    if (p.users) {
      return {
        id: p.id,
        type: 'user',
        user_id: p.users.id,
        name: p.users.name,
        phone: p.users.phone,
        role: p.role,
        status: p.status,
      }
    }

    return null
  }).filter(Boolean)
}