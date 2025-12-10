import { sendWhatsappTwilio } from '../services/twilioWhatsapp'

export async function sendWhatsapp(phone: string, message: string) {
  // Descomentar para enviar para o Twilio
  // if (process.env.WHATSAPP_PROVIDER === 'twilio') {
  //   return sendWhatsappTwilio(phone, message)
  // }
}