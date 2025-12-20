export async function insertParticipants(payload, supabase) {
  const { error } = await supabase
    .from('meeting_participants')
    .insert(payload)

  if (error) throw error
}