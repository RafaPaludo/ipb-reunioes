/**
 * Converte um timestamptz (ex: "2025-10-05T14:00:00.000Z")
 * para uma string simples no formato "HH:mm",
 * compatível com o input de hora do Nuxt UI.
 */
export function convertTimestampToTimeStringWithTZ(timestamp, tz = 'America/Sao_Paulo') {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return formatter.format(date)
}
