export default function convertUCalendarDate (date = {}, time = ''){
  // Reconstrói o objeto Date a partir do UCalendar
  const baseDate = new Date(
    date.year,    // ano
    date.month - 1, // mês (0-based no JS)
    date.day       // dia
  )

  // Agora combina com o horário vindo do input="time"
  const [hours, minutes] = time.split(":").map(Number)

  if (!hours) {
    throw new Error("Formato de hora inválido!")
  }

  // Remonta o horário
  baseDate.setHours(hours, minutes, 0, 0)

  // ISO pronto para salvar no Postgres (timestamptz)
  return baseDate.toISOString()
}