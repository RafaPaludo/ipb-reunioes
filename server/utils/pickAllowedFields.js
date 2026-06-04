export function pickAllowedFields(source, allowed) {
  const result = {}

  for (const key of allowed) {
    if (key in source) result[key] = source[key]
  }

  return result
}