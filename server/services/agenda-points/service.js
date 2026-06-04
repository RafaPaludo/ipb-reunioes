import { findAgendaById } from '../../repositories/agenda.repository'
import { findMeetingById } from '../../repositories/meeting.repository'
import {
  insertAgendaPoint,
  findAgendaPointWithMeeting,
  updateAgendaPointById,
  deleteAgendaPointById,
} from '../../repositories/agenda-points.repository'

export async function insertAgendaPointsService({ payload, userId, supabase }) {
  const { agenda_id, content, participant_id, status, order_index, due_date } = payload

  if (!agenda_id || !content) {
    throw new Error('VALIDATION_ERROR')
  }

  const agenda = await findAgendaById(agenda_id, supabase)
  if (!agenda) {
    throw new Error('AGENDA_NOT_FOUND')
  }

  const meeting = await findMeetingById(agenda.meeting_id, supabase)
  if (!meeting || meeting.created_by !== userId) {
    throw new Error('FORBIDDEN')
  }

  const agendaPoint = await insertAgendaPoint(
    {
      agenda_id,
      content,
      participant_id: participant_id ?? null,
      status: status ?? 'pending',
      order_index: order_index ?? 0,
      due_date,
    },
    supabase
  )

  return agendaPoint
}

export async function updateAgendaPointsService({ agendaPointId, payload, userId, supabase }) {
  const agendaPoint = await findAgendaPointWithMeeting(agendaPointId, supabase)
  if (!agendaPoint) {
    throw new Error('AGENDA_POINT_NOT_FOUND')
  }

  const meetingId = agendaPoint.meeting_agendas?.meeting_id
  const meeting = await findMeetingById(meetingId, supabase)

  if (!meeting || meeting.created_by !== userId) {
    throw new Error('FORBIDDEN')
  }

  const allowedFields = [
    'content',
    'status',
    'participant_id',
    'order_index',
    'due_date',
  ]

  const updatePayload = {}

  for (const field of allowedFields) {
    if (field in payload) {
      updatePayload[field] = payload[field]
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error('NO_VALID_FIELDS')
  }

  return updateAgendaPointById(
    agendaPointId,
    updatePayload,
    supabase
  )
}

export async function deleteAgendaPointsService({ agendaPointId, userId, supabase }) {
  const agendaPoint = await findAgendaPointWithMeeting(agendaPointId, supabase)
  if (!agendaPoint) {
    throw new Error('AGENDA_POINT_NOT_FOUND')
  }

  const meetingId = agendaPoint.meeting_agendas?.meeting_id
  const meeting = await findMeetingById(meetingId, supabase)

  if (!meeting || meeting.created_by !== userId) {
    throw new Error('FORBIDDEN')
  }

  return deleteAgendaPointById(
    agendaPointId,
    supabase
  )
}