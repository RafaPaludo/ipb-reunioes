export async function insertContact(payload, supabase) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  return data
}