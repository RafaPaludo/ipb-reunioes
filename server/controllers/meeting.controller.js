import { createMeetingWithSetupService } from '../services/meeting/service'

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