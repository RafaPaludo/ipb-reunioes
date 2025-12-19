export async function insertAgendaPoint (payload, supabase) {
  const { data, error } = await supabase
    .from('agenda_points')
    .insert(payload)
    .select()
    .single()
  
  if (error) throw error

  return data
}