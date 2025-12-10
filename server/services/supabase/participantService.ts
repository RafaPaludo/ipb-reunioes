import { supabaseAdmin } from './client'

/**
 * Recupera os participantes da reunião, pega o telefone do participante se for tanto um usuário quanto um contato.
 */
export async function getParticipantsFromMeeting (meetingId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("meeting_participants")
      .select(`
        id,
        contact_id,
        user_id,
        contacts(phone),
        users(phone)`
      )
      .eq("meeting_id", meetingId)

    if (error) {
      console.error('[getParticipantsFromMeeting] Erro ao buscar os participantes da reunião <' + meetingId + '>:', error)
      return []
    }

    console.log(`[getParticipantsFromMeeting] 👥 ${data?.length || 0} participantes encontrados.`)
    return data || []
  } catch (err) {
    console.error('[getParticipantsFromMeeting] Erro inesperado:', err)
    return []
  }
}