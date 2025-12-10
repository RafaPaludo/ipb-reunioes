import { defineCronHandler } from '#nuxt/cron'
import { sendWhatsapp } from '../utils/whatsapp'
import { getPendingReminders, markReminderAsSent } from '../services/supabase/reminderService'
import { getParticipantsFromMeeting } from '../services/supabase/participantService'
import { getMeetingWithAgendas } from '../services/supabase/meetingService'
import { mountMessageToSend } from '../utils/message/reminderMessage'

export default defineCronHandler('everyMinute', async () => {
  const startTime = new Date().toISOString()
  console.log(`🔔 [CRON] Execução iniciada às ${startTime}`)

  try {
    // 1️⃣ Busca lembretes pendentes
    const reminders = await getPendingReminders()

    if (!reminders?.length) {
      console.log("ℹ️ Nenhum lembrete pendente no momento.")
      return
    }

    // 2️⃣ Itera sobre cada lembrete
    for (const reminder of reminders) {
      console.log(`➡️ Processando lembrete ID: ${reminder.id} (Reunião: ${reminder.meeting_id})`)

      // Participantes
      const participants = await getParticipantsFromMeeting(reminder.meeting_id)
      if (!participants?.length) {
        console.warn(`⚠️ Nenhum participante encontrado para a reunião ${reminder.meeting_id}`)
        continue
      }

      // Dados da reunião
      const meeting = await getMeetingWithAgendas(reminder.meeting_id)
      if (!meeting) {
        console.warn(`⚠️ Reunião ${reminder.meeting_id} não encontrada.`)
        continue
      }

      // Monta mensagem
      const message = mountMessageToSend(meeting, reminder.reminder_stage)

      // Telefones únicos
      const uniquePhones = [
        ...new Set(participants.map(p => p.contacts?.phone || p.users?.phone).filter(Boolean))
      ]

      if (!uniquePhones.length) {
        console.warn(`⚠️ Nenhum número válido encontrado para os participantes da reunião ${reminder.meeting_id}`)
        continue
      }

      // Envia mensagens
      for (const phone of uniquePhones) {
        try {
          await sendWhatsapp(phone, message)
          console.log(`✅ Mensagem enviada para ${phone}`)
        } catch (err) {
          console.error(`❌ Falha ao enviar mensagem para ${phone}:`, err)
          // não dá "return" aqui — continua para os outros números e lembretes
          // TODO: Fazer um modo de criar failed para os contatos que não foram enviados e processar isso depois
        }
      }

      // Atualiza status do lembrete
      try {
        await markReminderAsSent(reminder.id)
        console.log(`✅ Lembrete ${reminder.id} marcado como "sent"`)
      } catch (err) {
        console.error(`⚠️ Falha ao atualizar lembrete ${reminder.id}:`, err)
      }
    }
  } catch (err) {
    console.error('💥 Erro crítico durante a execução do cron:', err)
  } finally {
    console.log(`🏁 [CRON] Execução concluída às ${new Date().toISOString()}`)
  }
})