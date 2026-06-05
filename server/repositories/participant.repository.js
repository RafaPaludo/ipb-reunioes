// GET
export async function findParticipantsIdByMeetingId(meetingId, supabase) {
  const { data } = await supabase
    .from('meeting_participants')
    .select('id')
    .eq('meeting_id', meetingId)

  return data
}

// CREATE
export async function insertParticipants(payload, supabase) {
  const { error } = await supabase
    .from('meeting_participants')
    .insert(payload)

  if (error) throw error
}

// DELETE
export async function deleteParticipants(participantId, supabase) {
  const { data, error } = await supabase
    .from('meeting_participants')
    .delete()
    .eq('id', participantId)

  if (error) throw error

  return data
}