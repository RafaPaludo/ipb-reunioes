import {
  createMeetingWithSetupService,
  getMeetingAtTimeService,
  updateMeetingStatusService,
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

    throw createError({ statusCode: 400, statusMessage: error.message })
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