export async function findMeetingById(meetingId, supabase) {
  const { data } = await supabase
    .from('meetings')
    .select('id, created_by')
    .eq('id', meetingId)
    .single()

  return data
}

export async function insertMeeting(payload, supabase) {
  const { data, error } = await supabase
    .from('meetings')
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteMeetingById(meetingId, supabase) {
  await supabase
    .from('meetings')
    .delete()
    .eq('id', meetingId)
}