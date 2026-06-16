/**
 * Envia o PDF da reunião para o bucket privado do Supabase Storage.
 *
 * O arquivo é salvo no formato:
 * meetings/{meetingId}/resumo.pdf
 *
 * Retorna o caminho persistido do arquivo.
 */
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

/**
 * Gera uma URL temporária para acesso a um arquivo privado.
 *
 * A URL expira após o tempo configurado em `expiresIn`.
 */
export async function createSignedStorageUrl({ 
  bucket,
  filePath,
  expiresIn = 60 * 60 * 24, // 24 Horas
  supabase
}) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(
      filePath,
      expiresIn
    )

  if (error) throw error

  return data.signedUrl
}