import type { MeetingWithAgendas, Reminder } from '../../types/index'

export function mountMessageToSend (meeting: MeetingWithAgendas, reminderStage: Reminder['reminder_stage']) {
  switch (reminderStage) {
    case 'first':
      return firstReminder(meeting)

    case 'second':
      return secondReminder(meeting)

    case 'third':
      return thirdReminder(meeting)
  
    default:
      return firstReminder(meeting)
  }
}

export function firstReminder (meeting: MeetingWithAgendas) {
  const locationOrLinkURL =  `${meeting.meeting_type === "online" ?
    `🔗 Link: ${meeting.meeting_url}` :
    `📍 Local: ${meeting.location}`}`
  const agendas = meeting.meeting_agendas
    .reduce((acc, agenda, idx) => acc + `\t ${idx + 1}. ${agenda.title}\n`, '')

  return`
  📌 Reunião: ${meeting.title}\n
  🕒 Dia: ${new Date(meeting.start_time).toLocaleString("pt-BR")}\n
  📋 Modalidade: ${meeting.meeting_type}\n
  ${locationOrLinkURL}\n
  📋 Pautas: \n${agendas}
  `
}

export function secondReminder (meeting: MeetingWithAgendas) {
  const locationOrLinkURL =  `${meeting.meeting_type === "online" ?
    `🔗 Link: ${meeting.meeting_url}` :
    `📍 Local: ${meeting.location}`}`
  const agendas = meeting.meeting_agendas
    .reduce((acc, agenda, idx) => acc + `\t ${idx + 1}. ${agenda.title}\n`, '')

  return`
  📌 Reunião: ${meeting.title}\n
  🕒 Dia: ${new Date(meeting.start_time).toLocaleString("pt-BR")}\n
  ↔️  Modalidade: ${meeting.meeting_type}\n
  ${locationOrLinkURL}\n
  📋 Pautas: \n${agendas}\n
  📎 Anexos: Arquivo anexo
  `
}

export function thirdReminder (meeting: MeetingWithAgendas) {
  const locationOrLinkURL =  `${meeting.meeting_type === "online" ?
    `🔗 Link: ${meeting.meeting_url}` :
    `📍 Local: ${meeting.location}`}`
  const agendas = meeting.meeting_agendas
    .reduce((acc, agenda, idx) => acc + `\t ${idx + 1}. ${agenda.title}\n`, '')

  return`
  📌 Reunião: ${meeting.title}\n
  🕒 Dia: ${new Date(meeting.start_time).toLocaleString("pt-BR")}\n
  ↔️  Modalidade: ${meeting.meeting_type}\n
  ${locationOrLinkURL}\n
  📋 Pautas: \n${agendas}\n
  📎 Anexos: Arquivo anexo
  `
}