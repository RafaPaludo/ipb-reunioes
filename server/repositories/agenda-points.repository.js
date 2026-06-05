// GET
export async function findAgendaPointWithMeeting(agendaPointId, supabase) {
  const { data, error } = await supabase
    .from('agenda_points')
    .select(`
      id,
      agenda_id,
      meeting_agendas (
        meeting_id
      )
    `)
    .eq('id', agendaPointId)
    .single()

  if (error) throw error

  return data
}

// CREATE
export async function insertAgendaPoint (payload, supabase) {
  const { data, error } = await supabase
    .from('agenda_points')
    .insert(payload)
    .select()
    .single()
  
  if (error) throw error

  return data
}

// UPDATE
export async function updateAgendaPointById(agendaPointId, payload, supabase) {
  const { data, error } = await supabase
    .from('agenda_points')
    .update(payload)
    .eq('id', agendaPointId)
    .select()
    .single()

  if (error) throw error

  return data
}

// DELETE
export async function deleteAgendaPointById(agendaPointId, supabase) {
  const { data, error } = await supabase
    .from('agenda_points')
    .delete()
    .eq('id', agendaPointId)

  if (error) throw error

  return data
}

export async function deleteAgendaPointByAgendaId(agendaId, supabase) {
  const { data, error } = await supabase
    .from('agenda_points')
    .delete()
    .eq('agenda_id', agendaId)

  if (error) throw error

  return data
}