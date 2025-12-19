import { findAgendaById, updateAgenda } from '../../repositories/agenda.repository'
import { findMeetingById } from '../../repositories/meeting.repository'
import { pickAllowedFields } from '../../utils/pickAllowedFields'

export async function updateAgendaService({ agendaId, payload, userId, supabase }) {
  const agenda = await findAgendaById(agendaId, supabase)

  if (!agenda) {
    throw new Error('AGENDA_NOT_FOUND')
  }

  const meeting = await findMeetingById(agenda.meeting_id, supabase)
  if (!meeting || meeting.created_by !== userId) {
    throw new Error('FORBIDDEN')
  }

  const allowedFields = ['title', 'content', 'summary', 'order_index']
  const cleanPayload = pickAllowedFields(payload, allowedFields)

  if (Object.keys(cleanPayload).length === 0) {
    throw new Error('NO_VALID_FIELDS')
  }

  await updateAgenda(agendaId, cleanPayload, supabase)
}