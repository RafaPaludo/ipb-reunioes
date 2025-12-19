import { findAgendaById } from '../../repositories/agenda.repository'
import { findMeetingById } from '../../repositories/meeting.repository'
import { insertAgendaPoint } from '../../repositories/agenda-points.repository'

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