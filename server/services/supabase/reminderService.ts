import { supabaseAdmin } from './client'

/**
 * Recupera a lista dos lembretes com status 'pending' e data de envio menor ou igual a agora.
 */
export async function getPendingReminders() {
  try {
    const { data, error } = await supabaseAdmin
      .from('reminders')
      .select('*')
      .eq('reminder_status', 'pending')
      .lte('remind_at', new Date().toISOString())

    if (error) {
      console.error('[getPendingReminders] Erro ao buscar lembretes:', error)
      return []
    }

    console.log(`[getPendingReminders] ${data?.length || 0} lembretes encontrados`)
    return data || []
  } catch (err) {
    console.error('[getPendingReminders] Erro inesperado:', err)
    return []
  }
}

/**
 * Atualiza o status de um lembrete para 'sent'
 */
export async function markReminderAsSent(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('reminders')
      .update({
        reminder_status: 'sent',
        send_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error(`[markReminderAsSent] Erro ao atualizar lembrete ${id}:`, error)
      return false
    }

    console.log(`[markReminderAsSent] Lembrete ${id} atualizado como 'sent'`)
    return true
  } catch (err) {
    console.error(`[markReminderAsSent] Erro inesperado para ${id}:`, err)
    return false
  }
}
