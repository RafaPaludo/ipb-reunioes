export async function findMeetingById(meetingId, supabase) {
  const { data } = await supabase
    .from('meetings')
    .select('id, created_by')
    .eq('id', meetingId)
    .single()

  return data
}