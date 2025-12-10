import { CalendarDate } from '@internationalized/date'

/**
 * Converte um timestamptz (ex: "2025-10-05T14:00:00.000Z")
 * para uma string simples no formato "HH:mm",
 * compatível com o input de hora do Nuxt UI.
 */
export function toUCalendarDate(timestampz) {
  const date = new Date(timestampz)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 0 → janeiro, 11 → dezembro
  const day = date.getUTCDate();
  
  return toCalendarDate({ year, month, day })
}


function toCalendarDate({ year, month, day }) {
  return new CalendarDate(year, month, day)
}
