import {
  insertContactService,
  getAllContactsByUserService,
  updateContactByUserService,
  getContactByUserService,
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

export async function updateContactByUserController({ userId, supabase, contactId, payload }) {
  try {
    return await updateContactByUserService({
      userId,
      supabase,
      payload,
      contactId,
    })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }
}

export async function getContactByUserController({ userId, contactId, supabase }) {
  try {
    return await getContactByUserService({
      contactId,
      userId,
      supabase,
    })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }
}