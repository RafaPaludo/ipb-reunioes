import PDFDocument from 'pdfkit'
import getStream from 'get-stream'

export async function buildMeetingPdf(meeting) {
  const doc = new PDFDocument({ margin: 50 })
  // Adiciona informações no header que é um PDF
  // event.node.res.setHeader('Content-Type', 'application/pdf');
  // event.node.res.setHeader('Content-Disposition', 'attachment; filename="example.pdf"');
  
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

  doc.end()

  return await getStream.buffer(doc)
}