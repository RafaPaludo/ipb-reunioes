export async function findAgendaById(agendaId, supabase) {
  const { data } = await supabase
    .from('meeting_agendas')
    .select('id, meeting_id')
    .eq('id', agendaId)
    .single()

  return data
}

export async function updateAgenda(agendaId, payload, supabase) {
  const { error } = await supabase
    .from('meeting_agendas')
    .update(payload)
    .eq('id', agendaId)

  if (error) throw error
}