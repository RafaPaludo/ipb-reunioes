import { insertAgendaPointsService } from '../services/agenda-points/service.js'

export async function insertAgendaPointsController({ payload, userId, supabase }) {
  try {
    return await insertAgendaPointsService({
      payload,
      userId,
      supabase,
    })
  } catch (error) {
    if (error.message === 'AGENDA_NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Agenda não encontrada.' })
    }

    if (error.message === 'FORBIDDEN') {
      throw createError({ statusCode: 403, statusMessage: 'Sem permissão para criar um encaminhamento.' })
    }

    if (error.message === 'VALIDATION_ERROR') {
      throw createError({ statusCode: 400, statusMessage: 'agenda_id e content são obrigatórios.' })
    }

    throw createError({ statusCode: 400, statusMessage: error.message })
  }
}