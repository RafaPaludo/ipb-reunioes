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

export async function updateMeetingById({ payload, meetingId, userId }, supabase) {
  const { data, error } = await supabase
    .from('meetings')
    .update(payload)
    .eq('id', meetingId)
    .eq('created_by', userId) // 🔒 só reuniões do usuário logado
    .select()
    .single() 

  if (error) throw error

  return data
}

export async function findMeetingByIdWithIncludes({
  meetingId,
  userId,
  includes,
  supabase
}) {
  let select = `
    id,
    attachment_url,
    end_time,
    start_time,
    location,
    meeting_url,
    title,
    meeting_type,
    meeting_status
  `

  if (includes.includes('participants')) {
    select += `,
      meeting_participants(
        id,
        role,
        status,
        contacts(id, name, email, phone, created_at),
        users(id, name, phone, created_at)
      )
    `
  }

  if (includes.includes('agendas')) {
    select += `,
      meeting_agendas(
        *,
        agenda_points(*)
      )
    `
  }

  const { data, error } = await supabase
    .from('meetings')
    .select(select)
    .eq('id', meetingId)
    .eq('created_by', userId)
    .single()

  if (error) throw error

  return data
}

export async function findMeetingPdfData({ meetingId, userId, supabase }) {
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      title,
      start_time,
      end_time,
      meeting_status,
      pdf_path,
      meeting_participants(
        contacts( name ),
        users( name )
      ),
      meeting_agendas(
        id,
        title,
        content,

        agenda_points(
          id,
          content,
          status,
          due_date,

          meeting_participants:participant_id(
            id,
            contacts( name ),
            users( name )
          )
        )
      )
    `)
    .eq('id', meetingId)
    .eq('created_by', userId)
    .single()

  if (error) throw error

  return data
}

export async function updateMeetingPdfPath({
  meetingId,
  filePath,
  supabase
}) {
  const { error } = await supabase
    .from('meetings')
    .update({
      pdf_path: filePath
    })
    .eq('id', meetingId)

  if (error) throw error
}