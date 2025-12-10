import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
/*
  Faz a listagem das reuniões tabela **contacts** em um determinado período
*/
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const id = getRouterParam(event, 'id')

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const { data, error } = await client
    .from('meetings')
    .select(`
      id,
      attachment_url,
      end_time,
      start_time,
      location,
      meeting_url,
      title,
      meeting_type,
      meeting_participants(
        id,
        contacts(
          id,
          name,
          email,
          phone,
          created_at
        )
      ),
      meeting_agendas(*)
    `)
    .eq('id', id)
    .eq('created_by', user.sub)
    .single()

  // 🔍 Filtra os participantes que estão em contacts e não são o usuário atual
  data.meeting_participants = (data.meeting_participants || [])
    .filter((participant) => participant.contacts !== null)
    .map((participant) => {
      return {
        user_id: participant.id,
        id: participant.contacts.id,
        email: participant.contacts.email,
        phone: participant.contacts.phone,
        name: participant.contacts.name,
        created_at: participant.contacts.created_at,
      }
    })

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return data
})
