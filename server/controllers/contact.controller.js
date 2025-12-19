import {
  insertContactService,
  getAllContactsByUserService,
} from '../services/contact/service.js'

export async function insertContactController({ payload, userId, supabase }) {
  try {
    return await insertContactService({
      payload,
      userId,
      supabase,
    })
  } catch (error) {
    if (error.message === 'VALIDATION_ERROR') {
      throw createError({ statusCode: 400, statusMessage: 'Nome, email e telefone são obrigatórios.' })
    }

    throw createError({ statusCode: 400, statusMessage: error.message })
  }
}

export async function getAllContactsByUserController({ userId, supabase }) {
  try {
    return await getAllContactsByUserService({
      userId,
      supabase,
    })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }
}