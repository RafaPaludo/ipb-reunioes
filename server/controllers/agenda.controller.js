import { updateAgendaService } from '../services/agenda/service.js'

export async function updateAgendaController ({ agendaId, userId, payload, supabase }) {
  try {
    await updateAgendaService({
      agendaId,
      payload,
      userId,
      supabase,
    })

    return { ok: true }
  } catch (error) {
    if (error.message === 'AGENDA_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Agenda não encontrada.' })
    }

    if (error.message === 'FORBIDDEN') {
      throw createError({ statusCode: 403, statusMessage: 'Sem permissão para alterar esta pauta.' })
    }

    throw createError({ statusCode: 400, statusMessage: error.message })
  }
}