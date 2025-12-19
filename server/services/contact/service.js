import { insertContact } from '../../repositories/contact.repository'

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