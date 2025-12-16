import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const id = getRouterParam(event, 'id')

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  // ❗ Lê os includes: agendas, participants, agenda_points, etc.
  const query = getQuery(event)
  const include = (query.include || '')
    .split(',')
    .map(i => i.trim())
    .filter(Boolean)

  // --------------------------------------------
  // 🧱 1) Base SELECT sempre presente
  // --------------------------------------------
  let select = `
    id,
    attachment_url,
    end_time,
    start_time,
    location,
    meeting_url,
    title,
    meeting_type
  `

  // --------------------------------------------
  // 👥 2) Include participants
  // --------------------------------------------
  if (include.includes('participants')) {
    select += `,
      meeting_participants(
        id,
        role,
        status,
        contacts(
          id,
          name,
          email,
          phone,
          created_at
        ),
        users(
          id,
          name,
          phone,
          created_at
        )
      )
    `
  }

  // --------------------------------------------
  // 🟢 4) Include agendas ou agenda_points (encaminhamentos)
  // Assumindo tabela meeting_agenda_points
  // --------------------------------------------
  if (include.includes('agendas')) {
    select += `,
      meeting_agendas(
        *,
        agenda_points(*)
      )
    `
  }

  // --------------------------------------------
  // 🔍 5) Faz a query final
  // --------------------------------------------
  const { data, error } = await client
    .from('meetings')
    .select(select)
    .eq('id', id)
    .eq('created_by', user.sub)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  // --------------------------------------------
  // 🧹 6) Normaliza participantes (se carregados)
  // --------------------------------------------
  if (include.includes('participants') && data.meeting_participants) {
    data.meeting_participants = (data.meeting_participants || []).map((participant) => {
      // Participante vindo de contacts
      if (participant.contacts) {
        return {
          id: participant.id,
          type: 'contact',
          contact_id: participant.contacts.id,
          name: participant.contacts.name,
          email: participant.contacts.email,
          phone: participant.contacts.phone,
          created_at: participant.contacts.created_at,
          role: participant.role,
          status: participant.status,
        }
      }

      // Participante vindo de users
      if (participant.users) {
        return {
          id: participant.id,
          type: 'user',
          user_id: participant.users.id,
          name: participant.users.name,
          phone: participant.users.phone,
          created_at: participant.users.created_at,
          role: participant.role,
          status: participant.status,
        }
      }

      return null
    }).filter(Boolean)
  }

  return data
})
