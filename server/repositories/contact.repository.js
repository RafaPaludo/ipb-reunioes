export async function insertContact(payload, supabase) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getAllContactsByUser(userId, supabase) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId) // 🔒 só contatos do usuário logado

  if (error) throw error

  return data
}