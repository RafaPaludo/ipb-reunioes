import { findMeetingPdfData, updateMeetingPdfPath } from '../../repositories/meeting.repository'
import { createSignedMeetingPdfUrl, uploadMeetingPdf } from '../../repositories/storage.repository'
import { buildMeetingPdf } from '../../pdf/templates/meeting-summary.template'

export async function generateMeetingPdfService({ meetingId, userId, supabase }) {
  const meeting = await findMeetingPdfData({ meetingId, userId, supabase })

  if (!meeting) {
    throw new Error('NOT_FOUND')
  }

  if (meeting.pdf_path) {
    return await createSignedMeetingPdfUrl({
      filePath: meeting.pdf_path,
      supabase
    })
  }

  const pdfBuffer = await buildMeetingPdf(meeting)

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

  return await createSignedMeetingPdfUrl({
    filePath,
    supabase
  })
}