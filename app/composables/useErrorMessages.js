import { AuthError } from '@supabase/supabase-js'

// Lista de erros customizados de autenticação (exemplo)
const supabaseErrorAuthList = [
  { code: 'invalid_credentials', translate: 'Usuário ou senha incorretos.' },
  { code: 'email_not_confirmed', translate: 'Confirme seu e-mail antes de continuar.' }
]

// Lista de erros comuns de banco (exemplo)
const supabaseErrorDbList = [
  { code: '23505', translate: 'Este registro já existe.' }, // unique_violation
  { code: '23503', translate: 'Este registro está vinculado a outro e não pode ser removido.' } // foreign_key_violation
]

function getErrorMessage(error) {
  // 1. Erros de autenticação
  if (error instanceof AuthError) {
    const mapped = supabaseErrorAuthList.find(e => e.code === error.code)
    return mapped?.translate || 'Erro de autenticação.'
  }

  // 2. Erros de banco de dados (objeto comum com code e message)
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    const mapped = supabaseErrorDbList.find(e => e.code === error.code)
    return mapped?.translate || error.message || 'Erro de banco de dados.'
  }

  // 3. Erros de rede ou TypeError
  if (error instanceof TypeError) {
    return error.message
  }

  // 4. Fallback
  return 'Ocorreu um erro inesperado.'
}

export const useErrorMessages = () => ({
  getErrorMessage
})
