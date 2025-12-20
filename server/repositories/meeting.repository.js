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

export async function findMeetingByTimeRange({ startUTC, endUTC, userId }, supabase) {
  const { data, error } = await supabase
    .from('meetings')
    .select('id, title, start_time, location')
    .gte('start_time', startUTC)
    .lte('start_time', endUTC)
    .order('start_time', { ascending: true })
    .eq('created_by', userId) // 🔒 só contatos do usuário logado    

  if (error) throw error

  return data
}