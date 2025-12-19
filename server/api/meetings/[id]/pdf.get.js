import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import PDFDocument from 'pdfkit'
import getStream from 'get-stream'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const id = getRouterParam(event, 'id')

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  // Pega a reunião
  const { data: meeting, error: errorMeeting } = await client
    .from('meetings')
    .select(`
      title,
      start_time,
      end_time,
      meeting_status,
      pdf_url,
      meeting_participants(
        contacts( name ),
        users( name )
      ),
      meeting_agendas(
        id,
        title,
        content,

        agenda_points(
          id,
          content,
          status,
          due_date,

          meeting_participants:participant_id(
            id,
            contacts( name ),
            users( name )
          )
        )
      )
    `)
    .eq('id', id)
    .eq('created_by', user.sub)
    .single()
  
  if (errorMeeting) {
    throw createError({ statusCode: 400, statusMessage: errorMeeting.message })
  }

  if (meeting.pdf_url) {
    return meeting.pdf_url
  }

  /**
   * TODO::
   * - Retornar o link do PDF por padrão caso já exista.
   * - Fazer a busca de todas as informações necessárias:
   * - Subir o PDF gerado para o s3
   * - Retornar o link do PDF
   */

  const doc = new PDFDocument({ margin: 50 });
  // Set the response header to indicate a PDF file
  event.node.res.setHeader('Content-Type', 'application/pdf');
  event.node.res.setHeader('Content-Disposition', 'attachment; filename="example.pdf"');

  /*
  =======
    [CABEÇALHO]
    • Resumo da reunião
    • Instituição / Projeto
    • Data de geração
  =======
  */

  doc
    .fontSize(18)
    .text('Resumo da Reunião', { align: 'center' })
  
  doc.moveDown(1.5)
  /*
  =======
    [INFORMAÇÕES PRINCIPAIS]
    • Título da reunião
    • Data e horário
    • Status
    • Participantes
  =======
  */

  const meetingStatusTranslation = Object.freeze({
    schedule: 'Agendada',
    in_progress: 'Iniciada',
    paused: 'Pausada',
    finished: 'Finalizada',
  })

  doc
    .fontSize(11)
    .text('Título: ' + meeting.title)
    .text('Data: ' + convertTimeStampzToLocalDate(meeting.start_time))
    .text('Horário: ' + convertTimestampToTimeStringWithTZ(meeting.start_time)+ ' - ' + convertTimestampToTimeStringWithTZ(meeting.end_time))
    .text('Status: ' + meetingStatusTranslation[meeting.meeting_status])
  
  doc.moveDown()

  doc
    .text('Participantes: ')

  meeting.meeting_participants.forEach(participant => {
    doc.text(`- ${participant.users?.name || participant.contacts?.name}`)
  })

  doc.moveDown(1.5)

  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()

  doc.moveDown(1.5)

  /*
  =======
    [RESUMO GERAL] (opcional)
    • Texto curto com o objetivo da reunião
  =======
  */

  /*
  =======
    [PAUTAS E ENCAMINHAMENTOS]
    Pauta 1
      - Encaminhamento A
      - Encaminhamento B

    Pauta 2
      - Encaminhamento C
  =======
  */

  const agendaPointTranslation = Object.freeze({
    pending: 'Pendente',
    resolved: 'Resolvido'
  })

  function getParticipantName(meetingParticipant) {
    if (!meetingParticipant) return '—'

    return (
      meetingParticipant.contacts?.name ||
      meetingParticipant.users?.name ||
      '—'
    )
  }

  meeting.meeting_agendas.forEach((agenda, index) => {
    doc.moveDown()
    doc.fontSize(14).text(`${index + 1}. ${agenda.title}`)

    agenda.agenda_points.forEach(point => {
      doc
        .fontSize(11)
        .text(`- ${point.content}`, { indent: 20 })
        .text(`Responsável: ${getParticipantName(point.meeting_participants) || '-'}`, { indent: 40 })
        .text(`Status: ${agendaPointTranslation[point.status]}`, { indent: 40 })
    })
  })
  
  doc.moveDown(1.5)

  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()

  doc.moveDown(1.5)

  /*
  =======
    [RODAPÉ]
    Gerado automaticamente em {data}
  =======
  */

  doc
    .fontSize(9)
    .text(
      `Gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')}`,
      50,
      700,
      { align: 'center' }
    )

  // Finalize PDF file
  doc.end();

  // Return a response (optional, as the data is already piped)

  //
  const pdfBuffer = await getStream.buffer(doc)
  const filePath = 'meetings/' + id + '/resumo.pdf'

  const { error: uploadError } = await client.storage
    .from('meetings_pdf')
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (uploadError) {
    throw createError({ statusCode: 500, statusMessage: uploadError.message })
  }

  const { data: signedUrlData, error: signedUrlError } = await client.storage
    .from('meetings_pdf')
    .createSignedUrl(filePath, 60 * 60 * 24 * 7 ) // 7 dias

  if (signedUrlError) {
    throw createError({ statusCode: 500, statusMessage: signedUrlError.message })
  }

  const pdfUrl = signedUrlData.signedUrl

  const { data: updatePdfUrl, error: errorPdfUrl } = await client
    .from('meetings')
    .update({
      pdf_url: pdfUrl
    })
    .eq('id', id)

  if (errorPdfUrl) {
    throw createError({ statusCode: 500, statusMessage: errorPdfUrl.message })
  }

  return updatePdfUrl
});
