import Twilio from 'twilio'

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = Twilio(accountSid, authToken);
const FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886' // sandbox


/**
 * O número do Twilio envia a mensagem para o telefone desejado.
 * O telefone precisa vir no formato +559999999999 (sem aquele primeiro 9) -> virar "whatsapp:+55...
 * @returns 
 */
export async function sendWhatsappTwilio(to: string, body: string) {
  const toWhatsapp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  const msg = await client.messages.create({
    from: FROM,
    to: toWhatsapp,
    body
  })
  
  return msg
}