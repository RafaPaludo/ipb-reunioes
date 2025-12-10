import { z } from 'zod'

const { emailField, requiredString } = useValidationSchema()

export const profileSchema = z.object({
  name: requiredString('Nome').min(2, "Nome deve possuir ao menos 2 letras."),
  email: emailField(),
  phone: requiredString('Telefone').min(10, "Deve possuir ao menos 10 números."),
  avatar: z.string().optional(),
  bio: z.string().optional()
})