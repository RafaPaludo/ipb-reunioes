/**
 * Converte um timestamptz (ex: "2025-10-05T14:00:00.000Z")
 * para formato de data e hora padrão 05/10/2025 brasileiro
 */
export function convertTimeStampzToLocalDate (timestampz, format = 'pt-BR') {
 return new Date(timestampz).toLocaleDateString(format)
}
