
/**
 * Transforma a data do formato UCalendar para o formato timestampz.
  DE: {
    "calendar": { "identifier": "gregory" },
    "era": "AD",
    "day": 17,
    "month": 12,
    "year": 2025
  }
  PARA: "2025-12-17T03:00:00.000Z"
 * 
 * 
 * @param {object} date - Data no formato UCalendar
 * @returns 
 */
export function convertUCalendarToTimeStampZ (date = {}) {
  const baseDate = new Date(
    date.year,
    date.month - 1, // mês (0-based no JS)
    date.day
  )

  return baseDate.toISOString()
}