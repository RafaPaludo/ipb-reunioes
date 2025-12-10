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
        contacts(
          id,
          name,
          email,
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
    data.meeting_participants = data.meeting_participants
      .filter((p) => p.contacts !== null)
      .map((p) => ({
        user_id: p.id,
        id: p.contacts.id,
        email: p.contacts.email,
        phone: p.contacts.phone,
        name: p.contacts.name,
        created_at: p.contacts.created_at
      }))
  }

  return data
})
