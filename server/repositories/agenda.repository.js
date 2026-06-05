// Get
export async function findAgendaById(agendaId, supabase) {
  const { data } = await supabase
    .from('meeting_agendas')
    .select('id, meeting_id')
    .eq('id', agendaId)
    .single()

  return data
}

export async function findAgendasIdByMeetingId(meetingId, supabase) {
  const { data } = await supabase
    .from('meeting_agendas')
    .select('id')
    .eq('meeting_id', meetingId)

  return data
}

// Create
export async function insertAgendas(payload, supabase) {
  const { error } = await supabase
    .from('meeting_agendas')
    .insert(payload)

  if (error) throw error
}

// Update
export async function updateAgenda(agendaId, payload, supabase) {
  const { error } = await supabase
    .from('meeting_agendas')
    .update(payload)
    .eq('id', agendaId)

  if (error) throw error
}

// Delete
export async function deleteAgendaById(agendaId, supabase) {
  const { data, error } = await supabase
    .from('meeting_agendas')
    .delete()
    .eq('id', agendaId)

  if (error) throw error

  return data
}