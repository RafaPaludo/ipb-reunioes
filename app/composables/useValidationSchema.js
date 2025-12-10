import { z } from 'zod'

/**
 * Mensagens de validação centralizadas
 * Fácil de traduzir ou ajustar depois
 */
const messages = {
  required: (field) => `${field} é obrigatório`,
  invalidEmail: 'E-mail inválido',
  minLength: (n) => `Precisa conter no mínimo ${n} caracteres`,
  maxLength: (n) => `Pode conter no máximo ${n} caracteres`
}

/**
 * Helpers para criar campos obrigatórios
 */
function requiredString(field) {
  return z.string({ required_error: messages.required(field) })
}

function emailField(field = 'E-mail') {
  return requiredString(field).email(messages.invalidEmail)
}

function passwordField(field = 'Senha') {
  return requiredString(field).min(8, messages.minLength(8))
}

/**
 * Composable que retorna os helpers
 */
export function useValidationSchema() {
  return {
    requiredString,
    emailField,
    passwordField,
    messages
  }
}
