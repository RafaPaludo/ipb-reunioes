import { supabaseAdmin } from './client'

/**
 * Recupera uma reunião específica juntamente com suas pautas.
 * 
 * @param meetingId - ID da reunião
 * @returns Objeto da reunião ou null em caso de erro
 */
export async function getMeetingWithAgendas(meetingId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('meetings')
      .select(`
        title,
        meeting_type,
        location,
        meeting_url,
        start_time,
        meeting_agendas(title)
      `)
      .eq('id', meetingId)
      .single()

    if (error) {
      console.error(`[getMeetingWithAgendas] Erro ao buscar reunião ${meetingId}:`, error)
      return null
    }

    if (!data) {
      console.warn(`[getMeetingWithAgendas] Nenhuma reunião encontrada com ID ${meetingId}`)
      return null
    }

    console.log(`[getMeetingWithAgendas] Reunião ${meetingId} carregada com sucesso`)
    return data

  } catch (err) {
    console.error(`[getMeetingWithAgendas] Erro inesperado ao buscar reunião ${meetingId}:`, err)
    return null
  }
}
