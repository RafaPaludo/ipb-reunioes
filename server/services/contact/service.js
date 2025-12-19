import { 
  insertContact,
  getAllContactsByUser,
  updateContactByUser,
} from '../../repositories/contact.repository'

export async function insertContactService({ payload, userId, supabase }) {
  const { name, email, phone } = payload

  if (!name || !email || !phone) {
    throw new Error('VALIDATION_ERROR')
  }

  return await insertContact(
    {
      name,
      email,
      phone,
      user_id: userId
    },
    supabase
  )
}

export async function getAllContactsByUserService({ userId, supabase }) {
  return await getAllContactsByUser(userId, supabase)
}

export async function updateContactByUserService({ userId, supabase, contactId, payload }) {
  return await updateContactByUser(payload, contactId, userId, supabase)
}