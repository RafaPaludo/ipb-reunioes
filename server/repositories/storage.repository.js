export async function uploadMeetingPdf({ 
  meetingId,
  buffer,
  supabase
}) {
  const filePath = `meetings/${meetingId}/resumo.pdf`

  const { error, data } = await supabase.storage
    .from('meetings_pdf')
    .upload(filePath, buffer, {
      contentType: 'application/pdf',
      upsert: true
    })
  
  if (error) throw error

  return data.path
}

export async function createSignedMeetingPdfUrl({ 
  filePath,
  supabase
}) {
  const { data, error } = await supabase.storage
    .from('meetings_pdf')
    .createSignedUrl(
      filePath,
      60 * 60 * 24 // 24 horas
    )

  if (error) throw error

  return data.signedUrl
}