import { findMeetingPdfData, updateMeetingPdfPath } from '../../repositories/meeting.repository'
import { createSignedStorageUrl, uploadMeetingPdf } from '../../repositories/storage.repository'
import { buildMeetingSummaryPdf } from '../../pdf/templates/meeting-summary.template'

/**
 * Gera o PDF de uma reunião e retorna uma URL temporária de acesso.
 *
 * Fluxo:
 * 1. Busca os dados necessários para o PDF.
 * 2. Retorna uma URL assinada caso o PDF já exista.
 * 3. Gera o PDF em memória.
 * 4. Faz upload para o Storage.
 * 5. Salva o caminho do arquivo na reunião.
 * 6. Retorna uma nova URL assinada.
 */
export async function generateMeetingPdfService({ meetingId, userId, supabase }) {
  const meeting = await findMeetingPdfData({ meetingId, userId, supabase })
  const expiresIn = 60 * 60 * 24 // 24 Horas
  const bucket = 'meetings_pdf'

  if (!meeting) {
    throw new Error('NOT_FOUND')
  }

  if (meeting.pdf_path) {
    return await createSignedStorageUrl({
      bucket,
      filePath: meeting.pdf_path,
      supabase,
      expiresIn
    })
  }

  const pdfBuffer = await buildMeetingSummaryPdf(meeting)

  const filePath = await uploadMeetingPdf({
    meetingId,
    buffer: pdfBuffer,
    supabase
  })

  await updateMeetingPdfPath({
    meetingId,
    filePath,
    supabase
  })

  return await createSignedStorageUrl({
    bucket,
    filePath,
    supabase,
    expiresIn
  })
}