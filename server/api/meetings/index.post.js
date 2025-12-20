import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createMeetingWithSetupController } from '../../controllers/meeting.controller'

/**
 * Faz a criação da reunião com os dados inseridos no formulário da reunião.
 * Faz a criação dos participantes da reunião.
 * Faz a criação das pautas da reunião.
 * Faz a criação dos lembretes da reunião.
 */
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const body = await readBody(event)
  const supabase = await serverSupabaseClient(event)

  return createMeetingWithSetupController({
    payload: body,
    userId: user.sub,
    supabase,
  })
})