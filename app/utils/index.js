export function formatPhoneNumber(phone) {
  return "+55" + phone
}

/**
 * Remove caracteres não numéricos e normaliza para apenas os dígitos.
 * Exemplo: "+55 (99) 9 9999-9999" → "99999999999"
 */
export function normalizePhoneNumber(phone) {
  return phone
    .replace('+55', '') // só mantém números
}

/**
 * Formata um número de celular brasileiro (11 dígitos).
 * Exemplo: "99999999999" → "(99) 9 9999-9999"
 */
export function unFormatPhoneNumber(phone) {
  const digits = normalizePhoneNumber(phone)

  console.log(digits)

  if (digits.length !== 11) return phone // retorna como está se não tiver 11 dígitos

  const ddd = digits.slice(0, 2)
  const first = digits.slice(2, 3)
  const middle = digits.slice(3, 7)
  const last = digits.slice(7)

  return `(${ddd}) ${first} ${middle}-${last}`
}