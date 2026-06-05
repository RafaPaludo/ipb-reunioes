import {
  createMeetingWithSetupService,
  getMeetingAtTimeService,
  updateMeetingStatusService,
  getMeetingService,
  updateMeetingService,
} from '../services/meeting/service'

export async function createMeetingWithSetupController({ payload, userId, supabase }) {
  try {
    return await createMeetingWithSetupService({
      payload,
      userId,
      supabase,
    })
  } catch (error) {
    if (error.message === 'INVALID_PAYLOAD') {
      throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
    }

    console.error('Falha inesperada no updateMeetingService:', error);
    throw createError({ statusCode: 500, statusMessage: 'Erro interno no servidor.' })
  }
}

export async function getMeetingAtTimeController({ startUTC, endUTC, userId, supabase }) {
  try {
    return await getMeetingAtTimeService({
      startUTC,
      endUTC,
      userId,
      supabase,
    })
  } catch (error) {
    if (error.message === 'INVALID_DATE') {
      throw createError({ statusCode: 400, statusMessage: 'Datas final e inicial erradas.' })
    }

    throw createError({ statusCode: 400, statusMessage: error.message })
  }
}

export async function updateMeetingStatusController({ payload, userId, meetingId, supabase }) {
  try {
    return await updateMeetingStatusService({
      payload,
      meetingId,
      userId,
      supabase,
    })
  } catch (error) {
    if (error.message === 'INVALID_STATUS') {
      throw createError({ statusCode: 400, statusMessage: 'Status informado é inválido.' })
    }

    throw createError({ statusCode: 400, statusMessage: error.message })
  }
}

export async function updateMeetingController({ payload, userId, meetingId, supabase }) {
  try {
    return await updateMeetingService({
      payload,
      meetingId,
      userId,
      supabase,
    })
  } catch (error) {
    if (error.message === 'INVALID_PAYLOAD') {
      throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
    }

    throw createError({ statusCode: 400, statusMessage: error.message })
  }
}

export async function getMeetingController({ query, userId, meetingId, supabase }) {
  try {
    return await getMeetingService({
      query,
      userId,
      meetingId,
      supabase
    })
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      throw createError({ statusCode: 404, statusMessage: 'Reunião não encontrada' })
    }

    if (error.message === 'FORBIDDEN') {
      throw createError({ statusCode: 403, statusMessage: 'Sem permissão' })
    }

    if (error.message === 'INVALID_INCLUDE') {
      throw createError({ statusCode: 400, statusMessage: 'Include inválido' })
    }

    throw createError({ statusCode: 400, statusMessage: error.message })
  }
}